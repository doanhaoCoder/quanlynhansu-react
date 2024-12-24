import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { toast } from "react-toastify";

const EditPhuCap = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    maPhuCap: "",
    noiDungPhuCap: "",
    soTienPhuCap: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const sessionUser = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy thông tin chi tiết của phụ cấp cần sửa
        const docRef = doc(db, "phucap", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          data.soTienPhuCap = data.soTienPhuCap.toLocaleString();
          setFormData(data);
        } else {
          toast.error("Phụ cấp không tồn tại.");
          navigate("/dashboard/phu-cap");
        }
      } catch (error) {
        console.error("Error fetching allowance data: ", error);
        toast.error("Không thể tải dữ liệu phụ cấp.");
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
      [name]: name === "soTienPhuCap" ? value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { maPhuCap, noiDungPhuCap, soTienPhuCap } = formData;

    if (!maPhuCap || !noiDungPhuCap || !soTienPhuCap) {
      toast.error("Mã phụ cấp, nội dung phụ cấp và số tiền phụ cấp không được để trống.");
      return;
    }

    try {
      const docRef = doc(db, "phucap", id);
      await updateDoc(docRef, {
        maPhuCap,
        noiDungPhuCap,
        soTienPhuCap: parseFloat(soTienPhuCap.replace(/,/g, "")), // Chuyển số tiền phụ cấp thành số
        lastModified: new Date().toISOString(),
        modifiedBy: sessionUser?.username,
      });
      toast.success("Cập nhật phụ cấp thành công!");
      navigate("/dashboard/phu-cap");
    } catch (error) {
      console.error("Error updating allowance: ", error);
      toast.error("Không thể cập nhật phụ cấp.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-5">
      <h2>Chỉnh Sửa Phụ Cấp</h2>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="row g-3">
          <div className="col-md-4">
            <label>Mã Phụ Cấp</label>
            <input
              type="text"
              className="form-control"
              name="maPhuCap"
              value={formData.maPhuCap}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label>Nội Dung Phụ Cấp</label>
            <input
              type="text"
              className="form-control"
              name="noiDungPhuCap"
              value={formData.noiDungPhuCap}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label>Số Tiền Phụ Cấp (VNĐ)</label>
            <input
              type="text"
              className="form-control"
              name="soTienPhuCap"
              value={formData.soTienPhuCap}
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
          onClick={() => navigate("/dashboard/phu-cap")}
        >
          Quay Lại
        </button>
      </form>
    </div>
  );
};

export default EditPhuCap;
