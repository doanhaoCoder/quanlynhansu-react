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

const EditThuong = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    maThuong: "",
    noiDungThuong: "",
    soTienThuong: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const sessionUser = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy thông tin chi tiết của thưởng cần sửa
        const docRef = doc(db, "thuong", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          data.soTienThuong = data.soTienThuong.toLocaleString();
          setFormData(data);
        } else {
          toast.error("Thưởng không tồn tại.");
          navigate("/dashboard/luong-thuong");
        }
      } catch (error) {
        console.error("Error fetching bonus data: ", error);
        toast.error("Không thể tải dữ liệu thưởng.");
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
      [name]: name === "soTienThuong" ? value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { maThuong, noiDungThuong, soTienThuong } = formData;

    if (!maThuong || !noiDungThuong || !soTienThuong) {
      toast.error("Mã thưởng, nội dung thưởng và số tiền thưởng không được để trống.");
      return;
    }

    try {
      const docRef = doc(db, "thuong", id);
      await updateDoc(docRef, {
        maThuong,
        noiDungThuong,
        soTienThuong: parseFloat(soTienThuong.replace(/,/g, "")), // Chuyển số tiền thưởng thành số
        lastModified: new Date().toISOString(),
        modifiedBy: sessionUser?.username,
      });
      toast.success("Cập nhật thưởng thành công!");
      navigate("/dashboard/luong-thuong");
    } catch (error) {
      console.error("Error updating bonus: ", error);
      toast.error("Không thể cập nhật thưởng.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-5">
      <h2>Chỉnh Sửa Thưởng</h2>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label>Mã Thưởng</label>
            <input
              type="text"
              className="form-control"
              name="maThuong"
              value={formData.maThuong}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label>Nội Dung Thưởng</label>
            <input
              type="text"
              className="form-control"
              name="noiDungThuong"
              value={formData.noiDungThuong}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label>Số Tiền Thưởng (VNĐ)</label>
            <input
              type="text"
              className="form-control"
              name="soTienThuong"
              value={formData.soTienThuong}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          Cập Nhật
        </button>
        <button
          type="button"
          className="btn btn-secondary mt-3 ms-2"
          onClick={() => navigate("/dashboard/luong-thuong")}
        >
          Quay Lại
        </button>
      </form>
    </div>
  );
};

export default EditThuong;
