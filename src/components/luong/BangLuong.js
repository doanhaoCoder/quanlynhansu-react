import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FaEye, FaSort, FaTrashAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const BangLuong = () => {
  const navigate = useNavigate(); // Khai báo hook navigate

  const { id } = useParams(); // Lấy ID nhân viên từ URL
  const [employee, setEmployee] = useState(null);
  const [bangLuong, setBangLuong] = useState([]); // Danh sách bảng lương
  const [searchTerm, setSearchTerm] = useState(""); // Tìm kiếm
  const [filter, setFilter] = useState("all"); // Bộ lọc theo tháng, quý, năm
  const [filterDate, setFilterDate] = useState(new Date()); // Ngày lọc
  const [sortConfig, setSortConfig] = useState(null); // Cấu hình sắp xếp

  // Lấy dữ liệu bảng lương từ Firestore
  useEffect(() => {
    const fetchBangLuong = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Luong"));
        const data = querySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          stt: index + 1,
          ...doc.data(),
        }));

        const updatedData = await Promise.all(
          data.map(async (item) => {
            const nhanVienRef = doc(db, "nhanvien", item.NhanVienID);
            const nhanVienSnap = await getDoc(nhanVienRef);

            if (nhanVienSnap.exists()) {
              const nhanVienData = nhanVienSnap.data();
              item.MaNhanVien = nhanVienData.MaNV; // Add this line
              item.TenNhanVien = nhanVienData.HoTenNV;

              const chamCongChiTietQuery = query(
                collection(db, "ChamCongChiTiet"),
                where("MaChamCong", "==", item.MaChamCong),
                where("NhanVienID", "==", item.NhanVienID)
              );
              const chamCongChiTietSnap = await getDocs(chamCongChiTietQuery);
              const chamCongChiTietData = chamCongChiTietSnap.docs.map((doc) =>
                doc.data()
              );

              if (chamCongChiTietData.length > 0) {
                item.SoNgayCong = chamCongChiTietData[0].NgayCongThucTe;
              } else {
                item.SoNgayCong = "Chấm công này đã bị xóa";
              }
            } else {
              item.TenNhanVien = "Nhân viên nầy đã bị xóa";
              item.SoNgayCong = "Nhân viên này đã bị xóa";
            }
            return item;
          })
        );

        setBangLuong(updatedData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu bảng lương:", error);
      }
    };

    fetchBangLuong();
  }, []);

  // Xử lý sắp xếp
  const handleSort = (key) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    const sortedData = [...bangLuong].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
    setBangLuong(sortedData);
  };

  // Hàm render icon sắp xếp
  const renderSortIcon = (key) => {
    if (sortConfig && sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? (
        <FontAwesomeIcon icon={faArrowUp} />
      ) : (
        <FontAwesomeIcon icon={faArrowDown} />
      );
    }
    return <FaSort />;
  };

  // Xử lý xóa bản ghi
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "Luong", id));
      setBangLuong(bangLuong.filter((item) => item.id !== id));
      toast.success("Xóa thành công!");
    } catch (error) {
      toast.error("Lỗi khi xóa: " + error.message);
    }
  };

  // Lọc dữ liệu theo tháng, quý, năm
  const filteredBangLuong = bangLuong.filter((item) => {
    const ngayTinhLuong = new Date(item.NgayTinhLuong);

    if (filter === "all") return true;

    if (filter === "month") {
      return (
        ngayTinhLuong.getMonth() === filterDate.getMonth() &&
        ngayTinhLuong.getFullYear() === filterDate.getFullYear()
      );
    } else if (filter === "quarter") {
      const selectedQuarter = Math.floor(filterDate.getMonth() / 3);
      const recordQuarter = Math.floor(ngayTinhLuong.getMonth() / 3);
      return (
        selectedQuarter === recordQuarter &&
        ngayTinhLuong.getFullYear() === filterDate.getFullYear()
      );
    } else if (filter === "year") {
      return ngayTinhLuong.getFullYear() === filterDate.getFullYear();
    }
    return true;
  });

  // Tìm kiếm dữ liệu
  const searchedBangLuong = filteredBangLuong.filter(
    (item) =>
      item.MaLuong.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.MaNhanVien.toLowerCase().includes(searchTerm.toLowerCase()) // Updated this line
  );

  // Hàm xuất dữ liệu ra Excel
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bảng Lương");

    // Thêm tiêu đề cột
    worksheet.columns = [
      { header: "STT", key: "stt", width: 10 },
      { header: "Mã Lương", key: "MaLuong", width: 20 },
      { header: "Mã Nhân Viên", key: "MaNhanVien", width: 20 },
      { header: "Tên Nhân Viên", key: "TenNhanVien", width: 30 },
      { header: "Chức Vụ", key: "ChucVu", width: 20 },
      { header: "Phòng Ban", key: "PhongBan", width: 20 },
      { header: "Lương Cơ Bản", key: "LuongChucVu", width: 20 },
      { header: "Số Ngày Công", key: "SoNgayCong", width: 20 },
      { header: "Phụ Cấp", key: "PhuCap", width: 20 },
      { header: "Thưởng", key: "Thuong", width: 20 },
      { header: "Tổng Lương", key: "TongLuong", width: 20 },
      { header: "Bảo Hiểm", key: "BaoHiem", width: 20 },
      { header: "Lương Thực Nhận", key: "LuongThucNhan", width: 20 },
      { header: "Ngày Tính Lương", key: "NgayTinhLuong", width: 20 },
      { header: "Người Tạo", key: "NguoiTao", width: 20 },
    ];

    // Thêm dữ liệu vào worksheet
    searchedBangLuong.forEach((item, index) => {
      worksheet.addRow({
        stt: index + 1,
        MaLuong: item.MaLuong,
        MaNhanVien: item.MaNhanVien || "Nhân viên nầy đã bị xóa",
        TenNhanVien: item.TenNhanVien,
        ChucVu: item.ChucVu,
        PhongBan: item.PhongBan,
        LuongChucVu: item.LuongChucVu,
        SoNgayCong: item.SoNgayCong,
        PhuCap: item.PhuCap,
        Thuong: item.Thuong,
        TongLuong: item.TongLuong,
        BaoHiem: item.BaoHiem,
        LuongThucNhan: item.LuongThucNhan.toLocaleString() + " VNĐ",
        NgayTinhLuong: new Date(item.NgayTinhLuong).toLocaleDateString(),
        NguoiTao: item.NguoiTao,
      });
    });

    // Xuất file Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "BangLuong.xlsx");
  };

  return (
    <div className=" mt-4">
      <h2>
        Bảng Lương
        <button className="btn btn-success" onClick={exportToExcel}>
          Xuất Excel
        </button>
      </h2>
      {/* Tìm kiếm và lọc */}
      <div className="d-flex justify-content-between mb-3">
        <select
          className="form-select me-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Tất cả</option>
          <option value="month">Theo tháng</option>
          <option value="quarter">Theo quý</option>
          <option value="year">Theo năm</option>
        </select>

        <DatePicker
          selected={filterDate}
          onChange={(date) => setFilterDate(date)}
          showMonthYearPicker={filter === "month"}
          showQuarterYearPicker={filter === "quarter"}
          showYearPicker={filter === "year"}
          dateFormat={
            filter === "month"
              ? "MM/yyyy"
              : filter === "quarter"
              ? "QQ/yyyy"
              : "yyyy"
          }
          className="form-control"
        />
        <input
          type="text"
          className="form-control me-2"
          placeholder="Tìm kiếm theo mã lương hoặc mã nhân viên" // Updated this line
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Bảng dữ liệu */}
      <table className="table table-bordered table-striped mt-3">
        <thead className="table-dark">
          <tr>
            <th onClick={() => handleSort("stt")}>
              STT {renderSortIcon("stt")}
            </th>
            <th onClick={() => handleSort("MaLuong")}>
              Mã Lương {renderSortIcon("MaLuong")}
            </th>
            <th onClick={() => handleSort("MaNhanVien")}>
              Mã Nhân Viên {renderSortIcon("MaNhanVien")}
            </th>{" "}
            {/* Add this line */}
            <th onClick={() => handleSort("TenNhanVien")}>
              Tên Nhân Viên {renderSortIcon("TenNhanVien")}
            </th>
            <th onClick={() => handleSort("ChucVu")}>
              Chức Vụ {renderSortIcon("ChucVu")}
            </th>
            <th onClick={() => handleSort("SoNgayCong")}>
              Số Ngày Công {renderSortIcon("SoNgayCong")}
            </th>
            <th onClick={() => handleSort("TongLuong")}>
              Lương thực nhận {renderSortIcon("TongLuong")}
            </th>
            <th onClick={() => handleSort("NgayTinhLuong")}>
              Ngày Chấm {renderSortIcon("NgayTinhLuong")}
            </th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {searchedBangLuong.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.MaLuong}</td>
              <td>{item.MaNhanVien || "Nhân viên nầy đã bị xóa"}</td>{" "}
              {/* Add this line */}
              <td>{item.TenNhanVien}</td>
              <td>{item.ChucVu}</td>
              <td>{item.SoNgayCong}</td>
              <td>{item.LuongThucNhan.toLocaleString()} VNĐ</td>
              <td>{new Date(item.NgayTinhLuong).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn btn-info me-2 mt-2"
                  onClick={() =>
                    navigate(`/dashboard/chi-tiet-bang-luong/${item.id}`)
                  }
                >
                  <FaEye />
                </button>
                <button
                  className="btn btn-danger mt-2"
                  onClick={() => handleDelete(item.id)}
                >
                  <FaTrashAlt />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {searchedBangLuong.length === 0 && <p>Không có dữ liệu phù hợp.</p>}
    </div>
  );
};

export default BangLuong;
