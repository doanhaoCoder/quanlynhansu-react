import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";

const EditUser = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ho: "",
    ten: "",
    username: "",
    email: "",
    password: "",
    sdt: "",
    role: "Nhân viên",
    trangThai: "Chờ phê duyệt",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const userRef = doc(db, "users", id);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setFormData(userSnap.data());
        } else {
          toast.error("Người dùng không tồn tại.");
          navigate("/dashboard/danh-sach-nguoi-dung");
        }
      } catch (error) {
        console.error("Error fetching user: ", error);
        toast.error("Không thể tải dữ liệu người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
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
    const { username, email, sdt, role, trangThai, password, ho, ten } =
      formData;

    if (!username || !email || !sdt || !password || !ho || !ten) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        ho,
        ten,
        username,
        password,
        email,
        sdt,
        role,
        trangThai,
      });
      toast.success("Cập nhật thông tin thành công!");
      navigate("/dashboard/danh-sach-nguoi-dung");
    } catch (error) {
      console.error("Error updating user: ", error);
      toast.error("Không thể cập nhật thông tin.");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Chỉnh Sửa Người Dùng</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Họ</label>
              <input
                type="text"
                className="form-control"
                name="ho"
                value={formData.ho}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Tên</label>
              <input
                type="text"
                className="form-control"
                name="ten"
                value={formData.ten}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Tên Đăng Nhập</label>
              <input
                type="text"
                className="form-control"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Số Điện Thoại</label>
              <input
                type="text"
                className="form-control"
                name="sdt"
                value={formData.sdt}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Vai Trò</label>
              <select
                className="form-control"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Nhân viên">Nhân viên</option>
                <option value="Quản trị viên">Quản trị viên</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Trạng Thái</label>
              <select
                className="form-control"
                name="trangThai"
                value={formData.trangThai}
                onChange={handleChange}
              >
                <option value={formData.trangThai}>{formData.trangThai}</option>
                {/* <option value="Chờ phê duyệt">Chờ phê duyệt</option> */}
                <option value="Đang hoạt động">Đang hoạt động</option>
                <option value="Ngừng hoạt động">Ngừng hoạt động</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Password (mật khẩu)</label>
              <input
                type="text"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-12">
              <button type="submit" className="btn btn-primary">
                Lưu Thay Đổi
              </button>
              <button
                type="button"
                className="btn btn-secondary ms-3"
                onClick={() => navigate("/dashboard/danh-sach-nguoi-dung")}
              >
                Quay Lại
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditUser;
