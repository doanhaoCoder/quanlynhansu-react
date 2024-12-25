import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const EmployeeDetail = () => {
  const navigate = useNavigate(); // Khai báo hook navigate

  const { id } = useParams(); // Lấy ID nhân viên từ URL
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm lấy thông tin chi tiết nhân viên
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const employeeRef = doc(db, "nhanvien", id); // Dùng ID để lấy tài liệu
        const nhanVienSnap = await getDoc(employeeRef);
        
        if (nhanVienSnap.exists()) {
          const employeeData = nhanVienSnap.data();
          // console.log("Nhân viên:", employeeData);

          if (employeeData.PhongBan) {
            const phongRef = doc(db, "phongban", employeeData.PhongBan);
            const phongSnap = await getDoc(phongRef);
            if (phongSnap.exists()) {
              const phongData = phongSnap.data();
              employeeData.tenPhong = phongData.tenPhong; // Kiểm tra tên trường tại đây
              console.log("check: ", employeeData.tenPhong);
            }
          }
          
          if (employeeData.ChucVu) {
            const chucVuRef = doc(db, "chucvu", employeeData.ChucVu);
            const chucVuSnap = await getDoc(chucVuRef);
            if (chucVuSnap.exists()) {
              const chucVuData = chucVuSnap.data();
              employeeData.tenChucVu = chucVuData.tenChucVu; // Kiểm tra tên trường tại đây
              employeeData.luongChucVu = chucVuData.luong; // Kiểm tra tên trường tại đây
            }
          }

          // Cập nhật state employee với dữ liệu đầy đủ
          setEmployee(employeeData);
          console.log("Dữ liệu nhân viên sau khi thêm TenPhong và TenChucVu:", employeeData);
        }

        if (nhanVienSnap.exists()) {
          // setEmployee(nhanVienSnap.data());
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

  if (!employee) {
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
        Chi Tiết Nhân Viên
      </h2>
      <div style={{ fontSize: "2rem", lineHeight: "2rem" }}>
        <div className="row">
          <div className="col-6">
          <p className="text-danger" style={{ fontSize: "1.8rem", lineHeight: "2rem" }}>
              <strong>Mã nhân viên:</strong> {employee.MaNV}
            </p>
            <p>
              <strong>Họ và Tên:</strong> {employee.HoTenNV}
            </p>
            <p>
              <strong>Email:</strong> {employee.Email}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {employee.SDT}
            </p>
            <p>
              <strong>Ngày sinh:</strong> {employee.NgaySinh}
            </p>
            <p>
              <strong>Giới tính:</strong> {employee.GioiTinh}
            </p>
          </div>
          <div className="col-6">
            <p>
              <strong>CCCD:</strong> {employee.CCCD}
            </p>
            <p>
              <strong>Ngày cấp:</strong> {employee.NgayCap}
            </p>
            <p>
              <strong>Nơi cấp:</strong> {employee.NoiCap}
            </p>
            <p>
              <strong>Dân tộc:</strong> {employee.DanToc}
            </p>
            <p>
              <strong>Tôn giáo:</strong> {employee.TonGiao}
            </p>
            
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-6">
            <p>
              <strong>Địa chỉ tạm trú:</strong> {employee.DCTamTru}
            </p>
            <p>
              <strong>Địa chỉ thường trú:</strong> {employee.DCThuongTru}
            </p>
            <p>
              <strong>Nơi sinh:</strong> {employee.NoiSinh}
            </p>
            <p>
              <strong>Trình độ học vấn:</strong> {employee.TrinhDoHocVan}
            </p>
            <p>
              <strong>Trình độ chuyên môn:</strong> {employee.TrinhDoChuyenMon}
            </p>
            <p>
              <strong>Tình trạng hôn nhân:</strong> {employee.TinhTrangHonNhan}
            </p>
          </div>
          <div className="col-6">
            <p>
              <strong>Mã thuế TNCN:</strong> {employee.MaThueTNCN}
            </p>
            <p>
              <strong>Mã BH:</strong> {employee.MaBH}
            </p>
            <p>
              <strong>Tình trạng:</strong>{" "}
              <span
                style={{
                  color:
                    employee.TinhTrang === "Đang làm việc"
                      ? "#155724"
                      : "#721c24",
                  backgroundColor:
                    employee.TinhTrang === "Đang làm việc"
                      ? "#d4edda"
                      : "#f8d7da",
                  padding: "5px 10px",
                  borderRadius: "5px",
                }}
              >
                {employee.TinhTrang}
              </span>
            </p>
            <p>
              <strong>Ghi chú:</strong> {employee.GhiChu}
            </p>
            <p>
              <strong>Phòng ban:</strong> {employee.tenPhong}
            </p>
            <p>
              <strong>Chức vụ:</strong> {employee.tenChucVu}
            </p>
            <p>
              <strong>Lương ngày:</strong> {employee.luongChucVu.toLocaleString()} VNĐ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
