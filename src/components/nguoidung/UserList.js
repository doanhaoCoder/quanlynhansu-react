import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, deleteDoc, query, where, doc } from "firebase/firestore"; 
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom'; // Thêm dòng này để sử dụng navigate

const UserList = () => {
  const navigate = useNavigate(); // Khai báo navigate
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // Danh sách người dùng đã lọc
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
  const [formData, setFormData] = useState({
    ho: "",
    ten: "",
    username: "",
    email: "",
    password: "",
    role: "Nhân viên",
    sdt: "",
    trangThai: "Đang hoạt động",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const userRef = collection(db, "users");
        const querySnapshot = await getDocs(userRef);
        const userData = [];
        querySnapshot.forEach((doc) => {
          userData.push({ ...doc.data(), id: doc.id });
        });
        setUsers(userData);
        setFilteredUsers(userData); // Gán danh sách đã lọc ban đầu
      } catch (error) {
        console.error("Error fetching users: ", error);
        toast.error("Không thể tải danh sách người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Hàm xử lý thay đổi trong form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Hàm tìm kiếm người dùng
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);

    if (e.target.value === "") {
      setFilteredUsers(users); // Nếu không có từ khóa tìm kiếm, hiển thị tất cả
    } else {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(e.target.value.toLowerCase()) ||
          user.email.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setFilteredUsers(filtered); // Cập nhật danh sách người dùng đã lọc
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const { username, email, password, sdt, role, trangThai, ho, ten } = formData;

    if (!username || !email || !sdt || !password || !ho || !ten) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      await addDoc(collection(db, "users"), {
        ho,
        ten,
        username,
        email,
        password,
        sdt,
        role,
        trangThai,
      });
      setFormData({ho: "", ten: "", username: "", email: "", password: "", role: "Nhân viên", sdt: "", trangThai: "Đang hoạt động" });
      toast.success("Thêm tài khoản thành công!");
      // Cập nhật danh sách người dùng
      setUsers((prev) => [
        ...prev,
        { ho, ten, username, email, password, sdt, role, trangThai },
      ]);
    } catch (error) {
      console.error("Error adding user: ", error);
      toast.error("Không thể thêm tài khoản.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        await deleteDoc(doc(db, "users", id));
        setUsers(users.filter((user) => user.id !== id));
        setFilteredUsers(filteredUsers.filter((user) => user.id !== id)); // Cập nhật danh sách người dùng đã lọc
        toast.success("Xóa tài khoản thành công!");
      } catch (error) {
        console.error("Error deleting user: ", error);
        toast.error("Không thể xóa tài khoản.");
      }
    }
  };

  return (
    <div className="mt-5">
      <h2>Danh Sách Tài Khoản</h2>

      {/* Thanh tìm kiếm */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Form thêm tài khoản */}
      <form onSubmit={handleAddUser} className="mt-4">
        <div className="row g-3">
        <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              name="ho"
              placeholder="Họ"
              value={formData.ho}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              name="ten"
              placeholder="Tên"
              value={formData.ten}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              name="username"
              placeholder="Tên đăng nhập"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-2">
            <input
              type="text"
              className="form-control"
              name="sdt"
              placeholder="Số điện thoại"
              value={formData.sdt}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-2">
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
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">
              Thêm Tài Khoản
            </button>
          </div>
        </div>
      </form>

      {/* Danh sách tài khoản */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table table-bordered table-striped mt-4">
          <thead className="table-dark">
            <tr>
              <th>STT</th>
              <th>Tên Đăng Nhập</th>
              <th>Email</th>
              <th>Số Điện Thoại</th>
              <th>Vai Trò</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.sdt}</td>
                <td>{user.role}</td>
                <td>{user.trangThai}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2 mt-2"
                    onClick={() => navigate(`/dashboard/chinh-sua-nguoi-dung/${user.id}`)}
                  >
                    <FaEdit /> Sửa
                  </button>
                  <button
                    className="btn btn-danger btn-sm mt-2"
                    onClick={() => handleDelete(user.id)}
                  >
                    <FaTrashAlt /> Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserList;
