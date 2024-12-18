import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";

const EditDepartment = () => {
  const { id } = useParams(); // Lấy ID phòng ban từ URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    maPhong: "",
    tenPhong: "",
    moTa: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const docRef = doc(db, "phongban", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFormData(docSnap.data());
        } else {
          toast.error("Phòng ban không tồn tại.");
          navigate("/dashboard/danh-sach-phong-ban");
        }
      } catch (error) {
        console.error("Error fetching department:", error);
        toast.error("Không thể tải thông tin phòng ban.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartment();
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
    const { maPhong, tenPhong, moTa } = formData;

    if (!maPhong || !tenPhong) {
      toast.error("Mã phòng và tên phòng không được để trống.");
      return;
    }

    try {
      const currentUser = JSON.parse(sessionStorage.getItem("user"));
      const username = currentUser?.username || "Unknown"; // Lấy tên người dùng từ sessionStorage

      const docRef = doc(db, "phongban", id);
      await updateDoc(docRef, {
        maPhong,
        tenPhong,
        moTa,
        lastModified: new Date().toISOString(),
        modifiedBy: username, // Lưu tên người chỉnh sửa
      });

      toast.success("Cập nhật phòng ban thành công!");
      navigate("/dashboard/danh-sach-phong-ban");
    } catch (error) {
      console.error("Error updating department:", error);
      toast.error("Không thể cập nhật phòng ban.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-5">
      <h2>Chỉnh Sửa Phòng Ban</h2>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="maPhong" className="form-label">
              Mã Phòng
            </label>
            <input
              type="text"
              className="form-control"
              id="maPhong"
              name="maPhong"
              value={formData.maPhong}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="tenPhong" className="form-label">
              Tên Phòng
            </label>
            <input
              type="text"
              className="form-control"
              id="tenPhong"
              name="tenPhong"
              value={formData.tenPhong}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12">
            <label htmlFor="moTa" className="form-label">
              Mô Tả
            </label>
            <textarea
              className="form-control"
              id="moTa"
              name="moTa"
              value={formData.moTa}
              onChange={handleChange}
              rows="5"
              style={{ resize: "none" }}
            ></textarea>
          </div>
        </div>
        <div className="mt-4">
          <button type="submit" className="btn btn-success me-3">
            Cập Nhật
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/dashboard/danh-sach-phong-ban")}
          >
            Quay Lại
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDepartment;
