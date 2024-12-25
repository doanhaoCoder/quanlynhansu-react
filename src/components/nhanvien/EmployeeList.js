import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FaEye, FaEdit, FaTrashAlt, FaSort } from "react-icons/fa";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const employeeRef = collection(db, "nhanvien");
        const querySnapshot = await getDocs(employeeRef);
        const employeesData = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const employee = { ...docSnapshot.data(), id: docSnapshot.id };

            if (employee.PhongBan) {
              const phongBanRef = doc(db, "phongban", employee.PhongBan);
              const phongBanSnap = await getDoc(phongBanRef);
              if (phongBanSnap.exists()) {
                employee.tenPhong = phongBanSnap.data().tenPhong;
              }
            }

            if (employee.ChucVu) {
              const chucVuRef = doc(db, "chucvu", employee.ChucVu);
              const chucVuSnap = await getDoc(chucVuRef);
              if (chucVuSnap.exists()) {
                const chucVuData = chucVuSnap.data();
                employee.tenChucVu = chucVuData.tenChucVu;
                employee.luongChucVu = chucVuData.luong;
              }
            }

            return employee;
          })
        );
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
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // Hàm sắp xếp danh sách nhân viên
  const sortedEmployees = [...employees].sort((a, b) => {
    if (!sortColumn) return 0;
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
      return sortOrder === "asc" ? <FontAwesomeIcon icon={faArrowUp} /> : <FontAwesomeIcon icon={faArrowDown} />;
    }
    return <FaSort />;
  };

  // Hàm xuất dữ liệu ra Excel
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Danh Sách Nhân Viên");

    // Thêm tiêu đề cột
    worksheet.columns = [
      { header: "STT", key: "stt", width: 10 },
      { header: "Mã NV", key: "MaNV", width: 20 },
      { header: "Họ Tên NV", key: "HoTenNV", width: 30 },
      { header: "Email", key: "Email", width: 30 },
      { header: "Số Điện Thoại", key: "SDT", width: 20 },
      { header: "Ngày Sinh", key: "NgaySinh", width: 20 },
      { header: "Giới Tính", key: "GioiTinh", width: 10 },
      { header: "CCCD", key: "CCCD", width: 20 },
      { header: "Ngày Cấp", key: "NgayCap", width: 20 },
      { header: "Nơi Cấp", key: "NoiCap", width: 20 },
      { header: "Dân Tộc", key: "DanToc", width: 20 },
      { header: "Tôn Giáo", key: "TonGiao", width: 20 },
      { header: "Địa Chỉ Tạm Trú", key: "DCTamTru", width: 30 },
      { header: "Địa Chỉ Thường Trú", key: "DCThuongTru", width: 30 },
      { header: "Nơi Sinh", key: "NoiSinh", width: 20 },
      { header: "Trình Độ Học Vấn", key: "TrinhDoHocVan", width: 20 },
      { header: "Trình Độ Chuyên Môn", key: "TrinhDoChuyenMon", width: 20 },
      { header: "Tình Trạng Hôn Nhân", key: "TinhTrangHonNhan", width: 20 },
      { header: "Mã Thuế TNCN", key: "MaThueTNCN", width: 20 },
      { header: "Mã BH", key: "MaBH", width: 20 },
      { header: "Tình Trạng", key: "TinhTrang", width: 20 },
      { header: "Ghi Chú", key: "GhiChu", width: 30 },
      { header: "Phòng Ban", key: "tenPhong", width: 20 },
      { header: "Chức Vụ", key: "tenChucVu", width: 20 },
      { header: "Lương Ngày", key: "luongChucVu", width: 20 },
    ];

    // Thêm dữ liệu vào worksheet
    filteredEmployees.forEach((employee, index) => {
      worksheet.addRow({
        stt: index + 1,
        MaNV: employee.MaNV,
        HoTenNV: employee.HoTenNV,
        Email: employee.Email,
        SDT: employee.SDT,
        NgaySinh: employee.NgaySinh,
        GioiTinh: employee.GioiTinh,
        CCCD: employee.CCCD,
        NgayCap: employee.NgayCap,
        NoiCap: employee.NoiCap,
        DanToc: employee.DanToc,
        TonGiao: employee.TonGiao,
        DCTamTru: employee.DCTamTru,
        DCThuongTru: employee.DCThuongTru,
        NoiSinh: employee.NoiSinh,
        TrinhDoHocVan: employee.TrinhDoHocVan,
        TrinhDoChuyenMon: employee.TrinhDoChuyenMon,
        TinhTrangHonNhan: employee.TinhTrangHonNhan,
        MaThueTNCN: employee.MaThueTNCN,
        MaBH: employee.MaBH,
        TinhTrang: employee.TinhTrang,
        GhiChu: employee.GhiChu,
        tenPhong: employee.tenPhong,
        tenChucVu: employee.tenChucVu,
        luongChucVu: employee.luongChucVu.toLocaleString() + " VNĐ",
      });
    });

    // Xuất file Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "DanhSachNhanVien.xlsx");
  };

  return (
    <div className="mt-5">
      <h2>
        Danh Sách Nhân Viên
        <a href="/dashboard/them-nhan-vien" className="btn btn-primary mb-2 ms-2">
          Thêm Nhân Viên
        </a>
        <button className="btn btn-success mb-2 ms-2" onClick={exportToExcel}>
          Xuất Excel
        </button>
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
