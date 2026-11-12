# Phòng sản xuất · Hermes Clip

Prototype độc lập của màn điều hành video. Năm trạm trong studio 2.5D và cột Cần xử lý cùng đọc dữ liệu mẫu theo sản phẩm đang chọn.

## Mở prototype

Mở `index.html` bằng Chrome hoặc Edge. Có thể chạy qua HTTP cục bộ bằng Python 3.

```bash
python -m http.server 4173 --bind 127.0.0.1
```

Mở [localhost:4173](http://localhost:4173). Trên Windows có thể dùng `py -m http.server 4173 --bind 127.0.0.1`.

## Thử ba luồng

1. Mở **Nhập video cho cảnh 03**. Chọn một MP4, chẳng hạn `assets/sample-take-02.mp4`. Sau khi video hợp lệ, chọn **Gắn vào cảnh mẫu**.
2. Mở **Duyệt take 02** để xem video minh họa và chọn bản chính.
3. Mở **Đối soát lượt #014** để xem lịch sử lượt chạy mẫu.

Mọi thay đổi nằm trong bộ nhớ của tab. Tải lại trang để đặt lại dữ liệu mẫu. Ứng dụng đọc tệp được chọn ngay trong trình duyệt. Prototype chạy offline và chưa kết nối app desktop Hermes Clip hay tài khoản bên ngoài.

Hình studio gốc được tạo cho repo này. Video mẫu là đoạn thử 3 giây trích từ hình studio. Phông chữ Be Vietnam Pro được phân phối theo [SIL Open Font License](assets/OFL-BeVietnamPro.txt). Bố cục tham khảo [Sahni Agents Office](https://github.com/ajsahni/agents-office).

## Tín hiệu sản xuất

Chọn **Tín hiệu** ở thanh đầu trang hoặc mở `signals.html`. Bấm một nguồn giao việc và một bước xử lý để lọc lượt. Bấm **Hermes Clip** ở giữa đồ thị để xóa bộ lọc. Mở một lượt để xem provider và lịch sử sự kiện.

Dùng **Bước tiếp** để kiểm từng chuyển trạng thái, **Phát mô phỏng** để chạy kịch bản và **Đặt lại** để quay về ảnh chụp ban đầu. Tệp sẵn sàng và tệp đã nhập Thư viện là hai trạng thái khác nhau. Kịch bản chạy hoàn toàn trong trình duyệt với fixture, kể cả khi xuất hiện tên provider thật.

Ảnh đã chụp từ Chromium: [1366 px](review/signals-1366.webp) · [1920 px](review/signals-1920.webp).
