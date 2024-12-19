import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem("user"));

  // Kiểm tra nếu người dùng chưa đăng nhập hoặc role không phải là "admin" hoặc "nhân viên"
  if (!user || (user.role !== "Quản trị viên" && user.role !== "Nhân viên")) {
    // Nếu chưa đăng nhập hoặc không có quyền truy cập, chuyển hướng đến trang đăng nhập
    alert("Tài khoản nầy không có quyền truy cập. hãy sử dụng tài khoản khác!");
    return <Navigate to="/dang-nhap" />;
  }

  // Nếu đã đăng nhập và có quyền truy cập, hiển thị nội dung con
  return children;
};

export default PrivateRoute;
