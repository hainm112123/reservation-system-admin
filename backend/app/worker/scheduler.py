from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.database import SessionLocal
from app.services.refund_service import process_pending_refunds


def job_process_refunds():
    db = SessionLocal()
    try:
        count = process_pending_refunds(db)
        if count > 0:
            print(f"[WORKER] Processed {count} pending refunds in admin backend.")
    except Exception as e:
        print(f"[WORKER ERROR] job_process_refunds: {e}")
    finally:
        db.close()


scheduler = BackgroundScheduler()

def start_scheduler():
    # Run every 5 seconds
    scheduler.add_job(
        func=job_process_refunds,
        trigger=IntervalTrigger(seconds=5),
        id='process_refunds_job',
        name='Process pending refunds',
        replace_existing=True,
    )
    
    scheduler.start()
    print("[WORKER] Admin background scheduler started.")


def stop_scheduler():
    scheduler.shutdown()
    print("[WORKER] Admin background scheduler stopped.")
