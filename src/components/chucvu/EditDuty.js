import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { toast } from "react-toastify";

const EditPosition = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    maChucVu: "",
    tenChucVu: "",
    moTa: "",
    luong: "",
  });
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const sessionUser = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy thông tin chi tiết của chức vụ cần sửa
        const docRef = doc(db, "chucvu", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data());
        } else {
          toast.error("Chức vụ không tồn tại.");
          navigate("/dashboard/danh-sach-chuc-vu");
        }

        // Lấy danh sách các chức vụ để kiểm tra trùng lặp mã
        const positionSnapshot = await getDocs(collection(db, "chucvu"));
        const positionData = [];
        positionSnapshot.forEach((doc) => {
          positionData.push({ ...doc.data(), id: doc.id });
        });
        setPositions(positionData);
      } catch (error) {
        console.error("Error fetching position data: ", error);
        toast.error("Không thể tải dữ liệu chức vụ.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { maChucVu, tenChucVu, moTa, luong } = formData;

    if (!maChucVu || !tenChucVu || !luong) {
      toast.error("Mã chức vụ, tên chức vụ và lương không được để trống.");
      return;
    }

    // Kiểm tra trùng mã chức vụ (ngoại trừ bản ghi hiện tại)
    const isDuplicate = positions.some(
      (pos) => pos.maChucVu === maChucVu && pos.id !== id
    );
    if (isDuplicate) {
      toast.error("Mã chức vụ đã tồn tại. Vui lòng nhập mã khác.");
      return;
    }

    try {
      const docRef = doc(db, "chucvu", id);
      await updateDoc(docRef, {
        maChucVu,
        tenChucVu,
        moTa,
        luong: parseFloat(luong), // Chuyển lương thành số
        lastModified: new Date().toISOString(),
        modifiedBy: sessionUser?.username,
      });
      toast.success("Cập nhật chức vụ thành công!");
      navigate("/dashboard/danh-sach-chuc-vu");
    } catch (error) {
      console.error("Error updating position: ", error);
      toast.error("Không thể cập nhật chức vụ.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-5">
      <h2>Chỉnh Sửa Chức Vụ</h2>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label>Mã Chức Vụ</label>
            <input
              type="text"
              className="form-control"
              name="maChucVu"
              value={formData.maChucVu}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label>Tên Chức Vụ</label>
            <input
              type="text"
              className="form-control"
              name="tenChucVu"
              value={formData.tenChucVu}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label>Lương Ngày (VNĐ)</label>
            <input
              type="number"
              className="form-control"
              name="luong"
              value={formData.luong}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="row g-3 mt-3">
          <div className="col-md-12">
            <label>Mô Tả</label>
            <textarea
              className="form-control"
              name="moTa"
              rows="4"
              value={formData.moTa}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          Cập Nhật
        </button>
        <button
          type="button"
          className="btn btn-secondary mt-3 ms-2"
          onClick={() => navigate("/dashboard/danh-sach-chuc-vu")}
        >
          Quay Lại
        </button>
      </form>
    </div>
  );
};

export default EditPosition;
