import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom"; // Import useNavigate và useParams

const EditUser = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const { userId } = useParams();  // Lấy id người dùng từ URL
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setFormData(userDoc.data());
        } else {
          toast.error("Người dùng không tồn tại.");
          navigate("/dashboard/users");  // Quay lại danh sách người dùng nếu không tìm thấy
        }
      } catch (error) {
        console.error("Error fetching user: ", error);
        toast.error("Không thể tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, formData);
      toast.success("Cập nhật người dùng thành công!");
      navigate("/dashboard/users");  // Quay lại trang danh sách người dùng
    } catch (error) {
      console.error("Error updating user: ", error);
      toast.error("Không thể cập nhật người dùng.");
    }
  };

  return (
    <div>
      <h2>Chỉnh Sửa Người Dùng</h2>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Cập Nhật
          </button>
        </form>
      )}
    </div>
  );
};

export default EditUser;
