import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, deleteDoc, query, where, doc } from "firebase/firestore"; // Thêm 'doc' ở đây
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
// import { Link, useNavigate } from "react-router-dom";

const UserList = () => {
    const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
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
      } catch (error) {
        console.error("Error fetching users: ", error);
        toast.error("Không thể tải danh sách người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Kiểm tra xem username có bị trùng không
  const checkUsernameExists = async (username) => {
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Nếu có kết quả trả về thì trùng
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const { username, email, password, sdt, role, trangThai } = formData;

    if (!username || !email || !sdt) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    // Kiểm tra username có bị trùng không
    const isUsernameExist = await checkUsernameExists(username);
    if (isUsernameExist) {
      toast.error("Tên đăng nhập này đã tồn tại. Vui lòng chọn tên khác.");
      return;
    }

    try {
      await addDoc(collection(db, "users"), {
        username,
        email,
        password,
        sdt,
        role,
        trangThai,
        createdAt: new Date().toISOString(),
      });
      setFormData({ username: "", email: "", password: "", role: "Nhân viên", sdt: "", trangThai: "Đang hoạt động" });
      toast.success("Thêm tài khoản thành công!");
      // Cập nhật danh sách người dùng
      setUsers((prev) => [
        ...prev,
        { username, email, password, sdt, role, trangThai, createdAt: new Date().toISOString() },
      ]);
    } catch (error) {
      console.error("Error adding user: ", error);
      toast.error("Không thể thêm tài khoản.");
    }
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/chinh-sua-nguoi-dung/${id}`);  // Sử dụng navigate đúng cách
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        await deleteDoc(doc(db, "users", id));
        setUsers(users.filter((user) => user.id !== id));
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

      {/* Form thêm tài khoản */}
      <form onSubmit={handleAddUser} className="mt-4">
        <div className="row g-3">
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
            <select
              className="form-control"
              name="trangThai"
              value={formData.trangThai}
              onChange={handleChange}
            >
              <option value="Đang hoạt động">Đang hoạt động</option>
              <option value="Ngừng hoạt động">Ngừng hoạt động</option>
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
              {/* <th>Ngày Tạo</th> */}
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.sdt}</td>
                <td>{user.role}</td>
                <td>{user.trangThai}</td>
                {/* <td>{new Date(user.createdAt).toLocaleDateString()}</td> */}
                <td>
                <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() =>
                      navigate(`/dashboard/chinh-sua-nguoi-dung/${user.id}`)
                    }
                  >
                    <FaEdit /> Sửa
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
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
