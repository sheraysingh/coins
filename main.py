"""APEX System — Entry Point
Starts the scheduler and Flask dashboard.
"""
import os
import threading
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s"
)
log = logging.getLogger("apex")

LIVE_TRADING = os.getenv("LIVE_TRADING", "false").lower() == "true"
MODE = "LIVE" if LIVE_TRADING else "PAPER"


def run_dashboard():
    from dashboard.app import app
    app.run(host="0.0.0.0", port=5050)


def run_scheduler():
    import schedule
    import time

    log.info(f"Scheduler started in {MODE} mode")

    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == "__main__":
    log.info(f"APEX System starting — {MODE} mode")

    # Start dashboard in a separate thread
    dash_thread = threading.Thread(target=run_dashboard, daemon=True)
    dash_thread.start()

    # Run scheduler on main thread
    run_scheduler()
