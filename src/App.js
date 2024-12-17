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

// EmployeeDetail.js

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Định tuyến gốc */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="danh-sach-nhan-vien" element={<EmployeeList />} />
          <Route path="them-nhan-vien" element={<AddEmployee />} />
          <Route path="chi-tiet-nhan-vien/:id" element={<EmployeeDetail />} />
          <Route path="chinh-sua-nhan-vien/:id" element={<EditEmployee />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
