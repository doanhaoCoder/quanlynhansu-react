import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { FaEye } from "react-icons/fa";

const DepartmentView = () => {
  const { id } = useParams(); // Lấy ID phòng ban từ URL
  const [employees, setEmployees] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const departmentRef = doc(db, "phongban", id);
        const departmentSnap = await getDoc(departmentRef);
        if (departmentSnap.exists()) {
          setDepartmentName(departmentSnap.data().tenPhong);
        }

        const q = query(collection(db, "nhanvien"), where("PhongBan", "==", id));
        const querySnapshot = await getDocs(q);
        const employeeData = [];
        querySnapshot.forEach((doc) => {
          employeeData.push({ ...doc.data(), id: doc.id });
        });

        const updatedEmployeeData = await Promise.all(
          employeeData.map(async (employee) => {
            if (employee.ChucVu) {
              const chucVuRef = doc(db, "chucvu", employee.ChucVu);
              const chucVuSnap = await getDoc(chucVuRef);
              if (chucVuSnap.exists()) {
                employee.tenChucVu = chucVuSnap.data().tenChucVu;
              }
            }
            return employee;
          })
        );

        setEmployees(updatedEmployeeData);
      } catch (error) {
        console.error("Error fetching employees: ", error);
        toast.error("Không thể tải danh sách nhân viên.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-5">
      <h2>Danh Sách Nhân Viên Trong Phòng Ban: {departmentName}</h2>
      <button className="btn btn-primary mb-3" onClick={() => navigate(-1)}>
        Trở lại
      </button>
      {employees.length === 0 ? (
        <p>Không có nhân viên nào trong phòng ban này.</p>
      ) : (
        <table className="table table-bordered table-striped mt-4">
          <thead className="table-dark">
            <tr>
              <th>STT</th>
              <th>Mã Nhân Viên</th>
              <th>Họ và Tên</th>
              <th>Email</th>
              <th>Số Điện Thoại</th>
              <th>Chức Vụ</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => (
              <tr key={employee.id}>
                <td>{index + 1}</td>
                <td>{employee.MaNV}</td>
                <td>{employee.HoTenNV}</td>
                <td>{employee.Email}</td>
                <td>{employee.SDT}</td>
                <td>{employee.tenChucVu}</td>
                <td>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => navigate(`/dashboard/chi-tiet-nhan-vien/${employee.id}`)}
                  >
                    <FaEye /> Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DepartmentView;
