import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify"; // Import react-toastify
import { useParams, useNavigate } from "react-router-dom";


const AddEmployee = () => {
  const navigate = useNavigate(); // Khai báo hook navigate

  const [employee, setEmployee] = useState({
    MaNV: "",
    HoTenNV: "",
    CCCD: "",
    Email: "",
    SDT: "",
    NgaySinh: "",
    GioiTinh: "Nam",
    GhiChu: "",
    ChucVu: "",    // Chức vụ
    PhongBan: "",  // Phòng ban
    TinhTrang: "Đang làm việc"
  });

  const [error, setError] = useState("");
  const [chucVuList, setChucVuList] = useState([]);
  const [phongBanList, setPhongBanList] = useState([]);

  // Lấy danh sách chức vụ từ Firestore
  useEffect(() => {
    const fetchChucVu = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "chucvu"));
        const chucVuData = [];
        querySnapshot.forEach((doc) => {
          chucVuData.push({ id: doc.id, ...doc.data() });
        });
        console.log("Danh sách chức vụ:", chucVuData); // In ra để kiểm tra dữ liệu
        setChucVuList(chucVuData);
      } catch (error) {
        console.error("Error fetching chucvu data: ", error);
      }
    };

    fetchChucVu();
  }, []);

  // Lấy danh sách phòng ban từ Firestore
  useEffect(() => {
    const fetchPhongBan = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "phongban"));
        const phongBanData = [];
        querySnapshot.forEach((doc) => {
          phongBanData.push({ id: doc.id, ...doc.data() });
        });
        console.log("Danh sách phòng ban:", phongBanData); // In ra để kiểm tra dữ liệu
        setPhongBanList(phongBanData);
      } catch (error) {
        console.error("Error fetching phongban data: ", error);
      }
    };

    fetchPhongBan();
  }, []);

  // Hàm để cập nhật giá trị input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prevEmployee) => ({
      ...prevEmployee,
      [name]: value,
    }));
  };

  // Hàm kiểm tra dữ liệu trùng lặp trước khi thêm
  const checkDuplicate = async () => {
    const querySnapshot = await getDocs(collection(db, "nhanvien"));
    let duplicateMaNV = false;
    let duplicateCCCD = false;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.MaNV === employee.MaNV) {
        duplicateMaNV = true;
      }
      if (data.CCCD === employee.CCCD) {
        duplicateCCCD = true;
      }
    });

    return { duplicateMaNV, duplicateCCCD };
  };

  // Hàm thêm nhân viên vào Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra các trường dữ liệu không được bỏ trống
    if (
      !employee.MaNV ||
      !employee.HoTenNV ||
      !employee.CCCD ||
      !employee.Email ||
      !employee.SDT ||
      !employee.NgaySinh ||
      !employee.ChucVu ||
      !employee.PhongBan
    ) {
      setError("Vui lòng điền đầy đủ thông tin (trừ GhiChú).");
      return;
    }

    // Kiểm tra dữ liệu trùng lặp
    const { duplicateMaNV, duplicateCCCD } = await checkDuplicate();

    if (duplicateMaNV) {
      toast.error("Mã nhân viên đã tồn tại!", {
        style: { backgroundColor: "#f8d7da", color: "#721c24" },
      });
      return;
    }

    if (duplicateCCCD) {
      toast.error("CCCD đã tồn tại!", {
        style: { backgroundColor: "#f8d7da", color: "#721c24" },
      });
      return;
    }

    // Nếu không trùng lặp, tiến hành thêm nhân viên vào Firestore
    try {
      await addDoc(collection(db, "nhanvien"), employee);
      toast.success("Nhân viên đã được thêm thành công!", {
        style: { backgroundColor: "#d4edda", color: "#155724" },
      });

      // Reset các trường sau khi thêm nhân viên thành công
      setEmployee({
        MaNV: "",
        HoTenNV: "",
        CCCD: "",
        Email: "",
        SDT: "",
        NgaySinh: "",
        GioiTinh: "Nam",
        GhiChu: "",
        ChucVu: "",
        PhongBan: "",
      });
      setError(""); // Xóa lỗi nếu có
    } catch (error) {
      console.error("Error adding document: ", error);
      toast.error("Đã có lỗi xảy ra, vui lòng thử lại.", {
        style: { backgroundColor: "#f8d7da", color: "#721c24" },
      });
    }
  };

  return (
    <div className="container mt-5">
      <button
        className="btn btn-primary mb-2"
        onClick={() => navigate(-1)} // Quay lại trang trước đó
      >
        Trở lại
      </button>
      <h2>Thêm Nhân Viên</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-6">
            <label htmlFor="MaNV" className="form-label">
              Mã nhân viên
            </label>
            <input
              type="text"
              className="form-control"
              id="MaNV"
              name="MaNV"
              value={employee.MaNV}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-6">
            <label htmlFor="HoTenNV" className="form-label">
              Họ tên nhân viên
            </label>
            <input
              type="text"
              className="form-control"
              id="HoTenNV"
              name="HoTenNV"
              value={employee.HoTenNV}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-6">
            <label htmlFor="GioiTinh" className="form-label">
              Giới tính
            </label>
            <select
              id="GioiTinh"
              name="GioiTinh"
              className="form-control"
              value={employee.GioiTinh}
              onChange={handleChange}
              required
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          <div className="col-6">
            <label htmlFor="NgaySinh" className="form-label">
              Ngày sinh
            </label>
            <input
              type="date"
              className="form-control"
              id="NgaySinh"
              name="NgaySinh"
              value={employee.NgaySinh}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-6">
            <label htmlFor="CCCD" className="form-label">
              CCCD
            </label>
            <input
              type="text"
              className="form-control"
              id="CCCD"
              name="CCCD"
              value={employee.CCCD}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-6">
            <label htmlFor="SDT" className="form-label">
              Số điện thoại
            </label>
            <input
              type="text"
              className="form-control"
              id="SDT"
              name="SDT"
              value={employee.SDT}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-6">
            <label htmlFor="Email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="Email"
              name="Email"
              value={employee.Email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-6">
            <label htmlFor="PhongBan" className="form-label">
              Phòng ban
            </label>
            <select
              id="PhongBan"
              name="PhongBan"
              className="form-control"
              value={employee.PhongBan}
              onChange={handleChange}
              required
            >
              <option value="">Chọn phòng ban</option>
              {phongBanList.map((phongBan) => (
                <option key={phongBan.id} value={phongBan.id}>
                  {phongBan.tenPhong}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6">
            <label htmlFor="ChucVu" className="form-label">
              Chức vụ
            </label>
            <select
              id="ChucVu"
              name="ChucVu"
              className="form-control"
              value={employee.ChucVu}
              onChange={handleChange}
              required
            >
              <option value="">Chọn chức vụ</option>
              {chucVuList.map((chucVu) => (
                <option key={chucVu.id} value={chucVu.id}>
                  {chucVu.tenChucVu}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row mt-3">
          <div className="col-12">
            <label htmlFor="GhiChu" className="form-label">
              Ghi chú (Không bắt buộc)
            </label>
            <textarea
              className="form-control"
              id="GhiChu"
              name="GhiChu"
              value={employee.GhiChu}
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>
        </div>

        <div className="mt-4">
          <button type="submit" className="btn btn-primary">
            Thêm Nhân Viên
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;
