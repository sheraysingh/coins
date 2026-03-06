"""
intelligence/strategy_extractor.py
Feeds raw Skool content through Claude API to extract structured
trading strategies, coin picks, and risk rules from coinpicksgenesis.
Saves output to intelligence/extracted_strategies.json.
"""

import os
import json
import logging
from pathlib import Path
from datetime import datetime
import anthropic
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
RAW_DIR = Path(__file__).parent / "raw"
OUTPUT_FILE = Path(__file__).parent / "extracted_strategies.json"
CHUNK_SIZE = 6000  # chars per Claude call — stays well within context

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [EXTRACTOR] %(levelname)s — %(message)s",
    handlers=[
        logging.FileHandler(Path(__file__).parent.parent / "logs" / "strategy_extractor.log"),
        logging.StreamHandler()
    ]
)
log = logging.getLogger(__name__)

EXTRACTION_PROMPT = """You are analyzing content from a crypto trading education community called CoinPicksGenesis.

Your job: extract every distinct trading strategy, method, or teaching from the text below.

For each strategy or teaching found, output a JSON object with these fields:
- "name": short name for the strategy (e.g. "BTC Dominance Reversal Play")
- "source_type": "classroom" or "community"
- "description": 2–3 sentence plain-English explanation of what the strategy does
- "entry_rules": list of specific conditions required to enter a trade
- "exit_rules": list of specific conditions to exit (take profit + stop loss)
- "indicators": list of indicators or tools mentioned (e.g. RSI, EMA, BTC.D, funding rate)
- "timeframe": trading timeframe if mentioned (e.g. "4H", "Daily", "swing")
- "coins_mentioned": specific coins or sectors mentioned in context of this strategy
- "risk_rules": any position sizing, stop loss %, or risk management rules stated
- "key_quote": the most important single sentence from the source text that captures the core idea
- "confidence": how clearly this is a defined strategy vs. general commentary — "high" / "medium" / "low"

Output a JSON array. If no clear strategies are found in the text, return an empty array [].
Do not invent details not present in the source text. If a field has no data, use null.

SOURCE TEXT:
{content}"""


def load_latest_raw(label: str) -> list[dict]:
    """Load the most recently scraped raw file for classroom or community."""
    files = sorted(RAW_DIR.glob(f"{label}_*.json"), reverse=True)
    if not files:
        log.warning(f"No raw {label} files found in {RAW_DIR}")
        return []
    log.info(f"Loading {files[0].name}")
    with open(files[0], encoding="utf-8") as f:
        return json.load(f)


def chunk_text(text: str, size: int = CHUNK_SIZE) -> list[str]:
    """Split long text into overlapping chunks for Claude processing."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunks.append(text[start:end])
        start = end - 500  # 500-char overlap to avoid cutting mid-strategy
    return chunks


def extract_from_chunk(client: anthropic.Anthropic, content: str, source_type: str) -> list[dict]:
    """Send one chunk to Claude and parse the returned strategy array."""
    prompt = EXTRACTION_PROMPT.format(content=content)
    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        raw_text = response.content[0].text.strip()

        # Extract JSON array from response (Claude may wrap it in markdown)
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_text:
            raw_text = raw_text.split("```")[1].split("```")[0].strip()

        strategies = json.loads(raw_text)
        for s in strategies:
            s["source_type"] = source_type
            s["extracted_at"] = datetime.utcnow().isoformat()
        return strategies

    except json.JSONDecodeError as e:
        log.warning(f"JSON parse error on chunk: {e}")
        return []
    except Exception as e:
        log.error(f"Claude API error: {e}")
        return []


def deduplicate(strategies: list[dict]) -> list[dict]:
    """
    Remove near-duplicate strategies by name similarity.
    Keeps the higher-confidence version when duplicates exist.
    """
    seen_names = {}
    confidence_rank = {"high": 3, "medium": 2, "low": 1}

    for s in strategies:
        name = (s.get("name") or "").lower().strip()
        if not name:
            continue
        existing = seen_names.get(name)
        if existing is None:
            seen_names[name] = s
        else:
            # Keep whichever has higher confidence
            if confidence_rank.get(s.get("confidence"), 0) > confidence_rank.get(existing.get("confidence"), 0):
                seen_names[name] = s

    return list(seen_names.values())


def run_extractor(raw_paths: dict = None) -> Path:
    """
    Main entry point. Loads latest raw files (or uses provided paths),
    extracts strategies via Claude, and saves to extracted_strategies.json.
    raw_paths: optional dict {"classroom": Path, "community": Path}
    """
    if not ANTHROPIC_API_KEY:
        raise EnvironmentError("ANTHROPIC_API_KEY must be set in .env")

    (Path(__file__).parent.parent / "logs").mkdir(exist_ok=True)
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    all_strategies = []

    for source_type in ["classroom", "community"]:
        log.info(f"Processing {source_type} content...")
        records = load_latest_raw(source_type)

        if not records:
            log.warning(f"No {source_type} records to process.")
            continue

        for record in records:
            # Combine title + body + comments into one text block
            text_parts = [
                record.get("title", ""),
                record.get("content", ""),
                record.get("body", ""),
                record.get("comments", "")
            ]
            full_text = "\n\n".join(p for p in text_parts if p).strip()

            if len(full_text) < 100:
                continue  # Skip near-empty records

            chunks = chunk_text(full_text)
            log.info(f"  '{record.get('title','')[:50]}' → {len(chunks)} chunk(s)")

            for chunk in chunks:
                strategies = extract_from_chunk(client, chunk, source_type)
                all_strategies.extend(strategies)
                log.info(f"    Extracted {len(strategies)} strategies from chunk")

    # Deduplicate and sort by confidence
    all_strategies = deduplicate(all_strategies)
    confidence_order = {"high": 0, "medium": 1, "low": 2}
    all_strategies.sort(key=lambda s: confidence_order.get(s.get("confidence"), 3))

    # Save
    output = {
        "generated_at": datetime.utcnow().isoformat(),
        "source": "coinpicksgenesis",
        "total_strategies": len(all_strategies),
        "strategies": all_strategies
    }
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    log.info(f"Done. {len(all_strategies)} strategies saved → {OUTPUT_FILE}")
    return OUTPUT_FILE


def print_summary():
    """Print a readable summary of extracted strategies to console."""
    if not OUTPUT_FILE.exists():
        print("No extracted_strategies.json found. Run the extractor first.")
        return

    with open(OUTPUT_FILE, encoding="utf-8") as f:
        data = json.load(f)

    strategies = data.get("strategies", [])
    print(f"\n{'='*60}")
    print(f"CoinPicksGenesis — {len(strategies)} Extracted Strategies")
    print(f"Generated: {data.get('generated_at')}")
    print(f"{'='*60}\n")

    for i, s in enumerate(strategies, 1):
        print(f"{i}. [{s.get('confidence','?').upper()}] {s.get('name','Unnamed')}")
        print(f"   Source: {s.get('source_type')} | Timeframe: {s.get('timeframe') or 'N/A'}")
        print(f"   {s.get('description','')}")
        if s.get("coins_mentioned"):
            print(f"   Coins: {', '.join(s['coins_mentioned'])}")
        if s.get("key_quote"):
            print(f"   Quote: \"{s['key_quote']}\"")
        print()


if __name__ == "__main__":
    output_path = run_extractor()
    print_summary()
