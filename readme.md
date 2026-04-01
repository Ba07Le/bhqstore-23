## BHQ Store (Của hàng chuột, bàn phím, màn hình pc) theo MERN

**MERN Ecommerce** một ứng dụng full-stack được thiết kế để thay đổi trải nghiệm mua sắm trực tuyến của bạn. Được xây dựng trên nền tảng MERN (MongoDB, Express.js, React, Node.js), ứng dụng này tận dụng Redux Toolkit để quản lý trạng thái hiệu quả và Material UI cho giao diện người dùng mượt mà và thân thiện. Dự án này cung cấp một nền tảng mạnh mẽ cho cả người dùng và quản trị viên, tích hợp đầy đủ các tính năng thiết yếu để mang lại trải nghiệm liền mạch.




# **Features**

### **User:**
- **Product Reviews:**
 - Viết, chỉnh sửa và xóa đánh giá.

- Cập nhật tức thì về xếp hạng và tỷ lệ sao.
  
- **Wishlist:**
- Thêm, xóa và ghi chú sản phẩm bằng những ghi chú cá nhân.
  
- **Order Management:**
    - Tạo đơn hàng mới và xem lịch sử đơn hàng.
  
- **Profile Management:**
 - Quản lý email, tên người dùng và nhiều địa chỉ khác nhau.
  
- **Shopping Cart:**
 
- Thêm sản phẩm, điều chỉnh số lượng và xem tổng phụ.

### **Admin:**
- **Product Management:**
 
- Thêm, chỉnh sửa, xóa và xóa tạm thời sản phẩm.

- Quản lý các thuộc tính sản phẩm như tên và số lượng tồn kho.
  
- **Order Management:**
  - Xem và cập nhật chi tiết và trạng thái đơn hàng.

### **Security & User Experience:**
- **Secure Authentication:**
  -Đăng nhập, đăng ký, xác minh mã OTP, đặt lại mật khẩu và đăng xuất.


# **Project Setup**

### Prerequisites
- Node.js ( version v21.1.0 hay về sau )
- MongoDB installed and running locally

### Clone the project

```bash
  git clone https://github.com/Ba07Le/BHQStore-TTTN23-.git
```

### Navigate to the project directory

```bash
  cd bhqstore
```


**Tip:** Để cài đặt các thư viện phụ thuộc cho cả giao diện người dùng và máy chủ cùng lúc một cách hiệu quả, hãy sử dụng cửa sổ terminal tách đôi.

Install frontend dependencies
```bash
cd frontend
npm install
```

Install backend dependencies

```bash
cd backend
npm install
```


### Environment Variables
**Backend**

- Tạo một tệp `.env` trong thư mục `backend`.

- Thêm các biến sau với các giá trị thích hợp.
```bash
# Kết nối name db của bạn
MONGO_URI="mongodb://localhost:27017/your-database-name"

# Frontend URL 
ORIGIN="http://localhost:3000"

# Thông tin đăng nhập email để gửi mã đặt lại mật khẩu và mã OTP.
EMAIL="your-email@example.com"
PASSWORD="your-email-password" # vào app password để đăng nhập và lấy pass

# Thời hạn (Token và Cookie)
LOGIN_TOKEN_EXPIRATION="30d"  # Days
OTP_EXPIRATION_TIME="120000"  # Milliseconds
PASSWORD_RESET_TOKEN_EXPIRATION="2m"  # Minutes
COOKIE_EXPIRATION_DAYS="30"    # Days

# tìm trên gg các web cho mã
SECRET_KEY="your-secret-key"

PRODUCTION="false" 
```

**Frontend**
- Tạo một tệp `.env` trong thư mục `frontend`
- Thêm biến sau:
```bash
# Backend URL 
REACT_APP_BASE_URL="http://localhost:8000" 
```

**Important**

- Thay thế tất cả các chỗ giữ chỗ (ví dụ: your_database_name, your_email) bằng các giá trị thực tế của bạn.
- Loại trừ tệp `.env` khỏi hệ thống kiểm soát phiên bản để bảo vệ thông tin nhạy cảm.

### Data seeding

**Steps**:

- Mở một cửa sổ terminal mới.

- Điều hướng đến thư mục `backend`: `cd backend`
- Chạy tập lệnh gieo hạt: `npm run seed` (Tập lệnh này thực thi tệp `seed.js` trong thư mục con `seed`, tương đương với việc chạy `node seed/seed.js`)
### Running Development Servers

**Important:**

- **Sử dụng các cửa sổ terminal riêng biệt**: Chạy các lệnh trong các cửa sổ terminal riêng biệt hoặc sử dụng `split terminal` để tránh xung đột.
- **Yêu cầu Nodemon**: Đảm bảo bạn đã cài đặt `nodemon` toàn cục để chạy các máy chủ phát triển backend bằng lệnh `npm run dev`. Bạn có thể cài đặt nó toàn cục bằng lệnh `npm install -g nodemon`.

#### Start the backend server

- Điều hướng đến thư mục `backend`: `cd backend`
- Khởi động máy chủ: `npm run dev` (hoặc `npm start`)
- Bạn sẽ thấy một thông báo cho biết máy chủ đang chạy, thường là trên cổng 8000.

#### Start the frontend server:

- Điều hướng đến thư mục `frontend`: `cd frontend`
- Khởi động máy chủ: `npm start`
- Bạn sẽ thấy một thông báo cho biết máy chủ đang chạy, thường là trên cổng 3000.

### Login with demo account 

- Sau khi điền dữ liệu vào cơ sở dữ liệu thành công, bạn có thể khám phá các chức năng của ứng dụng bằng cách sử dụng dữ liệu mẫu đã được điền sẵn.
- Ta có acc mẫu `đăng nhập thành công`
```bash
  email: leducbao2005@gmail.com
  pass: leducbao2005
```


### Accessing the Application

Sau khi cả hai máy chủ đều hoạt động, bạn có thể truy cập chúng tại các URL sau:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

