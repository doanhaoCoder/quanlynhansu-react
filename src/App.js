// import logo from './logo.svg';
// import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./components/Dashboard";

import EmployeeList from "./components/employee/EmployeeList";
import AddEmployee from "./components/employee/AddEmployee";
import EmployeeDetail from "./components/employee/EmployeeDetail";
import EditEmployee from "./components/employee/EditEmployee";

import Register from "./components/user/Register";
import Login from "./components/user/Login";
import PrivateRoute from "./components/PrivateRoute";

import DepartmentList from "./components/department/DepartmentList";
import EditDepartment from "./components/department/EditDepartment";

import DutyList from "./components/duty/DutyList";
import EditDuty from "./components/duty/EditDuty";

import UserList from "./components/user/UserList";
import EditUser from "./components/user/EditUser";

import TinhLuong from "./components/luong/TinhLuong";
import BangLuong from "./components/luong/BangLuong";
import BangLuongDetail from "./components/luong/ChiTietBangLuong";

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
          <Route path="danh-sach-chuc-vu" element={<DutyList />} />
          <Route path="chinh-sua-chuc-vu/:id" element={<EditDuty />} />
          <Route path="danh-sach-nguoi-dung" element={<UserList />} />
          <Route path="chinh-sua-nguoi-dung/:id" element={<EditUser />} />
          <Route path="tinh-luong" element={<TinhLuong />} />
          <Route path="bang-luong" element={<BangLuong />} />
          <Route path="chi-tiet-bang-luong/:id" element={<BangLuongDetail />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
