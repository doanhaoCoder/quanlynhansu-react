import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

const ThongKe = () => {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [activeEmployeeCount, setActiveEmployeeCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [dutyCount, setDutyCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [salaryCount, setSalaryCount] = useState(0);

  useEffect(() => {
    const fetchEmployeeCount = async () => {
      const querySnapshot = await getDocs(collection(db, "nhanvien"));
      setEmployeeCount(querySnapshot.size);
    };

    const fetchActiveEmployeeCount = async () => {
      const q = query(collection(db, "nhanvien"), where("TinhTrang", "==", "Đang làm việc"));
      const querySnapshot = await getDocs(q);
      setActiveEmployeeCount(querySnapshot.size);
    };

    const fetchUserCount = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      setUserCount(querySnapshot.size);
    };

    const fetchDepartmentCount = async () => {
      const querySnapshot = await getDocs(collection(db, "phongban"));
      setDepartmentCount(querySnapshot.size);
    };

    const fetchDutyCount = async () => {
      const querySnapshot = await getDocs(collection(db, "chucvu"));
      setDutyCount(querySnapshot.size);
    };

    const fetchAttendanceCount = async () => {
      const querySnapshot = await getDocs(collection(db, "ChamCong"));
      setAttendanceCount(querySnapshot.size);
    };

    const fetchSalaryCount = async () => {
      const querySnapshot = await getDocs(collection(db, "Luong"));
      setSalaryCount(querySnapshot.size);
    };

    fetchEmployeeCount();
    fetchActiveEmployeeCount();
    fetchUserCount();
    fetchDepartmentCount();
    fetchDutyCount();
    fetchAttendanceCount();
    fetchSalaryCount();
  }, []);

  const inactiveEmployeeCount = employeeCount - activeEmployeeCount;

  return (
    <div className="mt-5">
      <h2>Thống Kê</h2>
      <div className="row">
        <div className="col-sm-6 col-md-3">
          <div className="card card-stats card-primary card-round">
            <div className="card-body">
              <div className="row">
                <div className="col-5">
                  <div className="icon-big text-center">
                    <i className="fas fa-users"></i>
                  </div>
                </div>
                <div className="col-7 col-stats">
                  <div className="numbers">
                    <p className="card-category">Tổng số nhân viên</p>
                    <h4 className="card-title">{employeeCount}</h4> {/* Display total number of employees */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className="card card-stats card-info card-round">
            <div className="card-body">
              <div className="row">
                <div className="col-5">
                  <div className="icon-big text-center">
                    <i className="fas fa-user-check"></i>
                  </div>
                </div>
                <div className="col-7 col-stats">
                  <div className="numbers">
                    <p className="card-category">Nhân viên còn hoạt động</p>
                    <h4 className="card-title">{activeEmployeeCount}</h4> {/* Display number of active employees */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className="card card-stats card-success card-round">
            <div className="card-body">
              <div className="row">
                <div className="col-5">
                  <div className="icon-big text-center">
                    <i className="icon-close text-danger"></i>
                  </div>
                </div>
                <div className="col-7 col-stats">
                  <div className="numbers">
                    <p className="card-category">Nhân viên đã nghỉ việc</p>
                    <h4 className="card-title">{inactiveEmployeeCount}</h4> {/* Display number of inactive employees */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className="card card-stats card-secondary card-round">
            <div className="card-body">
              <div className="row">
                <div className="col-5">
                  <div className="icon-big text-center">
                    <i className="fa fa-users"></i>
                  </div>
                </div>
                <div className="col-7 col-stats">
                  <div className="numbers">
                    <p className="card-category">Tài khoản</p>
                    <h4 className="card-title">{userCount}</h4> {/* Display total number of users */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row row-card-no-pd">
        <div className="col-sm-6 col-md-3">
          <div className="card card-stats card-round">
            <div className="card-body">
              <div className="row">
                <div className="col-5">
                  <div className="icon-big text-center">
                    <i className="icon-pie-chart text-warning"></i>
                  </div>
                </div>
                <div className="col-7 col-stats">
                  <div className="numbers">
                    <p className="card-category">Phòng ban</p>
                    <h4 className="card-title">{departmentCount}</h4> {/* Display total number of departments */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className="card card-stats card-round">
            <div className="card-body">
              <div className="row">
                <div className="col-5">
                  <div className="icon-big text-center">
                  <i className="icon-pie-chart text-primary"></i>
                  </div>
                </div>
                <div className="col-7 col-stats">
                  <div className="numbers">
                    <p className="card-category">Chức Vụ</p>
                    <h4 className="card-title">{dutyCount}</h4> {/* Display total number of duties */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className="card card-stats card-round">
            <div className="card-body">
              <div className="row">
                <div className="col-5">
                  <div className="icon-big text-center">
                  <i className="icon-pie-chart text-danger"></i>
                  </div>
                </div>
                <div className="col-7 col-stats">
                  <div className="numbers">
                    <p className="card-category">Bảng chấm công</p>
                    <h4 className="card-title">{attendanceCount}</h4> {/* Display total number of attendance records */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className="card card-stats card-round">
            <div className="card-body">
              <div className="row">
                <div className="col-5">
                  <div className="icon-big text-center">
                  <i className="icon-wallet text-success"></i>
                  </div>
                </div>
                <div className="col-7 col-stats">
                  <div className="numbers">
                    <p className="card-category">Bảng lương</p>
                    <h4 className="card-title">{salaryCount}</h4> {/* Display total number of salary records */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThongKe;
