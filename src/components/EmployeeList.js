// src/components/EmployeeList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    // Gửi yêu cầu GET đến server Express
    axios.get('http://localhost:5000/api/employees')
      .then(response => {
        setEmployees(response.data);
      })
      .catch(error => {
        console.error('Có lỗi khi lấy dữ liệu:', error);
      });
  }, []);

  return (
    <div>
      <h1>Danh sách nhân viên</h1>
      <ul>
        {employees.map(employee => (
          <li key={employee.id}>{employee.HoTenNV} - {employee.MaNV}</li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeeList;
