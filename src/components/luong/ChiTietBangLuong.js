import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const EmployeeDetail = () => {
  const { id } = useParams(); // Lấy ID nhân viên từ URL
  const [bangLuong, setbangLuong] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Khai báo hook navigate
  // Hàm lấy thông tin chi tiết nhân viên
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const bangluonRef = doc(db, "Luong", id); // Dùng ID để lấy tài liệu
        const bangluonSnap = await getDoc(bangluonRef);

        if (bangluonSnap.exists()) {
          const employeeData = bangluonSnap.data();
          // console.log("Nhân viên:", employeeData);

          if (employeeData.NhanVienID) {
            const chucVuRef = doc(db, "nhanvien", employeeData.NhanVienID);
            const chucVuSnap = await getDoc(chucVuRef);
            if (chucVuSnap.exists()) {
              const chucVuData = chucVuSnap.data();
              employeeData.tenChucVu = chucVuData.tenChucVu; // Kiểm tra tên trường tại đây
              employeeData.tenNV = chucVuData.HoTenNV; // Kiểm tra tên trường tại đây
              employeeData.maNV = chucVuData.MaNV; // Kiểm tra tên trường tại đây
            }
          }

          // Cập nhật state employee với dữ liệu đầy đủ
          setbangLuong(employeeData);
          console.log("Dữ liệu:", employeeData);
        }

        if (bangluonSnap.exists()) {
          // setbangLuong(bangluonSnap.data());
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching employee: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!bangLuong) {
    return <div>Không tìm thấy thông tin nhân viên.</div>;
  }

  // Hiển thị chi tiết nhân viên
  return (
    <div className="container mt-5">
      <h2 className="mb-4" style={{ fontSize: "2rem", fontWeight: "bold" }}>
        {/* Nút Trở lại */}
        <button
          className="btn btn-primary mb-2"
          onClick={() => navigate(-1)} // Quay lại trang trước đó
        >
          Trở lại
        </button>
        <br></br>
        Chi Tiết Bảng Lương
      </h2>
      <div style={{ fontSize: "2rem", lineHeight: "2rem" }}>
        <div className="row">
          <div className="col-6">
            <p
              className="text-danger"
              style={{ fontSize: "1.8rem", lineHeight: "2rem" }}
            >
              <strong>Mã Lương:</strong> {bangLuong.MaLuong}
            </p>
            <p
              className="text-danger"
              style={{ fontSize: "1.8rem", lineHeight: "2rem" }}
            >
              <strong>Tên Nhân Viên:</strong> {bangLuong.tenNV}
            </p>
            <p>
              <strong>Mã Nhân Viên:</strong> {bangLuong.maNV}
            </p>
            <p>
              <strong>Chức Vụ:</strong> {bangLuong.tenChucVu}
            </p>
            <p>
              <strong>Lương Ngày:</strong>{" "}
              {bangLuong.LuongNgay.toLocaleString()} VNĐ
            </p>
          </div>
          <div className="col-6">
            <p>
              <strong>Số Ngày Công:</strong> {bangLuong.SoNgayCong}
            </p>
            <p>
              <p>
                <strong>Lí do nghỉ:</strong> {bangLuong.GhiChuNghi}
              </p>
              <strong>Phụ Cấp:</strong> {bangLuong.PhuCap.toLocaleString()} VNĐ
            </p>
            <p>
              <strong>Ghi Chú Phụ Cấp:</strong> {bangLuong.GhiChuPhuCap}
            </p>
            <p>
              <strong>Thưởng:</strong> {bangLuong.Thuong.toLocaleString()} VNĐ
            </p>
            <p>
              <strong>Ghi Chú Thưởng:</strong> {bangLuong.GhiChuThuong}
            </p>
            <p
              className="text-danger"
              style={{ fontSize: "1.8rem", lineHeight: "2rem" }}
            >
              <strong>Tổng Lương:</strong>{" "}
              {bangLuong.TongLuong.toLocaleString()} VNĐ
            </p>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-6">
            <p>
              <strong>Ngày Tính Lương:</strong>{" "}
              {new Date(bangLuong.NgayTinhLuong).toLocaleDateString()}
            </p>
            <p>
              <strong>Ngày Tạo Bảng:</strong>{" "}
              {new Date(bangLuong.NgayTao).toLocaleString()}
            </p>
            <p>
              <strong>Người Tạo Bảng:</strong> {bangLuong.NguoiTao}
            </p>
          </div>
          <div className="col-6"></div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
