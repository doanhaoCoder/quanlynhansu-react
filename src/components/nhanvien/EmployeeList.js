import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
// import {
//   FaEye,
//   FaEdit,
//   FaTrashAlt,
//   FaSort,
//   FaSortUp,
//   FaSortDown,
// } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FaEye, FaEdit, FaTrashAlt } from "react-icons/fa";
import { FaSort } from "react-icons/fa";



const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" hoặc "desc"
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const employeeRef = collection(db, "nhanvien");
        const querySnapshot = await getDocs(employeeRef);
        const employeesData = [];
        querySnapshot.forEach((doc) => {
          employeesData.push({ ...doc.data(), id: doc.id });
        });
        setEmployees(employeesData);
      } catch (error) {
        console.error("Error fetching employees: ", error);
        toast.error("Không thể tải danh sách nhân viên.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Hàm xóa nhân viên
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      try {
        await deleteDoc(doc(db, "nhanvien", id));
        setEmployees(employees.filter((employee) => employee.id !== id));
        toast.success("Xóa nhân viên thành công!");
      } catch (error) {
        console.error("Error deleting employee: ", error);
        toast.error("Không thể xóa nhân viên.");
      }
    }
  };

  // Hàm xử lý sắp xếp
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Nếu cột hiện tại đã được sắp xếp, chỉ cần thay đổi thứ tự
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Nếu chọn cột mới, thiết lập cột và thứ tự mặc định là "asc"
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // Hàm sắp xếp danh sách nhân viên
  const sortedEmployees = [...employees].sort((a, b) => {
    if (!sortColumn) return 0; // Không sắp xếp nếu chưa chọn cột
    if (sortOrder === "asc") {
      return a[sortColumn]?.localeCompare?.(b[sortColumn]) || 0;
    } else {
      return b[sortColumn]?.localeCompare?.(a[sortColumn]) || 0;
    }
  });

  // Lọc danh sách nhân viên dựa trên tìm kiếm
  const filteredEmployees = sortedEmployees.filter((employee) => {
    return (
      employee.HoTenNV?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.MaNV?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Hàm hiển thị icon sắp xếp
  const renderSortIcon = (column) => {
    if (sortColumn === column) {
      return sortOrder === "asc" ? <FontAwesomeIcon icon={faArrowUp} /> :  <FontAwesomeIcon icon={faArrowDown} />
    }
    return <FaSort />;
  };

  return (
    <div className="mt-5">
      <h2>Danh Sách Nhân Viên 
        <a href="/dashboard/them-nhan-vien" className="btn btn-primary mb-2 ms-2">Thêm Nhân Viên</a>
      </h2>
      <div className="row mt-4">
        <div className="col-6">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm theo Họ tên hoặc Mã nhân viên"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table table-bordered table-striped mt-3">
          <thead className="table-dark">
            <tr>
              <th onClick={() => handleSort("STT")}>
                STT {renderSortIcon("STT")}
              </th>
              <th onClick={() => handleSort("MaNV")}>
                Mã NV {renderSortIcon("MaNV")}
              </th>
              <th onClick={() => handleSort("HoTenNV")}>
                Họ Tên NV {renderSortIcon("HoTenNV")}
              </th>
              <th onClick={() => handleSort("GioiTinh")}>
                Giới Tính {renderSortIcon("GioiTinh")}
              </th>
              <th onClick={() => handleSort("NgaySinh")}>
                Ngày Sinh {renderSortIcon("NgaySinh")}
              </th>
              <th onClick={() => handleSort("NoiSinh")}>
                Nơi Sinh {renderSortIcon("NoiSinh")}
              </th>
              <th onClick={() => handleSort("CCCD")}>
                CCCD {renderSortIcon("CCCD")}
              </th>
              <th onClick={() => handleSort("TinhTrang")}>
                Tình Trạng {renderSortIcon("TinhTrang")}
              </th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee, index) => (
              <tr key={employee.id}>
                <td>{index + 1}</td>
                <td>{employee.MaNV}</td>
                <td>{employee.HoTenNV}</td>
                <td>{employee.GioiTinh}</td>
                <td>{employee.NgaySinh}</td>
                <td>{employee.NoiSinh}</td>
                <td>{employee.CCCD}</td>
                <td>
                  <span
                    className={`badge ${
                      employee.TinhTrang === "Đang làm việc"
                        ? "bg-success"
                        : "bg-danger"
                    }`}
                  >
                    {employee.TinhTrang}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-primary btn-sm me-2 mt-2"
                    onClick={() =>
                      navigate(`/dashboard/chi-tiet-nhan-vien/${employee.id}`)
                    }
                  >
                    <FaEye /> Xem
                  </button>
                  <button
                    className="btn btn-warning btn-sm me-2 mt-2"
                    onClick={() =>
                      navigate(`/dashboard/chinh-sua-nhan-vien/${employee.id}`)
                    }
                  >
                    <FaEdit /> Sửa
                  </button>
                  <button
                    className="btn btn-danger btn-sm mt-2"
                    onClick={() => handleDelete(employee.id)}
                  >
                    <FaTrashAlt /> Xóa
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

export default EmployeeList;
