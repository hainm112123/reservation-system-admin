import sys
import time
import threading
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine

# Cấu hình lại Terminal để in được tiếng Việt có dấu trên Windows mà không bị lỗi
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Import toàn bộ models để tránh lỗi khởi tạo Mapper của SQLAlchemy
from app.models.e_ticket import ETicket
from app.models.booking import Booking
from app.models.event import Event
from app.models.event_schedule import EventSchedule
from app.models.event_day import EventDay
from app.models.ticket_config import TicketConfig
from app.models.venue import Venue
from app.models.artist import Artist
from app.models.event_artist import EventArtist

# ==============================================================================
# BƯỚC 1: HÀM KHỞI TẠO DỮ LIỆU MẪU
# ==============================================================================
def setup_dummy_data():
    db = SessionLocal()
    ticket = db.query(ETicket).first()
    
    if not ticket:
        print("➤ Đang tự động tạo dữ liệu mẫu (Địa điểm, Sự kiện, Lịch trình, Vé)...")
        venue = Venue(venue_name="Sân Vận Động Mỹ Đình", city="Hà Nội", capacity=40000)
        db.add(venue)
        db.commit()
        
        event = Event(event_name="Concert BlackPink", status="Published")
        db.add(event)
        db.commit()
        
        schedule = EventSchedule(event_id=event.event_id, venue_id=venue.venue_id)
        db.add(schedule)
        db.commit()

        event_day = EventDay(event_schedule_id=schedule.schedule_id, date=datetime.now())
        db.add(event_day)
        db.commit()
        
        config = TicketConfig(schedule_id=schedule.schedule_id, ticket_type="VIP", price=5000000, max_quantity=1)
        db.add(config)
        db.commit()
        
        ticket = ETicket(
            booking_id=None,
            ticket_config_id=config.config_id,
            event_day_id=event_day.event_day_id,
            row_label="A",
            col_number=1,
            ticket_status="Available"
        )
        db.add(ticket)
        db.commit()
        print(f"➤ Đã tạo thành công Vé mẫu: [ID={ticket.ticket_id}] - Ghế A-1")
    else:
        # Nếu đã có vé từ trước, ta làm trống booking_id để đưa vé về trạng thái "Có sẵn"
        ticket.booking_id = None
        ticket.ticket_status = "Available"
        db.commit()
        print(f"➤ Sử dụng vé có sẵn: [ID={ticket.ticket_id}] (Đã được reset về trạng thái trống).")
    
    ticket_id = ticket.ticket_id
    schedule_id = ticket.ticket_config.schedule_id if ticket.ticket_config else 1
    db.close()
    
    return ticket_id, schedule_id


# ==============================================================================
# BƯỚC 2: HÀM MÔ PHỎNG NGƯỜI DÙNG ĐẶT VÉ VỚI ROW-LEVEL LOCK
# ==============================================================================
def book_ticket_concurrently(user_name, target_ticket_id, schedule_id):
    db = SessionLocal()
    print(f"[{user_name}] Đang bấm nút MUA VÉ...\n", end="")
    
    try:
        # 1. Tạo đơn hàng (Booking) trước
        new_booking = Booking(
            schedule_id=schedule_id, 
            customer_name=user_name, 
            phone="0999999999", 
            email=f"khachhang@gmail.com",
            payment_status="Pending"
        )
        db.add(new_booking)
        db.flush() # Lưu tạm để lấy ra booking_id

        # 2. KHÓA DÒNG DỮ LIỆU VÉ (Row-Level Locking)
        # Sử dụng lệnh .with_for_update() của SQLAlchemy để tạo ra lệnh SQL: SELECT ... FOR UPDATE
        ticket = db.query(ETicket).filter(
            ETicket.ticket_id == target_ticket_id,
            ETicket.booking_id.is_(None) # Đảm bảo vé thực sự chưa có người mua
        ).with_for_update().first()

        # Nếu không lấy được vé (do người khác đã mua và commit xong)
        if not ticket:
            print(f"❌ [{user_name}] Thất bại: Rất tiếc, vé này đã bị người khác mua mất trong tích tắc!\n", end="")
            db.rollback()
            return
        
        # 3. Nếu lấy được vé (đang giữ khóa), bắt đầu xử lý thanh toán
        print(f"⏳ [{user_name}] Lấy vé thành công, đang giữ khóa Database và xử lý thanh toán (giả lập 3 giây)...\n", end="")
        time.sleep(3) # Mô phỏng thời gian chờ thanh toán, lúc này các người dùng khác phải đứng đợi
        
        # 4. Gán vé cho đơn hàng và Mở khóa
        ticket.booking_id = new_booking.booking_id
        ticket.ticket_status = "Holding"
        
        db.commit() # Lưu vào DB và nhả cờ Khóa (Lock)
        print(f"✅ [{user_name}] HOÀN TẤT MUA VÉ!\n", end="")

    except Exception as e:
        print(f"[{user_name}] Lỗi hệ thống: {e}\n", end="")
        db.rollback()
    finally:
        db.close()


# ==============================================================================
# BƯỚC 3: KỊCH BẢN CHẠY THỬ (TEST CONCURRENCY)
# ==============================================================================
if __name__ == "__main__":
    target_ticket_id, schedule_id = setup_dummy_data()
    
    print("\n" + "="*70)
    print("🔥 BẮT ĐẦU TEST: 3 NGƯỜI DÙNG CÙNG CLICK MUA 1 VÉ Ở CÙNG 1 MILI-GIÂY!")
    print("="*70 + "\n")
    
    # Tạo 3 luồng (Thread) đại diện cho 3 người dùng mua vé cùng lúc
    t1 = threading.Thread(target=book_ticket_concurrently, args=("Khách Hàng 1", target_ticket_id, schedule_id))
    t2 = threading.Thread(target=book_ticket_concurrently, args=("Khách Hàng 2", target_ticket_id, schedule_id))
    t3 = threading.Thread(target=book_ticket_concurrently, args=("Khách Hàng 3", target_ticket_id, schedule_id))
    
    # Ra lệnh cho 3 luồng xuất phát đồng thời
    t1.start()
    t2.start()
    t3.start()
    
    # Đợi cả 3 luồng chạy xong
    t1.join()
    t2.join()
    t3.join()
    
    print("\n" + "="*70)
    print("🏁 KẾT THÚC BÀI TEST!")
    print("="*70)
