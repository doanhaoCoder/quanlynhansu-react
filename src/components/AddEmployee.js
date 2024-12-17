import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddEmployee = () => {
  const [maNV, setMaNV] = useState('');
  const [hoTenNV, setHoTenNV] = useState('');
  const [cccd, setCCCD] = useState('');


  // Xử lý khi người dùng nhấn nút thêm nhân viên
  const handleAddEmployee = () => {
    if (!maNV || !hoTenNV) {
      toast.error("Mã nhân viên và họ tên không được bỏ trống.");
      return;
    }

    // Kiểm tra MaNV có trùng không
    axios.get(`http://localhost:5000/api/employee-exists/${maNV}/${cccd}`)
      .then(response => {
        if (response.data.exists) {
          toast.error("Mã nhân viên đã tồn tại.");
        } else {
          // Gửi yêu cầu thêm nhân viên mới
          axios.post('http://localhost:5000/api/add-employee', {
            MaNV: maNV,
            HoTenNV: hoTenNV,
          })
            .then(response => {
              toast.success("Thêm nhân viên thành công!");
            })
            .catch(error => {
              toast.error("Đã xảy ra lỗi khi thêm nhân viên.");
            });
        }
      })
      .catch(error => {
        toast.error("Lỗi kết nối tới server.");
      });
  };

  return (
    <div>
      <h2>Thêm Nhân Viên</h2>
      <form>
        <div>
          <label>Mã Nhân Viên:</label>
          <input
            type="text"
            value={maNV}
            onChange={(e) => setMaNV(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Họ Tên Nhân Viên:</label>
          <input
            type="text"
            value={hoTenNV}
            onChange={(e) => setHoTenNV(e.target.value)}
            required
          />
        </div>
        <div>
          <label>cccd:</label>
          <input
            type="text"
            value={cccd}
            onChange={(e) => setCCCD(e.target.value)}
            required
          />
        </div>
        <button type="button" onClick={handleAddEmployee}>Thêm Nhân Viên</button>
      </form>
    </div>
  );
};

export default AddEmployee;
