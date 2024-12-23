import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const Discipline = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const sessionUser = JSON.parse(sessionStorage.getItem("user"));
  const [nhanVienList, setNhanVienList] = useState([]);
  const [disciplineData, setDisciplineData] = useState({
    NhanVienID: "",
    NoiDungKyLuat: "",
    NgayKyLuat: new Date(),
    NguoiTao: sessionUser?.username,
    NgayTao: new Date().toISOString(),
  });
  const [error, setError] = useState("");
  const [disciplineList, setDisciplineList] = useState([]);
  const [filter, setFilter] = useState("all");
  const [filterDate, setFilterDate] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNhanVien = async () => {
      const nhanVienSnap = await getDocs(collection(db, "nhanvien"));
      const data = nhanVienSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNhanVienList(data);
    };

    const fetchDisciplines = async () => {
      const disciplineSnap = await getDocs(collection(db, "discipline"));
      const data = disciplineSnap.docs.map((doc, index) => ({
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
            item.MaNV = nhanVienData.MaNV;
            item.TenNhanVien = nhanVienData.HoTenNV;
          } else {
            item.MaNV = "Không tìm thấy";
            item.TenNhanVien = "Không tìm thấy";
          }
          return item;
        })
      );

      setDisciplineList(updatedData);
    };

    fetchNhanVien();
    fetchDisciplines();
  }, []);

  const handleNhanVienChange = (e) => {
    setDisciplineData({
      ...disciplineData,
      NhanVienID: e.target.value,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDisciplineData({
      ...disciplineData,
      [name]: value,
    });
  };

  const handleDateChange = (date) => {
    setDisciplineData({
      ...disciplineData,
      NgayKyLuat: date,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!disciplineData.NhanVienID || !disciplineData.NoiDungKyLuat) {
      setError("Vui lòng nhập đủ các trường bắt buộc!");
      return;
    }

    try {
      await addDoc(collection(db, "discipline"), {
        ...disciplineData,
        NgayTao: new Date().toISOString(),
      });

      toast.success("Thêm kỷ luật thành công!");
      setDisciplineData({
        NhanVienID: "",
        NoiDungKyLuat: "",
        NgayKyLuat: new Date(),
        NguoiTao: sessionUser?.username,
        NgayTao: new Date().toISOString(),
      });

      const disciplineSnap = await getDocs(collection(db, "discipline"));
      const data = disciplineSnap.docs.map((doc, index) => ({
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
            item.MaNV = nhanVienData.MaNV;
            item.TenNhanVien = nhanVienData.HoTenNV;
          } else {
            item.MaNV = "Không tìm thấy";
            item.TenNhanVien = "Không tìm thấy";
          }
          return item;
        })
      );

      setDisciplineList(updatedData);
    } catch (error) {
      toast.error("Lỗi khi thêm kỷ luật: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "discipline", id));
      toast.success("Xóa kỷ luật thành công!");
      setDisciplineList(disciplineList.filter((item) => item.id !== id));
    } catch (error) {
      toast.error("Lỗi khi xóa kỷ luật: " + error.message);
    }
  };

  const filteredDisciplines = disciplineList.filter((item) => {
    const ngayKyLuat = new Date(item.NgayKyLuat);

    if (filter === "all") return true;

    if (filter === "month") {
      return (
        ngayKyLuat.getMonth() === filterDate.getMonth() &&
        ngayKyLuat.getFullYear() === filterDate.getFullYear()
      );
    } else if (filter === "quarter") {
      const selectedQuarter = Math.floor(filterDate.getMonth() / 3);
      const recordQuarter = Math.floor(ngayKyLuat.getMonth() / 3);
      return (
        selectedQuarter === recordQuarter &&
        ngayKyLuat.getFullYear() === filterDate.getFullYear()
      );
    } else if (filter === "year") {
      return ngayKyLuat.getFullYear() === filterDate.getFullYear();
    }
    return true;
  });

  const searchedDisciplines = filteredDisciplines.filter(
    (item) =>
      item.MaNV.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.NoiDungKyLuat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="discipline">
      <>
        <h2>Thêm Kỷ Luật</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="NhanVienID">Chọn Nhân Viên</label>
            <select
              id="NhanVienID"
              name="NhanVienID"
              className="form-control"
              value={disciplineData.NhanVienID}
              onChange={handleNhanVienChange}
              required
            >
              <option value="">Chọn nhân viên</option>
              {nhanVienList.map((nv) => (
                <option key={nv.id} value={nv.id}>
                  {nv.MaNV} - {nv.HoTenNV}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="NoiDungKyLuat">Nội Dung Kỷ Luật</label>
            <textarea
              id="NoiDungKyLuat"
              name="NoiDungKyLuat"
              className="form-control"
              value={disciplineData.NoiDungKyLuat}
              onChange={handleChange}
              rows="3"
              maxLength="200" // Limit content length
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="NgayKyLuat">Ngày Kỷ Luật</label>
            <DatePicker
              selected={disciplineData.NgayKyLuat}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              className="form-control"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Thêm Kỷ Luật
          </button>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </form>

        <h2 className="mt-5">Danh Sách Kỷ Luật</h2>
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
            placeholder="Tìm kiếm theo mã nhân viên hoặc nội dung kỷ luật"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <table className="table table-bordered table-striped mt-3">
          <thead className="table-dark">
            <tr>
              <th>STT</th>
              <th>Mã Nhân Viên</th>
              <th>Tên Nhân Viên</th>
              <th>Nội Dung Kỷ Luật</th>
              <th>Ngày Kỷ Luật</th>
              <th>Người Tạo</th>
              <th>Ngày Tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {searchedDisciplines.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.MaNV}</td>
                <td>{item.TenNhanVien}</td>
                <td>{item.NoiDungKyLuat.length > 30 ? item.NoiDungKyLuat.substring(0, 30) + "..." : item.NoiDungKyLuat}</td>
                <td>{new Date(item.NgayKyLuat.seconds * 1000).toLocaleDateString()}</td>
                <td>{item.NguoiTao}</td>
                <td>{new Date(item.NgayTao).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-info me-2 mt-2"
                    onClick={() => navigate(`/dashboard/chi-tiet-ky-luat/${item.id}`)}
                  >
                    <FaEye />
                  </button>
                  <button
                    className="btn btn-warning me-2 mt-2"
                    onClick={() => navigate(`/dashboard/sua-ky-luat/${item.id}`)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn btn-danger mt-2"
                    onClick={() => handleDelete(item.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {searchedDisciplines.length === 0 && <p>Không có dữ liệu phù hợp.</p>}
      </>
    </div>
  );
};

export default Discipline;
