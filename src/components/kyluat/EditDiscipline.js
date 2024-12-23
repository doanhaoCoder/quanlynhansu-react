import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EditDiscipline = () => {
  const { id } = useParams();
  const [nhanVienList, setNhanVienList] = useState([]);
  const [disciplineData, setDisciplineData] = useState({
    NhanVienID: "",
    NoiDungKyLuat: "",
    NgayKyLuat: new Date(),
    NguoiTao: "",
    NgayTao: "",
  });
  const [error, setError] = useState("");
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

    const fetchDiscipline = async () => {
      const disciplineRef = doc(db, "discipline", id);
      const disciplineSnap = await getDoc(disciplineRef);
      if (disciplineSnap.exists()) {
        const data = disciplineSnap.data();
        setDisciplineData({
          ...data,
          NgayKyLuat: data.NgayKyLuat.toDate(),
        });
      } else {
        toast.error("Không tìm thấy dữ liệu kỷ luật!");
        navigate("/dashboard/ky-luat");
      }
    };

    fetchNhanVien();
    fetchDiscipline();
  }, [id, navigate]);

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

    if (!disciplineData.NoiDungKyLuat) {
      setError("Vui lòng nhập đủ các trường bắt buộc!");
      return;
    }

    try {
      const disciplineRef = doc(db, "discipline", id);
      await updateDoc(disciplineRef, {
        NoiDungKyLuat: disciplineData.NoiDungKyLuat,
        NgayKyLuat: disciplineData.NgayKyLuat,
      });

      toast.success("Cập nhật kỷ luật thành công!");
      navigate("/dashboard/ky-luat");
    } catch (error) {
      toast.error("Lỗi khi cập nhật kỷ luật: " + error.message);
    }
  };

  return (
    <div className="container edit-discipline">
        <button
          className="btn btn-primary mb-2"
          onClick={() => navigate(-1)} // Quay lại trang trước đó
        >
          Trở lại
        </button>
      <h2>Chỉnh Sửa Kỷ Luật</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="NhanVienID">Nhân Viên</label>
          <select
            id="NhanVienID"
            name="NhanVienID"
            className="form-control"
            value={disciplineData.NhanVienID}
            disabled
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
            maxLength="200"
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
          Cập Nhật Kỷ Luật
        </button>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
    </div>
  );
};

export default EditDiscipline;
