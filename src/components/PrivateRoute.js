import React from "react";
import { Navigate } from "react-router-dom";

const isAdmin = (user) => {
  return user && user.role === "Quản trị viên";
};

const isValidUser = (user) => {
  const validRoles = ["Quản trị viên", "Nhân viên"];
  return user && validRoles.includes(user.role) && user.trangThai !== "Ngừng hoạt động";
};

const PrivateRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem("user"));

  // Kiểm tra nếu người dùng chưa đăng nhập, role không hợp lệ hoặc trạng thái là "Ngừng hoạt động"
  if (!isValidUser(user)) {
    // Nếu chưa đăng nhập hoặc không có quyền truy cập, chuyển hướng đến trang đăng nhập
    alert("Tài khoản nầy không có quyền truy cập. hãy sử dụng tài khoản khác!");
    return <Navigate to="/dang-nhap" />;
  }

  // Nếu đã đăng nhập và có quyền truy cập, hiển thị nội dung con
  return children;
};

const AdminRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem("user"));

  // Kiểm tra nếu người dùng chưa đăng nhập hoặc role không phải là "Quản trị viên"
  if (!isAdmin(user) || user.trangThai === "Ngừng hoạt động") {
    // Nếu chưa đăng nhập hoặc không có quyền truy cập, chuyển hướng đến trang đăng nhập
    alert("Tài khoản nầy không có quyền truy cập. hãy sử dụng tài khoản khác!");
    return <Navigate to="/dang-nhap" />;
  }

  // Nếu đã đăng nhập và có quyền truy cập, hiển thị nội dung con
  return children;
};

export { PrivateRoute, AdminRoute };
