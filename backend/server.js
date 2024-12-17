const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// Khởi tạo ứng dụng Express
const app = express();
app.use(cors());  // Cho phép truy cập từ frontend React
app.use(express.json());  // Xử lý dữ liệu JSON gửi tới server

// Cấu hình kết nối MySQL
const db = mysql.createConnection({
  host: 'localhost',  // Địa chỉ host (localhost nếu đang sử dụng XAMPP)
  user: 'root',       // Tên người dùng MySQL
  password: '',       // Mật khẩu MySQL (mặc định là trống với XAMPP)
  database: 'quanlynhansu'  // Tên cơ sở dữ liệu của bạn
});
// Kết nối tới MySQL
db.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối CSDL:', err);
  } else {
    console.log('Kết nối thành công tới MySQL');
  }
});

// Tạo một route để truy vấn dữ liệu
// db nhân viên đã oke
app.get('/api/employees', (req, res) => {
  db.query('SELECT * FROM NhanVien', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
});
// Kiểm tra xem mã nhân viên có tồn tại trong cơ sở dữ liệu không
app.get('/api/employee-exists/:maNV/:cccd', (req, res) => {
    const { maNV, cccd } = req.params; // Lấy MaNV và CCCD từ URL

    // Log giá trị nhận được
    // console.log("Received MaNV:", maNV, "CCCD:", cccd); 
  
    // Truy vấn SQL để kiểm tra MaNV hoặc CCCD tồn tại
    const query = `
      SELECT COUNT(*) AS count 
      FROM NhanVien 
      WHERE MaNV = ? OR CCCD = ?`;
    //   WHERE MaNV = ? AND CCCD = ?
  
    // Thực hiện truy vấn
    db.query(query, [maNV, cccd], (err, results) => {
      if (err) {
        console.error("Lỗi khi truy vấn cơ sở dữ liệu:", err);
        res.status(500).json({ error: "Lỗi máy chủ" });
      } else {
        console.log("Query result:", results); // Log kết quả truy vấn
        res.json({ exists: results[0].count > 0 }); // Trả về true nếu tìm thấy bản ghi
      }
    });
  });
  
// Thêm nhân viên mới
app.post('/api/add-employee', (req, res) => {
    const { MaNV, HoTenNV } = req.body;
  
    // Kiểm tra xem MaNV có trống không
    if (!MaNV || !HoTenNV) {
      return res.status(400).json({ error: "Mã nhân viên và họ tên không được bỏ trống." });
    }
  
    // Thêm nhân viên vào cơ sở dữ liệu
    db.query('INSERT INTO NhanVien (MaNV, HoTenNV) VALUES (?, ?)', [MaNV, HoTenNV], (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Đã xảy ra lỗi khi thêm nhân viên." });
      } else {
        res.json({ message: "Thêm nhân viên thành công." });
      }
    });
  });
  

// Chạy server trên port 5000
app.listen(5000, () => {
  console.log('Server đang chạy trên http://localhost:5000');
});
