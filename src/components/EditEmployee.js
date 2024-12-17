import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditEmployee = () => {
  const { maNV } = useParams(); // Lấy maNV từ URL
  const navigate = useNavigate(); // Khai báo useNavigate
  const [employee, setEmployee] = useState({
    HoTenNV: '',
    GioiTinh: '',
    NgaySinh: '',
    NoiSinh: '',
    TrangThai: '',
    Email: '', // Thêm trường email
    CCCD: '' // Thêm trường CCCD
  });
  const [error, setError] = useState(''); // Thêm state để lưu thông báo lỗi

  useEffect(() => {
    // Lấy thông tin nhân viên từ API khi component được render
    axios.get(`http://localhost:5000/api/employees/${maNV}`)
      .then(response => {
        setEmployee(response.data);
      })
      .catch(error => {
        console.error('Lỗi khi lấy thông tin nhân viên:', error);
      });
  }, [maNV]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee({
      ...employee,
      [name]: value
    });
  };

  const checkDuplicate = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/employees/check-duplicate', {
        params: { email: employee.Email, cccd: employee.CCCD }
      });
      return response.data; // Trả về kết quả kiểm tra
    } catch (error) {
      if (error.response) {
        setError(error.response.data.error); // Hiển thị thông báo lỗi từ server
      }
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra trùng lặp email và CCCD
    const result = await checkDuplicate();
    if (result && result.error) {
      alert(result.error); // Nếu có lỗi thì thông báo cho người dùng
      return;
    }

    // Nếu không có lỗi, gửi yêu cầu cập nhật
    axios.put(`http://localhost:5000/api/employees/${maNV}`, employee)
      .then(response => {
        alert('Thông tin nhân viên đã được cập nhật!');
        navigate('/employees'); // Chuyển hướng về danh sách nhân viên
      })
      .catch(error => {
        console.error('Lỗi khi cập nhật nhân viên:', error);
        alert('Cập nhật thất bại!');
      });
  };

  return (
    <div>
      <h2>Cập nhật thông tin nhân viên</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Họ và tên:</label>
          <input
            type="text"
            name="HoTenNV"
            value={employee.HoTenNV}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Giới tính:</label>
          <input
            type="text"
            name="GioiTinh"
            value={employee.GioiTinh}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Ngày sinh:</label>
          <input
            type="date"
            name="NgaySinh"
            value={employee.NgaySinh}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Nơi sinh:</label>
          <input
            type="text"
            name="NoiSinh"
            value={employee.NoiSinh}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Trạng thái:</label>
          <select
            name="TrangThai"
            value={employee.TrangThai}
            onChange={handleChange}
          >
            <option value="Đang làm việc">Đang làm việc</option>
            <option value="Đã nghỉ việc">Đã nghỉ việc</option>
          </select>
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="Email"
            value={employee.Email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>CCCD:</label>
          <input
            type="text"
            name="CCCD"
            value={employee.CCCD}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Cập nhật</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Hiển thị lỗi nếu có */}
    </div>
  );
};

export default EditEmployee;
