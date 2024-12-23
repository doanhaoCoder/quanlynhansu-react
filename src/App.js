// import logo from './logo.svg';
// import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./components/Dashboard";

import EmployeeList from "./components/nhanvien/EmployeeList";
import AddEmployee from "./components/nhanvien/AddEmployee";
import EmployeeDetail from "./components/nhanvien/EmployeeDetail";
import EditEmployee from "./components/nhanvien/EditEmployee";

import Register from "./components/nguoidung/Register";
import Login from "./components/nguoidung/Login";
import { PrivateRoute, AdminRoute } from "./components/PrivateRoute";

import DepartmentList from "./components/phongban/DepartmentList";
import EditDepartment from "./components/phongban/EditDepartment";
import DepartmentView from "./components/phongban/DepartmentView";

import DutyList from "./components/chucvu/DutyList";
import EditDuty from "./components/chucvu/EditDuty";
import DutyView from "./components/chucvu/DutyView";

import UserList from "./components/nguoidung/UserList";
import EditUser from "./components/nguoidung/EditUser";

import TinhLuong from "./components/luong/TinhLuong";
import BangLuong from "./components/luong/BangLuong";
import BangLuongDetail from "./components/luong/ChiTietBangLuong";
import LuongThuong from "./components/luong/LuongThuong";
import PhuCap from "./components/luong/PhuCap";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Định tuyến gốc */}
        <Route path="/" element={<Navigate to="/dang-nhap" />} />
        <Route path="/dang-ky" element={<Register />}></Route>
        <Route path="/dang-nhap" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route path="danh-sach-nhan-vien" element={<EmployeeList />} />
          <Route path="them-nhan-vien" element={<AddEmployee />} />
          <Route path="chi-tiet-nhan-vien/:id" element={<EmployeeDetail />} />
          <Route path="chinh-sua-nhan-vien/:id" element={<EditEmployee />} />
          <Route path="danh-sach-phong-ban" element={<DepartmentList />} />
          <Route path="chinh-sua-phong-ban/:id" element={<EditDepartment />} />
          <Route path="xem-phong-ban/:id" element={<DepartmentView />} />
          <Route path="danh-sach-chuc-vu" element={<DutyList />} />
          <Route path="chinh-sua-chuc-vu/:id" element={<EditDuty />} />
          <Route path="xem-chuc-vu/:id" element={<DutyView />} />
          <Route
            path="danh-sach-nguoi-dung"
            element={
              <AdminRoute>
                <UserList />
              </AdminRoute>
            }
          />
          <Route
            path="chinh-sua-nguoi-dung/:id"
            element={
              <AdminRoute>
                <EditUser />
              </AdminRoute>
            }
          />
          <Route path="tinh-luong" element={<TinhLuong />} />
          <Route path="bang-luong" element={<BangLuong />} />
          <Route path="chi-tiet-bang-luong/:id" element={<BangLuongDetail />} />
          <Route path="luong-thuong" element={<LuongThuong />} />
          <Route path="phu-cap" element={<PhuCap />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
