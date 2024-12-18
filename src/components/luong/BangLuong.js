import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const BangLuong = () => {
  const navigate = useNavigate(); // Khai báo hook navigate

  const { id } = useParams(); // Lấy ID nhân viên từ URL
  const [employee, setEmployee] = useState(null);
  const [bangLuong, setBangLuong] = useState([]); // Danh sách bảng lương
  const [searchTerm, setSearchTerm] = useState(""); // Tìm kiếm
  const [filter, setFilter] = useState("all"); // Bộ lọc theo tháng, quý, năm
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
              item.TenNhanVien = nhanVienData.HoTenNV;
              item.ChucVu = nhanVienData.ChucVu;

              if (nhanVienData.ChucVu) {
                const chucVuRef = doc(db, "chucvu", nhanVienData.ChucVu);
                const chucVuSnap = await getDoc(chucVuRef);

                if (chucVuSnap.exists()) {
                  const chucVuData = chucVuSnap.data();
                  item.TenChucVu = chucVuData.tenChucVu;
                  item.LuongChucVu = chucVuData.luong;
                }
              }
            } else {
              item.TenNhanVien = "Không tìm thấy";
              item.ChucVu = "Không tìm thấy";
            }
            return item;
          })
        );

        setBangLuong(updatedData);
        console.error("db:", updatedData);
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
    if (filter === "all") return true;
    const ngayTinhLuong = new Date(item.NgayTinhLuong);
    const currentDate = new Date();

    if (filter === "month") {
      return (
        ngayTinhLuong.getMonth() === currentDate.getMonth() &&
        ngayTinhLuong.getFullYear() === currentDate.getFullYear()
      );
    } else if (filter === "quarter") {
      const currentQuarter = Math.floor(currentDate.getMonth() / 3);
      const recordQuarter = Math.floor(ngayTinhLuong.getMonth() / 3);
      return (
        currentQuarter === recordQuarter &&
        ngayTinhLuong.getFullYear() === currentDate.getFullYear()
      );
    } else if (filter === "year") {
      return ngayTinhLuong.getFullYear() === currentDate.getFullYear();
    }
    return true;
  });

  // Tìm kiếm dữ liệu
  const searchedBangLuong = filteredBangLuong.filter(
    (item) =>
      item.MaLuong.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.TenNhanVien.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2>Bảng Lương</h2>

      {/* Tìm kiếm và lọc */}
      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Tìm kiếm theo mã lương hoặc tên nhân viên"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="form-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Tất cả</option>
          <option value="month">Theo tháng</option>
          <option value="quarter">Theo quý</option>
          <option value="year">Theo năm</option>
        </select>
      </div>

      {/* Bảng dữ liệu */}
      <table className="table table-bordered table-striped mt-3">
        <thead className="table-dark">
          <tr>
            <th onClick={() => handleSort("stt")}>STT {renderSortIcon("stt")}</th>
            <th onClick={() => handleSort("MaLuong")}>Mã Lương {renderSortIcon("MaLuong")}</th>
            <th onClick={() => handleSort("TenNhanVien")}>Tên Nhân Viên {renderSortIcon("TenNhanVien")}</th>
            <th onClick={() => handleSort("ChucVu")}>Chức Vụ {renderSortIcon("ChucVu")}</th>
            <th onClick={() => handleSort("SoNgayCong")}>Số Ngày Công {renderSortIcon("SoNgayCong")}</th>
            <th onClick={() => handleSort("TongLuong")}>Tổng Lương {renderSortIcon("TongLuong")}</th>
            <th onClick={() => handleSort("NgayTinhLuong")}>Ngày Chấm {renderSortIcon("NgayTinhLuong")}</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {searchedBangLuong.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.MaLuong}</td>
              <td>{item.TenNhanVien}</td>
              <td>{item.TenChucVu}</td>
              <td>{item.SoNgayCong}</td>
              <td>{item.TongLuong.toLocaleString()} đ</td>
              <td>{new Date(item.NgayTinhLuong).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn btn-info me-2"
                  onClick={() =>
                    navigate(`/dashboard/chi-tiet-bang-luong/${item.id}`)
                  }
                >
                  Xem Chi Tiết
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(item.id)}
                >
                  Xóa
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
