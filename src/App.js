// import logo from './logo.svg';
// import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import AddEmployee from './components/AddEmployee';



const App = () => {
  return (
    <Router>
      <Routes>
        {/* Định tuyến gốc */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route path="/dashboard" element={<Dashboard />}> 
          <Route path="danh-sach-nhan-vien" element={<EmployeeList />} />
          <Route path="them-nhan-vien" element={<AddEmployee />} />


        
          {/* <Route path="them-nhan-vien" element={<AddEmployee />} />
          <Route path="sua-nhan-vien/:id" element={<EditEmployee />} />
          <Route path="danh-sach-nhan-vien" element={<EmployeeList />} /> */}
        </Route>
        
      </Routes>
    </Router>

  );
};

export default App;
