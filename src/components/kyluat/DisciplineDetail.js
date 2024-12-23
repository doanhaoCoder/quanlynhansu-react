import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const ChiTietKyLuat = () => {
  const { id } = useParams();
  const [discipline, setDiscipline] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiscipline = async () => {
      try {
        const disciplineRef = doc(db, "discipline", id);
        const disciplineSnap = await getDoc(disciplineRef);

        if (disciplineSnap.exists()) {
          const disciplineData = disciplineSnap.data();
          console.log("Discipline Data:", disciplineData);
          setDiscipline(disciplineData);

          const employeeRef = doc(db, "nhanvien", disciplineData.NhanVienID);
          const employeeSnap = await getDoc(employeeRef);

          if (employeeSnap.exists()) {
            const employeeData = employeeSnap.data();
            console.log("Employee Data:", employeeData);
            if (employeeData.ChucVu) {
              const chucVuRef = doc(db, "chucvu", employeeData.ChucVu);
              const chucVuSnap = await getDoc(chucVuRef);
              if (chucVuSnap.exists()) {
                const chucVuData = chucVuSnap.data();
                employeeData.tenChucVu = chucVuData.tenChucVu;
                employeeData.luongChucVu = chucVuData.luong;
              }
            }
            if (employeeData.PhongBan) {
              const phongBanRef = doc(db, "phongban", employeeData.PhongBan);
              const phongBanSnap = await getDoc(phongBanRef);
              if (phongBanSnap.exists()) {
                const phongBanData = phongBanSnap.data();
                employeeData.tenPhongBan = phongBanData.tenPhongBan;
              }
            }
            setEmployee(employeeData);
          } else {
            console.error("Không tìm thấy dữ liệu nhân viên!");
          }
        } else {
          console.error("Không tìm thấy dữ liệu kỷ luật!");
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu kỷ luật:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscipline();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!discipline || !employee) {
    return <div>Không tìm thấy thông tin kỷ luật.</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4" style={{ fontSize: "2rem", fontWeight: "bold" }}>
        <button
          className="btn btn-primary mb-2"
          onClick={() => navigate(-1)}
        >
          Trở lại
        </button>
        <br />
        Chi Tiết Kỷ Luật
      </h2>
      <div style={{ fontSize: "2rem", lineHeight: "2rem" }}>
        <div className="row">
          <div className="col-6">
            <p className="text-danger" style={{ fontSize: "1.8rem", lineHeight: "2rem" }}>
              <strong>Mã Nhân Viên:</strong> {employee.MaNV}
            </p>
            <p className="text-danger" style={{ fontSize: "1.8rem", lineHeight: "2rem" }}>
              <strong>Tên Nhân Viên:</strong> {employee.HoTenNV}
            </p>
            <p>
              <strong>Số Điện Thoại:</strong> {employee.SDT}
            </p>
            <p>
              <strong>Email:</strong> {employee.Email}
            </p>
            <p>
              <strong>Chức Vụ:</strong> {employee.tenChucVu}
            </p>
            <p>
              <strong>Phòng Ban:</strong> {employee.tenPhong}
            </p>
            <p>
              <strong>Lương Chức Vụ:</strong> {employee.luongChucVu?.toLocaleString()} VNĐ
            </p>
          </div>
          <div className="col-6">
            <p>
              <strong>Nội Dung Kỷ Luật:</strong> {discipline.NoiDungKyLuat}
            </p>
            <p>
              <strong>Ngày Kỷ Luật:</strong> {new Date(discipline.NgayKyLuat.seconds * 1000).toLocaleDateString()}
            </p>
            <p>
              <strong>Người Tạo:</strong> {discipline.NguoiTao}
            </p>
            <p>
              <strong>Ngày Tạo:</strong> {new Date(discipline.NgayTao).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChiTietKyLuat;
