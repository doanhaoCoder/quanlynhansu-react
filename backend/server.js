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
// Xóa nhân viên theo MaNV
app.delete('/api/employees/:maNV', (req, res) => {
    const maNV = req.params.maNV;
    const query = 'DELETE FROM NhanVien WHERE MaNV = ?';
    
    db.query(query, [maNV], (err, results) => {
      if (err) {
        console.error("Lỗi khi xóa nhân viên:", err);
        return res.status(500).json({ error: "Lỗi máy chủ" });
      }
      if (results.affectedRows > 0) {
        res.status(200).json({ message: 'Nhân viên đã được xóa thành công' });
      } else {
        res.status(404).json({ error: 'Nhân viên không tồn tại' });
      }
    });
  });
// Cập nhật thông tin nhân viên theo MaNV
app.put('/api/employees/:maNV', (req, res) => {
    const maNV = req.params.maNV; // Lấy MaNV từ URL params
    const { HoTenNV, GioiTinh, NgaySinh, NoiSinh, TrangThai } = req.body; // Lấy các thông tin cần cập nhật từ body
  
    // Kiểm tra xem tất cả các dữ liệu có hợp lệ không
    if (!HoTenNV || !GioiTinh || !NgaySinh || !NoiSinh || !TrangThai) {
      return res.status(400).json({ error: 'Tất cả các trường phải được điền đầy đủ' });
    }
  
    // Truy vấn SQL để cập nhật thông tin nhân viên
    const query = `
      UPDATE NhanVien
      SET HoTenNV = ?, GioiTinh = ?, NgaySinh = ?, NoiSinh = ?, TrangThai = ?
      WHERE MaNV = ?
    `;
  
    db.query(query, [HoTenNV, GioiTinh, NgaySinh, NoiSinh, TrangThai, maNV], (err, results) => {
      if (err) {
        console.error('Lỗi khi cập nhật thông tin nhân viên:', err);
        return res.status(500).json({ error: 'Lỗi máy chủ' });
      }
  
      // Kiểm tra nếu có bản ghi nào bị ảnh hưởng
      if (results.affectedRows > 0) {
        return res.status(200).json({ message: 'Thông tin nhân viên đã được cập nhật' });
      } else {
        return res.status(404).json({ error: 'Không tìm thấy nhân viên với MaNV này' });
      }
    });
  });
// Kiểm tra tính duy nhất của email và CCCD
app.get('/api/employees/check-duplicate', (req, res) => {
    const { email, cccd } = req.query;
  
    const query = `SELECT * FROM NhanVien WHERE Email = ? OR CCCD = ?`;
    db.query(query, [email, cccd], (err, results) => {
      if (err) {
        console.error('Lỗi khi kiểm tra trùng email hoặc CCCD:', err);
        return res.status(500).json({ error: 'Lỗi máy chủ' });
      }
      if (results.length > 0) {
        return res.status(409).json({ error: 'Email hoặc CCCD đã tồn tại.' });
      }
      return res.status(200).json({ message: 'Không có sự trùng lặp.' });
    });
  });
  

// Chạy server trên port 5000
app.listen(5000, () => {
  console.log('Server đang chạy trên http://localhost:5000');
});
