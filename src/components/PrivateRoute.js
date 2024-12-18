import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem("user"));

  if (!user) {
    // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
    return <Navigate to="/dang-nhap" />;
  }

  // Nếu đã đăng nhập, hiển thị nội dung con
  return children;
};

export default PrivateRoute;
