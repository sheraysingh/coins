"""
intelligence/skool_scraper.py
Logs into Skool.com and scrapes both Classroom and Community tabs
from coinpicksgenesis. Saves raw content to intelligence/raw/.
"""

import os
import json
import time
import logging
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

load_dotenv()

SKOOL_EMAIL = os.getenv("SKOOL_EMAIL")
SKOOL_PASS = os.getenv("SKOOL_PASS")
COMMUNITY_SLUG = "coinpicksgenesis"
BASE_URL = "https://www.skool.com"
RAW_DIR = Path(__file__).parent / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [SKOOL] %(levelname)s — %(message)s",
    handlers=[
        logging.FileHandler(Path(__file__).parent.parent / "logs" / "skool_scraper.log"),
        logging.StreamHandler()
    ]
)
log = logging.getLogger(__name__)


def login(page):
    """Log into Skool with credentials from .env."""
    log.info("Navigating to Skool login...")
    page.goto(f"{BASE_URL}/login", wait_until="networkidle")
    page.fill('input[type="email"]', SKOOL_EMAIL)
    page.fill('input[type="password"]', SKOOL_PASS)
    page.click('button[type="submit"]')
    page.wait_for_load_state("networkidle")

    if "login" in page.url:
        raise RuntimeError("Login failed — check SKOOL_EMAIL and SKOOL_PASS in .env")
    log.info("Login successful.")


def scrape_classroom(page) -> list[dict]:
    """
    Navigate the Classroom tab and extract all modules and their lessons.
    Returns a list of {module, lesson_title, content} dicts.
    """
    log.info("Scraping Classroom tab...")
    lessons = []

    page.goto(f"{BASE_URL}/{COMMUNITY_SLUG}/classroom", wait_until="networkidle")
    time.sleep(2)

    # Collect all module/lesson links from the sidebar
    lesson_links = page.eval_on_selector_all(
        'a[href*="/classroom/"]',
        "els => els.map(e => ({href: e.href, text: e.innerText.trim()}))"
    )

    seen_hrefs = set()
    unique_lessons = []
    for link in lesson_links:
        href = link["href"]
        if href not in seen_hrefs and "/classroom/" in href:
            seen_hrefs.add(href)
            unique_lessons.append(link)

    log.info(f"Found {len(unique_lessons)} classroom lessons.")

    for link in unique_lessons:
        try:
            page.goto(link["href"], wait_until="networkidle")
            time.sleep(1.5)

            # Extract main lesson content
            content = page.eval_on_selector_all(
                'main p, main h1, main h2, main h3, main li, main blockquote',
                "els => els.map(e => e.innerText.trim()).filter(t => t.length > 0)"
            )

            lesson_data = {
                "source": "classroom",
                "title": link["text"] or page.title(),
                "url": link["href"],
                "content": "\n".join(content),
                "scraped_at": datetime.utcnow().isoformat()
            }
            lessons.append(lesson_data)
            log.info(f"  Scraped lesson: {lesson_data['title'][:60]}")

        except PlaywrightTimeout:
            log.warning(f"  Timeout on lesson: {link['href']} — skipping")
        except Exception as e:
            log.warning(f"  Error on lesson {link['href']}: {e}")

    return lessons


def scrape_community(page, max_posts: int = 50) -> list[dict]:
    """
    Navigate the Community tab and extract posts with their comments.
    Scrapes pinned posts first, then most recent up to max_posts.
    Returns a list of {title, body, comments, likes} dicts.
    """
    log.info("Scraping Community tab...")
    posts = []

    page.goto(f"{BASE_URL}/{COMMUNITY_SLUG}", wait_until="networkidle")
    time.sleep(2)

    # Scroll to load more posts
    for _ in range(5):
        page.keyboard.press("End")
        time.sleep(1.5)

    # Collect all post links
    post_links = page.eval_on_selector_all(
        'a[href*="/p/"]',
        "els => [...new Set(els.map(e => e.href))].filter(h => h.includes('/p/'))"
    )

    log.info(f"Found {len(post_links)} community posts (capping at {max_posts}).")

    for href in post_links[:max_posts]:
        try:
            page.goto(href, wait_until="networkidle")
            time.sleep(1.5)

            # Title
            title = page.eval_on_selector(
                'h1, [data-testid="post-title"]',
                "el => el.innerText.trim()"
            ) if page.query_selector('h1') else "Untitled"

            # Post body
            body_parts = page.eval_on_selector_all(
                '[data-testid="post-body"] p, [data-testid="post-body"] li, article p, article li',
                "els => els.map(e => e.innerText.trim()).filter(t => t.length > 0)"
            )

            # Comments
            comment_parts = page.eval_on_selector_all(
                '[data-testid="comment"] p, .comment p',
                "els => els.map(e => e.innerText.trim()).filter(t => t.length > 0)"
            )

            # Like count (engagement signal)
            try:
                likes = page.eval_on_selector(
                    '[data-testid="like-count"], .like-count',
                    "el => el.innerText.trim()"
                )
            except Exception:
                likes = "0"

            post_data = {
                "source": "community",
                "title": title,
                "url": href,
                "body": "\n".join(body_parts),
                "comments": "\n".join(comment_parts),
                "likes": likes,
                "scraped_at": datetime.utcnow().isoformat()
            }
            posts.append(post_data)
            log.info(f"  Scraped post: {title[:60]}")

        except PlaywrightTimeout:
            log.warning(f"  Timeout on post: {href} — skipping")
        except Exception as e:
            log.warning(f"  Error on post {href}: {e}")

    return posts


def save_raw(data: list[dict], label: str):
    """Save scraped data to intelligence/raw/ as timestamped JSON."""
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    out_path = RAW_DIR / f"{label}_{timestamp}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    log.info(f"Saved {len(data)} {label} records → {out_path}")
    return out_path


def run_scraper(headless: bool = True) -> dict[str, Path]:
    """Main entry point. Returns paths to saved raw files."""
    if not SKOOL_EMAIL or not SKOOL_PASS:
        raise EnvironmentError("SKOOL_EMAIL and SKOOL_PASS must be set in .env")

    Path(__file__).parent.parent / "logs" / "skool_scraper.log"
    (Path(__file__).parent.parent / "logs").mkdir(exist_ok=True)

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=headless)
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        )
        page = context.new_page()

        try:
            login(page)
            classroom_data = scrape_classroom(page)
            community_data = scrape_community(page, max_posts=50)
        finally:
            browser.close()

    classroom_path = save_raw(classroom_data, "classroom")
    community_path = save_raw(community_data, "community")

    log.info("Scrape complete.")
    return {"classroom": classroom_path, "community": community_path}


if __name__ == "__main__":
    paths = run_scraper(headless=True)
    print(f"\nClassroom data: {paths['classroom']}")
    print(f"Community data: {paths['community']}")
