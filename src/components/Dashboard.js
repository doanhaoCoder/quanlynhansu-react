import React, { useState, useEffect } from "react"; // Thêm import useState và useEffect
import { Outlet, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Component React
import { faUsers } from "@fortawesome/free-solid-svg-icons"; // Biểu tượng cần dùng
import { faUser } from "@fortawesome/free-solid-svg-icons"; // Đảm bảo đã import faUser
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import { ImFontSize } from "react-icons/im";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Lấy thông tin người dùng từ sessionStorage
    const userInfo = JSON.parse(sessionStorage.getItem("user"));
    if (userInfo) {
      setUser(userInfo);
    }
  }, []);

  const handleLogout = () => {
    // Xóa thông tin người dùng khỏi session
    sessionStorage.removeItem("user");

    // Điều hướng về trang đăng nhập
    navigate("/dang-nhap"); // Điều hướng về trang login
  };
  return (
    <div class="wrapper">
      {/* Sidebar  */}
      <div class="sidebar" data-background-color="dark">
        <div class="sidebar-logo">
          {/* Logo Header  */}
          <div class="logo-header" data-background-color="dark">
            <a href="/dashboard" class="logo">
              <img
                src="https://logos.textgiraffe.com/logos/logo-name/Admin-designstyle-colors-m.png"
                alt="navbar brand"
                class="navbar-brand"
                height="135"
              />
            </a>
            <div class="nav-toggle">
              <button class="btn btn-toggle toggle-sidebar">
                <i class="gg-menu-right"></i>
              </button>
              <button class="btn btn-toggle sidenav-toggler">
                <i class="gg-menu-left"></i>
              </button>
            </div>
            <button class="topbar-toggler more">
              <i class="gg-more-vertical-alt"></i>
            </button>
          </div>
          {/* End Logo Header  */}
        </div>
        <div class="sidebar-wrapper scrollbar scrollbar-inner">
          <div class="sidebar-content">
            <ul class="nav nav-secondary">
              <li class="nav-item active">
                <a
                  data-bs-toggle="collapse"
                  href="/dashboard"
                  class="collapsed"
                  aria-expanded="false"
                >
                  <i class="fas fa-home" style={{ fontSize: "200%" }}></i>
                  <p style={{ fontSize: "200%" }}>Dashboard</p>
                </a>
              </li>

              <li class="nav-item">
                <a data-bs-toggle="collapse" href="#sidebarLayouts">
                  <FontAwesomeIcon icon={faUsers} className="me-2" />
                  <p>Nhân viên</p>
                  <span class="caret"></span>
                </a>
                <div class="collapse" id="sidebarLayouts">
                  <ul class="nav nav-collapse">
                    <li>
                      <a href="/dashboard/danh-sach-phong-ban">
                        <span class="sub-item">Phòng ban</span>
                      </a>
                    </li>
                    <li>
                      <a href="/dashboard/danh-sach-chuc-vu">
                        <span class="sub-item">Chức vụ</span>
                      </a>
                    </li>
                    <li>
                      <a href="/dashboard/danh-sach-nhan-vien">
                        <span class="sub-item">Nhân Viên</span>
                      </a>
                    </li>
                    <li>
                      <a href="/dashboard/them-nhan-vien">
                        <span class="sub-item">Thêm nhân viên</span>
                      </a>
                    </li>
                    <li>
                      <a href="/dashboard/ky-luat">
                        <span class="sub-item">Kỷ luật</span>
                      </a>
                    </li>
                    <li>
                      <a href="/dashboard/nghi-phep">
                        <span class="sub-item">Nghỉ phép</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
              <li class="nav-item">
                <a data-bs-toggle="collapse" href="#tables">
                  <FontAwesomeIcon icon={faDollarSign} className="me-2" />

                  <p> Quản lý lương</p>
                  <span class="caret"></span>
                </a>
                <div class="collapse" id="tables">
                  <ul class="nav nav-collapse">
                    <li>
                      <a href="/dashboard/cham-cong">
                        <span class="sub-item">Chấm công</span>
                      </a>
                    </li>
                    <li>
                      <a href="/dashboard/danh-sach-cham-cong">
                        <span class="sub-item">Danh sách chấm công</span>
                      </a>
                    </li>
                    <li>
                      <a href="/dashboard/tinh-luong">
                        <span class="sub-item">Tính lương</span>
                      </a>
                    </li>
                    <li>
                      <a href="/dashboard/bang-luong">
                        <span class="sub-item">Bảng lương</span>
                      </a>
                    </li>
                    <li>
                      <a href="/dashboard/phu-cap">
                        <span class="sub-item">Phụ cấp</span>
                      </a>
                    </li>
                    <li>
                      <a href="/dashboard/luong-thuong">
                        <span class="sub-item">Thưởng</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
              {user && user.role === "Quản trị viên" && (
                <li class="nav-item">
                  <a data-bs-toggle="collapse" href="#forms">
                    <FontAwesomeIcon icon={faUser} />
                    <p> Người dùng</p>
                    <span class="caret"></span>
                  </a>
                  <div class="collapse" id="forms">
                    <ul class="nav nav-collapse">
                      <li>
                        <a href="/dashboard/danh-sach-nguoi-dung">
                          <span class="sub-item">Tài khoản</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
              )}
              <li class="nav-item">
                <Link to="thong-ke">Thống Kê</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* End Sidebar  */}

      <div class="main-panel">
        <div class="main-header">
          <div class="main-header-logo">
            {/* Logo Header  */}
            <div class="logo-header" data-background-color="dark">
              <a href="index.html" class="logo">
                <img
                  src="https://logos.textgiraffe.com/logos/logo-name/Admin-designstyle-colors-m.png"
                  alt="navbar brand"
                  class="navbar-brand"
                  height="125"
                />
              </a>
              <div class="nav-toggle">
                <button class="btn btn-toggle toggle-sidebar">
                  <i class="gg-menu-right"></i>
                </button>
                <button class="btn btn-toggle sidenav-toggler">
                  <i class="gg-menu-left"></i>
                </button>
              </div>
              <button class="topbar-toggler more">
                <i class="gg-more-vertical-alt"></i>
              </button>
            </div>
            {/* End Logo Header  */}
          </div>
          {/* Navbar Header  */}
          <nav class="navbar navbar-header navbar-header-transparent navbar-expand-lg border-bottom">
            <div class="container-fluid">
              {/* <nav class="navbar navbar-header-left navbar-expand-lg navbar-form nav-search p-0 d-none d-lg-flex">
                <div class="input-group">
                  <div class="input-group-prepend">
                    <button type="submit" class="btn btn-search pe-1">
                      <i class="fa fa-search search-icon"></i>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Search ..."
                    class="form-control"
                  />
                </div>
              </nav> */}

              <ul class="navbar-nav topbar-nav ms-md-auto align-items-center">
                <li class="nav-item topbar-icon dropdown hidden-caret d-flex d-lg-none">
                  <a
                    class="nav-link dropdown-toggle"
                    data-bs-toggle="dropdown"
                    href="#"
                    role="button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <i class="fa fa-search"></i>
                  </a>
                  <ul class="dropdown-menu dropdown-search animated fadeIn">
                    <form class="navbar-left navbar-form nav-search">
                      <div class="input-group">
                        <input
                          type="text"
                          placeholder="Search ..."
                          class="form-control"
                        />
                      </div>
                    </form>
                  </ul>
                </li>
                {/* <li class="nav-item topbar-icon dropdown hidden-caret">
                  <a
                    class="nav-link dropdown-toggle"
                    href="#"
                    id="messageDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <i class="fa fa-envelope"></i>
                  </a>
                  <ul
                    class="dropdown-menu messages-notif-box animated fadeIn"
                    aria-labelledby="messageDropdown"
                  >
                    <li>
                      <div class="dropdown-title d-flex justify-content-between align-items-center">
                        Messages
                        <a href="#" class="small">
                          Mark all as read
                        </a>
                      </div>
                    </li>
                    <li>
                      <div class="message-notif-scroll scrollbar-outer">
                        <div class="notif-center">
                          <a href="#">
                            <div class="notif-img">
                              <img
                                src="assets/img/jm_denis.jpg"
                                alt="Img Profile"
                              />
                            </div>
                            <div class="notif-content">
                              <span class="subject">Jimmy Denis</span>
                              <span class="block"> How are you ? </span>
                              <span class="time">5 minutes ago</span>
                            </div>
                          </a>
                          <a href="#">
                            <div class="notif-img">
                              <img
                                src="assets/img/chadengle.jpg"
                                alt="Img Profile"
                              />
                            </div>
                            <div class="notif-content">
                              <span class="subject">Chad</span>
                              <span class="block"> Ok, Thanks ! </span>
                              <span class="time">12 minutes ago</span>
                            </div>
                          </a>
                          <a href="#">
                            <div class="notif-img">
                              <img
                                src="assets/img/mlane.jpg"
                                alt="Img Profile"
                              />
                            </div>
                            <div class="notif-content">
                              <span class="subject">Jhon Doe</span>
                              <span class="block">
                                Ready for the meeting today...
                              </span>
                              <span class="time">12 minutes ago</span>
                            </div>
                          </a>
                          <a href="#">
                            <div class="notif-img">
                              <img
                                src="assets/img/talha.jpg"
                                alt="Img Profile"
                              />
                            </div>
                            <div class="notif-content">
                              <span class="subject">Talha</span>
                              <span class="block"> Hi, Apa Kabar ? </span>
                              <span class="time">17 minutes ago</span>
                            </div>
                          </a>
                        </div>
                      </div>
                    </li>
                    <li>
                      <a class="see-all" href="javascript:void(0);">
                        See all messages<i class="fa fa-angle-right"></i>
                      </a>
                    </li>
                  </ul>
                </li>
                <li class="nav-item topbar-icon dropdown hidden-caret">
                  <a
                    class="nav-link dropdown-toggle"
                    href="#"
                    id="notifDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <i class="fa fa-bell"></i>
                    <span class="notification">4</span>
                  </a>
                  <ul
                    class="dropdown-menu notif-box animated fadeIn"
                    aria-labelledby="notifDropdown"
                  >
                    <li>
                      <div class="dropdown-title">
                        You have 4 new notification
                      </div>
                    </li>
                    <li>
                      <div class="notif-scroll scrollbar-outer">
                        <div class="notif-center">
                          <a href="#">
                            <div class="notif-icon notif-primary">
                              <i class="fa fa-user-plus"></i>
                            </div>
                            <div class="notif-content">
                              <span class="block"> New user registered </span>
                              <span class="time">5 minutes ago</span>
                            </div>
                          </a>
                          <a href="#">
                            <div class="notif-icon notif-success">
                              <i class="fa fa-comment"></i>
                            </div>
                            <div class="notif-content">
                              <span class="block">
                                Rahmad commented on Admin
                              </span>
                              <span class="time">12 minutes ago</span>
                            </div>
                          </a>
                          <a href="#">
                            <div class="notif-img">
                              <img
                                src="assets/img/profile2.jpg"
                                alt="Img Profile"
                              />
                            </div>
                            <div class="notif-content">
                              <span class="block">
                                Reza send messages to you
                              </span>
                              <span class="time">12 minutes ago</span>
                            </div>
                          </a>
                          <a href="#">
                            <div class="notif-icon notif-danger">
                              <i class="fa fa-heart"></i>
                            </div>
                            <div class="notif-content">
                              <span class="block"> Farrah liked Admin </span>
                              <span class="time">17 minutes ago</span>
                            </div>
                          </a>
                        </div>
                      </div>
                    </li>
                    <li>
                      <a class="see-all" href="javascript:void(0);">
                        See all notifications<i class="fa fa-angle-right"></i>
                      </a>
                    </li>
                  </ul>
                </li>
                <li class="nav-item topbar-icon dropdown hidden-caret">
                  <a
                    class="nav-link"
                    data-bs-toggle="dropdown"
                    href="#"
                    aria-expanded="false"
                  >
                    <i class="fas fa-layer-group"></i>
                  </a>
                  <div class="dropdown-menu quick-actions animated fadeIn">
                    <div class="quick-actions-header">
                      <span class="title mb-1">Quick Actions</span>
                      <span class="subtitle op-7">Shortcuts</span>
                    </div>
                    <div class="quick-actions-scroll scrollbar-outer">
                      <div class="quick-actions-items">
                        <div class="row m-0">
                          <a class="col-6 col-md-4 p-0" href="#">
                            <div class="quick-actions-item">
                              <div class="avatar-item bg-danger rounded-circle">
                                <i class="far fa-calendar-alt"></i>
                              </div>
                              <span class="text">Calendar</span>
                            </div>
                          </a>
                          <a class="col-6 col-md-4 p-0" href="#">
                            <div class="quick-actions-item">
                              <div class="avatar-item bg-warning rounded-circle">
                                <i class="fas fa-map"></i>
                              </div>
                              <span class="text">Maps</span>
                            </div>
                          </a>
                          <a class="col-6 col-md-4 p-0" href="#">
                            <div class="quick-actions-item">
                              <div class="avatar-item bg-info rounded-circle">
                                <i class="fas fa-file-excel"></i>
                              </div>
                              <span class="text">Reports</span>
                            </div>
                          </a>
                          <a class="col-6 col-md-4 p-0" href="#">
                            <div class="quick-actions-item">
                              <div class="avatar-item bg-success rounded-circle">
                                <i class="fas fa-envelope"></i>
                              </div>
                              <span class="text">Emails</span>
                            </div>
                          </a>
                          <a class="col-6 col-md-4 p-0" href="#">
                            <div class="quick-actions-item">
                              <div class="avatar-item bg-primary rounded-circle">
                                <i class="fas fa-file-invoice-dollar"></i>
                              </div>
                              <span class="text">Invoice</span>
                            </div>
                          </a>
                          <a class="col-6 col-md-4 p-0" href="#">
                            <div class="quick-actions-item">
                              <div class="avatar-item bg-secondary rounded-circle">
                                <i class="fas fa-credit-card"></i>
                              </div>
                              <span class="text">Payments</span>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </li> */}

                <li className="nav-item topbar-user dropdown hidden-caret">
                  <a
                    className="dropdown-toggle profile-pic"
                    data-bs-toggle="dropdown"
                    href="#"
                    aria-expanded="false"
                  >
                    {/* Avatar */}
                    {/* <div className="avatar-sm">
          <img
            src="assets/img/profile.jpg"
            alt="..."
            className="avatar-img rounded-circle"
          />
        </div> */}
                    <span className="profile-username">
                      {user ? (
                        <>
                          <span className="op-7">{user.role}: </span>
                          <span className="fw-bold">{user.ten}</span>
                        </>
                      ) : (
                        <span className="fw-bold">Guest</span>
                      )}
                    </span>
                  </a>
                  <ul className="dropdown-menu dropdown-user animated fadeIn">
                    <div className="dropdown-user-scroll scrollbar-outer">
                      <li>
                        <div className="user-box">
                          {/* Avatar */}
                          {/* <div className="avatar-lg">
                <img
                  src="assets/img/profile.jpg"
                  alt="image profile"
                  className="avatar-img rounded"
                />
              </div> */}
                          <div className="u-text">
                            {user ? (
                              <>
                                <h4>
                                  {user.ho} {user.ten}
                                </h4>
                                <p className="text-muted">{user.email}</p>
                              </>
                            ) : (
                              <h4>Guest</h4>
                            )}
                          </div>
                        </div>
                      </li>
                      <li>
                        <div className="dropdown-divider"></div>
                        <a
                          className="dropdown-item"
                          href="#"
                          onClick={handleLogout}
                        >
                          Logout
                        </a>
                      </li>
                    </div>
                  </ul>
                </li>
              </ul>
            </div>
          </nav>
          {/* End Navbar  */}
        </div>

        <div class="container">
          <div class="page-inner">
            {/* Outlet để hiển thị các route con */}
            <Outlet />
          </div>
        </div>

        <footer class="footer">
          {/* <div class="container-fluid d-flex justify-content-between">
            <nav class="pull-left">
              <ul class="nav">
                <li class="nav-item">
                  <a class="nav-link" href="http://www.themekita.com">
                    ThemeKita
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#">
                    {" "}
                    Help{" "}
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#">
                    {" "}
                    Licenses{" "}
                  </a>
                </li>
              </ul>
            </nav>
            <div class="copyright">
              2024, made with <i class="fa fa-heart heart text-danger"></i> by
              <a href="http://www.themekita.com">ThemeKita</a>
            </div>
            <div>
              Distributed by
              <a target="_blank" href="https://themewagon.com/">
                ThemeWagon
              </a>
              .
            </div>
          </div> */}
        </footer>
      </div>

      {/* Custom template | don't include it in your project!  */}
      {/* End Custom template  */}
    </div>
  );
};

export default Dashboard;
