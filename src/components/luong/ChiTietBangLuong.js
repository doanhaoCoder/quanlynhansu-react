import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Sử dụng useNavigate
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";

const ChiTietBangLuong = () => {
  const { maLuong } = useParams(); // Lấy mã lương từ URL
  const [bangLuong, setBangLuong] = useState(null); // Lưu trữ thông tin bảng lương
  const [nhanVien, setNhanVien] = useState(null); // Lưu trữ thông tin nhân viên
  const navigate = useNavigate(); // Khai báo hook navigate

  // Lấy dữ liệu bảng lương và nhân viên từ Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy dữ liệu bảng lương theo MaLuong
        const bangLuongRef = doc(db, "Luong", maLuong);
        const bangLuongSnap = await getDoc(bangLuongRef);

        if (bangLuongSnap.exists()) {
          const bangLuongData = bangLuongSnap.data();
          setBangLuong(bangLuongData);

          // Lấy thông tin nhân viên từ NhanVienID trong bảng lương
          if (bangLuongData.NhanVienID) {
            const nhanVienRef = doc(db, "nhanvien", bangLuongData.NhanVienID);
            const nhanVienSnap = await getDoc(nhanVienRef);

            if (nhanVienSnap.exists()) {
              setNhanVien(nhanVienSnap.data());
            } else {
              toast.error("Không tìm thấy thông tin nhân viên!");
            }
          } else {
            toast.error("Không có mã nhân viên trong bảng lương!");
          }
        } else {
          toast.error("Không tìm thấy bảng lương!");
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        toast.error("Lỗi khi tải dữ liệu.");
      }
    };

    fetchData();
  }, [maLuong]);

  // Kiểm tra nếu dữ liệu chưa có
  if (!bangLuong || !nhanVien) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Chi Tiết Bảng Lương</h2>
      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate("/bang-luong")} // Thay thế history.push bằng navigate
      >
        Quay lại danh sách bảng lương
      </button>

      <table className="table table-bordered">
        <tbody>
          <tr>
            <th>Mã Lương</th>
            <td>{bangLuong.MaLuong}</td>
          </tr>
          <tr>
            <th>Tên Nhân Viên</th>
            <td>{nhanVien.HoTenNV}</td>
          </tr>
          <tr>
            <th>Chức Vụ</th>
            <td>{nhanVien.ChucVu}</td>
          </tr>
          <tr>
            <th>Lương Chức Vụ</th>
            <td>{nhanVien.Luong}</td>
          </tr>
          <tr>
            <th>Số Ngày Công</th>
            <td>{bangLuong.SoNgayCong}</td>
          </tr>
          <tr>
            <th>Tổng Lương</th>
            <td>{bangLuong.TongLuong.toLocaleString()} đ</td>
          </tr>
          <tr>
            <th>Phụ Cấp</th>
            <td>{bangLuong.Phucap.toLocaleString()} đ</td>
          </tr>
          <tr>
            <th>Thưởng</th>
            <td>{bangLuong.Thuong.toLocaleString()} đ</td>
          </tr>
          <tr>
            <th>Lương Ngày</th>
            <td>{bangLuong.LuongNgay.toLocaleString()} đ</td>
          </tr>
          <tr>
            <th>Ngày Tính Lương</th>
            <td>{new Date(bangLuong.NgayTinhLuong).toLocaleDateString()}</td>
          </tr>
          <tr>
            <th>Ngày Tạo</th>
            <td>{new Date(bangLuong.NgayTao).toLocaleString()}</td>
          </tr>
          <tr>
            <th>Người Tạo</th>
            <td>{bangLuong.NguoiTao}</td>
          </tr>
          <tr>
            <th>Ghi Chú</th>
            <td>{bangLuong.GhiChu}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ChiTietBangLuong;
