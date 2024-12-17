import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/employees')
      .then(response => {
        setEmployees(response.data);
      })
      .catch(error => {
        console.error('Có lỗi khi lấy dữ liệu:', error);
      });
  }, []);

  const handleDelete = (maNV) => {
    axios.delete(`http://localhost:5000/api/employees/${maNV}`)
      .then(response => {
        setEmployees(prevEmployees => prevEmployees.filter(emp => emp.MaNV !== maNV));
        toast.success('Nhân viên đã được xóa thành công');
      })
      .catch(error => {
        console.error('Lỗi khi xóa nhân viên:', error);
        toast.error('Lỗi khi xóa nhân viên');
      });
  };

  return (
    <div className="col-md-8">
      <div className="card card-round">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table align-items-center mb-0">
              <thead className="thead-light">
                <tr>
                  <th scope="col">STT</th>
                  <th scope="col">MaNV</th>
                  <th scope="col">HoTenNV</th>
                  <th scope="col">GioiTinh</th>
                  <th scope="col">TrangThai</th>
                  <th scope="col">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee, index) => (
                  <tr key={employee.MaNV}>
                    <td>{index + 1}</td>
                    <td>{employee.MaNV}</td>
                    <td>{employee.HoTenNV}</td>
                    <td>{employee.GioiTinh}</td>
                    <td>{employee.TrangThai}</td>
                    <td>
                      <Link to={`/dashboard/edit-nhan-vien/${employee.MaNV}`} className="btn btn-primary btn-sm me-2">
                        Sửa
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(employee.MaNV)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;
