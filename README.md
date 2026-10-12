# Layout Lab → Storybook

Bản thử nghiệm độc lập dùng React, TypeScript và Storybook 10.6.1, đọc từ file Figma **The — Layout Lab / Design System Pro 1.0**.

## Mở bản thử

```sh
npm install
npm run storybook
```

Mở http://127.0.0.1:6006. Chọn **Components → Buttons → Button → Playground** và thử các thuộc tính trong Controls. **All variants** cho phép lọc, đối chiếu các biến thể và mở lại node Figma gốc.

## Nội dung đã chuyển

- 39 trang component, 63 component sets, 1.822 component/biến thể.
- 8 trang nền tảng: Colors, Layout Grid, Typography, Spacing, Icons, Icon Shapes, Brands Logos, Shadows & Borders.
- 738 icon/cờ/social asset và 119 logo/icon thương hiệu.
- 112 token gốc: 72 màu, 27 spacing, 8 radius, 5 container; cùng text, effect và grid styles.
- SVG và ảnh gốc lưu cục bộ. Ảnh được đối chiếu SHA-1 với imageHash của Figma.

## Phạm vi

Đây là **danh mục giao diện và biến thể để thử quy trình Figma → Storybook**. React renderer dựng cây lớp từ dữ liệu thiết kế, giữ auto layout, kích thước, màu, chữ, bo góc, bóng đổ và asset. Không nhúng ảnh chụp màn hình thay cho toàn bộ component.

Button dùng phần tử button, trường nhập cơ bản cho phép gõ, các trạng thái hover/focus và lựa chọn có thể thử. Datepicker, bảng, carousel, modal và các widget phức tạp hiện thể hiện thiết kế cùng các biến thể; chưa có đầy đủ logic, điều hướng bàn phím, quản lý focus hay hành vi nghiệp vụ của một thư viện component dùng trong sản phẩm.

Không có cam kết pixel-perfect cho mọi biến thể. Báo cáo kiểm tra mô tả cụ thể phạm vi đã kiểm tra.

## Các phần chính

- `src/Scene.tsx`: renderer React và chọn biến thể.
- `src/generated/`: Storybook stories tạo từ danh mục Figma.
- `public/data/`: cây lớp và metadata của đủ 47 trang; token, styles và bảng ánh xạ ảnh.
- `public/assets/`: asset SVG/ảnh gốc.
- `src/tokens.css` và `public/data/tokens.json`: token có thể tái sử dụng.
- `design-source/`: bản xuất từ Figma để tái dựng ngoại tuyến.
- `verification/`: ảnh chụp và báo cáo kiểm tra trình duyệt.

Các bố cục Examples đi kèm Banners, Drawer, Chat Bubble, Modals, Navbar, Speed Dial và Toasts cũng được lưu thành cây lớp React, có thanh thu phóng để xem.

## Kiểm tra và xuất

```sh
npm run typecheck
npm run build-storybook
```

Bản tĩnh nằm trong `storybook-static/` và có thể phục vụ bằng một máy chủ web tĩnh. Không cần kết nối Figma để chạy.

Để dựng lại stories từ dữ liệu đã xuất:

```sh
node scripts/assemble.mjs
node scripts/assemble-examples.mjs
node scripts/apply-geometry.mjs
node scripts/apply-strokes.mjs
node scripts/normalize-assets.mjs
node scripts/prepare-tokens.mjs
```

Nguồn: https://www.figma.com/design/NwDM80FJMLnVdHk5sUwUdQ
