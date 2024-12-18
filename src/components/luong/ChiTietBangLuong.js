import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const EmployeeDetail = () => {
  const { id } = useParams(); // Lấy ID nhân viên từ URL
  const [bangLuong, setbangLuong] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm lấy thông tin chi tiết nhân viên
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const bangluonRef = doc(db, "Luong", id); // Dùng ID để lấy tài liệu
        const bangluonSnap = await getDoc(bangluonRef);
        
        if (bangluonSnap.exists()) {
          const employeeData = bangluonSnap.data();
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
          setbangLuong(employeeData);
          console.log("Dữ liệu nhân viên sau khi thêm TenPhong và TenChucVu:", employeeData);
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
    <div>
      {bangLuong.GhiChu}
    </div>
  );
};

export default EmployeeDetail;
