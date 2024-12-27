import React, { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formData;

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      let user = null;

      querySnapshot.forEach((doc) => {
        if (doc.exists && doc.data().password === password) {
          // Lấy thông tin cần thiết
          const { username, ho, ten, role, email, trangThai } = doc.data();
          user = { username, ho, ten, role, email, trangThai };
        }
      });

      if (user) {
        // Lưu thông tin vào SessionStorage
        sessionStorage.setItem("user", JSON.stringify(user));
        // alert("Đăng nhập thành công!");
        navigate("/dashboard/thong-ke"); // Chuyển hướng đến trang dashboard
      } else {
        alert("Tên đăng nhập hoặc mật khẩu không đúng!");
      }
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  return (
    <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
      <div className="row gx-lg-5 align-items-center mb-5">
        <div className="col-lg-6 mb-5 mb-lg-0">
          <h1 className="my-5 display-5 fw-bold ls-tight">
            Welcome Back! <br />
            <span style={{ color: "hsl(218, 81%, 75%)" }}>Log in now</span>
          </h1>
          <p className="mb-4 opacity-70">
            Securely manage your account with ease. Enter your credentials to
            access the dashboard.
          </p>
        </div>

        <div className="col-lg-6 mb-5 mb-lg-0 position-relative">
          <div className="card bg-glass">
            <div className="card-body px-4 py-5 px-md-5">
              <form onSubmit={handleSubmit}>
                {/* Username */}
                <div className="form-outline mb-4">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                  <label className="form-label" htmlFor="username">
                    Username
                  </label>
                </div>

                {/* Password */}
                <div className="form-outline mb-4">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                  <label className="form-label" htmlFor="password">
                    Password
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="btn btn-primary btn-block mb-4"
                >
                  Log In
                </button>
                <p><a href="/dang-ky" class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">Đăng ký ngay</a></p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
