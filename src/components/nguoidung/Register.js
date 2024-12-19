import React, { useState } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    ho: "",
    ten: "",
    email: "",
    sdt: "",
    role: "Chờ phê duyệt", // Default role
    trangThai: "Chờ phê duyệt", // Default status
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = async () => {
    const { username, password, confirmPassword, email, sdt, ho, ten } =
      formData;

    // Kiểm tra các trường bắt buộc
    if (
      !username ||
      !password ||
      !confirmPassword ||
      !email ||
      !sdt ||
      !ho ||
      !ten
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return false;
    }

    // Kiểm tra mật khẩu trùng khớp
    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp.");
      return false;
    }

    // Kiểm tra trùng tên đăng nhập
    const userQuery = query(
      collection(db, "users"),
      where("username", "==", username)
    );
    const querySnapshot = await getDocs(userQuery);
    if (!querySnapshot.empty) {
      toast.error("Tên đăng nhập đã tồn tại.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate dữ liệu
    if (!(await validateForm())) return;

    try {
      await addDoc(collection(db, "users"), formData);
      toast.success("Đăng ký thành công!");
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        ho: "",
        ten: "",
        email: "",
        sdt: "",
        role: "Nhân viên", // Reset role to default
        trangThai: "Đang hoạt động", // Reset status to default
      });

      // Chuyển hướng sang trang Dashboard
      navigate("/dang-nhap");
    } catch (error) {
      console.error("Error registering user: ", error);
      toast.error("Có lỗi xảy ra khi đăng ký.");
    }
  };

  return (
    <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
      <div className="row gx-lg-5 align-items-center mb-5">
        <div className="col-lg-6 mb-5 mb-lg-0" style={{ zIndex: 10 }}>
          <h1
            className="my-5 display-5 fw-bold ls-tight"
            style={{ color: "hsl(218, 81%, 95%)" }}
          >
            The best offer <br />
            <span style={{ color: "hsl(218, 81%, 75%)" }}>
              for your business
            </span>
          </h1>
          <p
            className="mb-4 opacity-70"
            style={{ color: "hsl(218, 81%, 85%)" }}
          >
            {/* Lorem ipsum dolor, sit amet consectetur adipisicing elit.
            Temporibus, expedita iusto veniam atque, magni tempora mollitia
            dolorum consequatur nulla, neque debitis eos reprehenderit quasi ab
            ipsum nisi dolorem modi. Quos? */}
          </p>
        </div>

        <div className="col-lg-6 mb-5 mb-lg-0 position-relative">
          <div
            id="radius-shape-1"
            className="position-absolute rounded-circle shadow-5-strong"
          ></div>
          <div
            id="radius-shape-2"
            className="position-absolute shadow-5-strong"
          ></div>

          <div className="card bg-glass">
            <div className="card-body px-4 py-5 px-md-5">
              <form onSubmit={handleSubmit}>
                {/* 2 column grid layout with text inputs for the first and last names */}
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <div data-mdb-input-init className="form-outline">
                      <input
                        type="text"
                        id="form3Example1"
                        className="form-control"
                        name="ho"
                        value={formData.ho}
                        onChange={handleInputChange}
                      />
                      <label className="form-label" htmlFor="form3Example1">
                        Họ
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <div data-mdb-input-init className="form-outline">
                      <input
                        type="text"
                        id="form3Example2"
                        className="form-control"
                        name="ten"
                        value={formData.ten}
                        onChange={handleInputChange}
                      />
                      <label className="form-label" htmlFor="form3Example2">
                        Tên
                      </label>
                    </div>
                  </div>
                </div>

                {/* Username input */}
                <div className="form-outline mb-4">
                  <input
                    type="text"
                    id="form3Example3"
                    className="form-control"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                  <label className="form-label" htmlFor="form3Example3">
                    Tên đăng nhập
                  </label>
                </div>

                {/* Password input */}
                <div className="form-outline mb-4">
                  <input
                    type="password"
                    id="form3Example4"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <label className="form-label" htmlFor="form3Example4">
                    Mật khẩu
                  </label>
                </div>

                {/* Confirm Password input */}
                <div className="form-outline mb-4">
                  <input
                    type="password"
                    id="form3Example5"
                    className="form-control"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <label className="form-label" htmlFor="form3Example5">
                    Xác nhận mật khẩu
                  </label>
                </div>

                {/* Email input */}
                <div className="form-outline mb-4">
                  <input
                    type="email"
                    id="form3Example6"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  <label className="form-label" htmlFor="form3Example6">
                    Email address
                  </label>
                </div>

                {/* Phone input */}
                <div className="form-outline mb-4">
                  <input
                    type="tel"
                    id="form3Example7"
                    className="form-control"
                    name="sdt"
                    value={formData.sdt}
                    onChange={handleInputChange}
                  />
                  <label className="form-label" htmlFor="form3Example7">
                    Số điện thoại
                  </label>
                </div>

                {/* Hidden Role input */}
                <div style={{ display: "none" }}>
                  <input
                    type="text"
                    id="form3Example8"
                    className="form-control"
                    name="role"
                    value={formData.role}
                    disabled
                  />
                  <label className="form-label" htmlFor="form3Example8">
                    Chức vụ
                  </label>
                </div>

                {/* Hidden Status input */}
                <div style={{ display: "none" }}>
                  <input
                    type="text"
                    id="form3Example9"
                    className="form-control"
                    name="trangThai"
                    value={formData.trangThai}
                    disabled
                  />
                  <label className="form-label" htmlFor="form3Example9">
                    Trạng thái
                  </label>
                </div>

                {/* Subscribe checkbox */}
                {/* <div className="form-check d-flex justify-content-center mb-4">
                  <input
                    className="form-check-input me-2"
                    type="checkbox"
                    value=""
                    id="form2Example33"
                    checked
                  />
                  <label className="form-check-label" htmlFor="form2Example33">
                    Subscribe to our newsletter
                  </label>
                </div> */}

                {/* Submit button */}
                <button
                  type="submit"
                  data-mdb-button-init
                  data-mdb-ripple-init
                  className="btn btn-primary btn-block mb-4"
                >
                  Đăng ký
                </button>

                {/* Social login buttons */}
                <div className="text-center">
                <p><a href="/dang-nhap" class="link-primary link-offset-2 link-underline-opacity-25 link-underline-opacity-100-hover">Đăng nhập</a></p>

                  {/* <p>or sign up with:</p>
                  <button
                    type="button"
                    className="btn btn-link btn-floating mx-1"
                  >
                    <i className="fab fa-facebook-f"></i>
                  </button>

                  <button
                    type="button"
                    className="btn btn-link btn-floating mx-1"
                  >
                    <i className="fab fa-google"></i>
                  </button>

                  <button
                    type="button"
                    className="btn btn-link btn-floating mx-1"
                  >
                    <i className="fab fa-twitter"></i>
                  </button>

                  <button
                    type="button"
                    className="btn btn-link btn-floating mx-1"
                  >
                    <i className="fab fa-github"></i>
                  </button> */}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
