# Phòng sản xuất · Hermes Clip

## Overview

Một bàn điều hành sản xuất video dành cho người quản lý một nhóm sản phẩm. Mô hình studio giúp đọc tiến độ toàn cảnh. Cột việc cho phép mở thẳng cảnh, phiên bản hoặc lượt chạy cần kiểm.

## Colors

`styles.css` giữ token runtime. `--page` và `--panel` dùng graphite, `--accent` dùng xanh chanh của Hermes Clip, `--studio` dùng màu kem của mô hình. Viền và màu chữ phụ phục vụ phân cấp. Mỗi trạng thái có nhãn chữ.

## Typography

Be Vietnam Pro hỗ trợ dấu tiếng Việt, được tải cục bộ. Tiêu đề dùng trọng lượng đậm và độ giãn chữ hẹp. Nhãn trạng thái dùng cùng họ chữ ở cỡ nhỏ hơn.

## Layout

Desktop chia studio và cột công việc. Màn hình nhỏ đặt cột việc dưới studio và hiện nút trạm thành hàng có thể xuống dòng. Thứ tự trạm đi theo luồng sản xuất. Bộ chọn sản phẩm áp dụng cho cả hai vùng.

## Elevation & Depth

Ảnh mô hình dùng bóng tiếp xúc và chất liệu gỗ, đá sáng. Phần giao diện dùng viền mảnh. Hộp chi tiết dùng native dialog, có hỗ trợ phím Escape và trả focus về điểm mở.

## Shapes

Thẻ studio và cột việc dùng góc bo lớn hơn các nút, bộ lọc và nhãn trạm.

## Components

Bộ chọn sản phẩm dùng select chuẩn. Bộ lọc và trạm là nút có trạng thái chọn. Các công việc dùng chung một hàng và một hộp chi tiết. Video chỉ tải metadata khi mở chi tiết. Trạng thái mẫu thay đổi trong phiên hiện tại.
