import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";

const EditEmployee = () => {
  const { id } = useParams(); // Lấy ID nhân viên từ URL
  const navigate = useNavigate();
  const [employee, setEmployee] = useState({
    MaNV: "",
    HoTenNV: "",
    Email: "",
    SDT: "",
    NgaySinh: "",
    GioiTinh: "",
    CCCD: "",
    NgayCap: "",
    NoiCap: "",
    DanToc: "",
    TonGiao: "",
    DCTamTru: "",
    DCThuongTru: "",
    NoiSinh: "",
    TrinhDoHocVan: "",
    TrinhDoChuyenMon: "",
    TinhTrangHonNhan: "",
    MaThueTNCN: "",
    MaBH: "",
    TinhTrang: "Đang làm việc",
    GhiChu: "",
    PhongBan: "",
    ChucVu: "",
  });

  const [phongbanList, setPhongbanList] = useState([]);
  const [chucvuList, setChucvuList] = useState([]);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const docRef = doc(db, "nhanvien", id); // Lấy nhân viên theo ID
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const employeeData = docSnap.data();
          // console.log("Nhân viên:", employeeData);

          if (employeeData.PhongBan) {
            const phongRef = doc(db, "phongban", employeeData.PhongBan);
            const phongSnap = await getDoc(phongRef);
            if (phongSnap.exists()) {
              const phongData = phongSnap.data();
              employeeData.tenPhong = phongData.tenPhong; // Kiểm tra tên trường tại đây
              console.log("check: ", employeeData.tenPhong);
            }
          }
          
          if (employeeData.ChucVu) {
            const chucVuRef = doc(db, "chucvu", employeeData.ChucVu);
            const chucVuSnap = await getDoc(chucVuRef);
            if (chucVuSnap.exists()) {
              const chucVuData = chucVuSnap.data();
              employeeData.tenChucVu = chucVuData.tenChucVu; // Kiểm tra tên trường tại đây
            }
          }
          

          // Cập nhật state employee với dữ liệu đầy đủ
          setEmployee(employeeData);
          console.log("Dữ liệu nhân viên sau khi thêm TenPhong và TenChucVu:", employeeData);
        } else {
          console.log("Không tìm thấy nhân viên với ID:", id);
          toast.error("Không tìm thấy nhân viên!");
          navigate("/dashboard/danh-sach-nhan-vien");
        }
      } catch (error) {
        console.error("Error fetching employee data: ", error);
        toast.error("Lỗi khi tải dữ liệu nhân viên.");
      }
    };

    fetchEmployee();
  }, [id, navigate]);

  useEffect(() => {
    const fetchPhongbanAndChucvu = async () => {
      try {
        const phongbanSnap = await getDocs(collection(db, "phongban"));
        const chucvuSnap = await getDocs(collection(db, "chucvu"));

        setPhongbanList(phongbanSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setChucvuList(chucvuSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        console.log("Danh sách phòng ban:", phongbanList);
        console.log("Danh sách chức vụ:", chucvuList);
      } catch (error) {
        console.error("Error fetching phongban and chucvu: ", error);
        toast.error("Lỗi khi tải dữ liệu phòng ban và chức vụ.");
      }
    };

    fetchPhongbanAndChucvu();
  }, []);

  // Hàm xử lý cập nhật nhân viên
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!employee.HoTenNV || !employee.Email || !employee.PhongBan || !employee.ChucVu) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      const updatedEmployee = { ...employee };
      delete updatedEmployee.tenPhong;
      delete updatedEmployee.tenChucVu;

      console.log("Dữ liệu nhân viên sắp được cập nhật:", updatedEmployee);
      const docRef = doc(db, "nhanvien", id);
      await updateDoc(docRef, updatedEmployee);
      toast.success("Cập nhật nhân viên thành công!");
      navigate("/dashboard/danh-sach-nhan-vien");
    } catch (error) {
      console.error("Error updating employee: ", error);
      toast.error("Không thể cập nhật nhân viên.");
    }
  };

  // Hàm xử lý thay đổi giá trị
  const handleChange = async (e) => {
    const { name, value } = e.target;
    const updatedEmployee = { ...employee, [name]: value };

    if (name === "PhongBan") {
      const phongRef = doc(db, "phongban", value);
      const phongSnap = await getDoc(phongRef);
      if (phongSnap.exists()) {
        updatedEmployee.tenPhong = phongSnap.data().tenPhong;
      } else {
        updatedEmployee.tenPhong = "Không xác định";
      }
    }

    if (name === "ChucVu") {
      const chucVuRef = doc(db, "chucvu", value);
      const chucVuSnap = await getDoc(chucVuRef);
      if (chucVuSnap.exists()) {
        updatedEmployee.tenChucVu = chucVuSnap.data().tenChucVu;
      } else {
        updatedEmployee.tenChucVu = "Không xác định";
      }
    }

    setEmployee(updatedEmployee);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Chỉnh Sửa Thông Tin Nhân Viên</h2>
      <form onSubmit={handleUpdate}>
        <div className="row">
          {/* Cột trái */}
          <div className="col-6">
            <div className="mb-3">
              <label>
                <strong>Mã nhân viên</strong>
              </label>
              <input
                type="text"
                className="form-control"
                value={employee.MaNV}
                disabled
              />
            </div>
            <div className="mb-3">
              <label>
                <strong>Email</strong>
              </label>
              <input
                type="email"
                className="form-control"
                name="Email"
                value={employee.Email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label>
                <strong>Ngày sinh</strong>
              </label>
              <input
                type="date"
                className="form-control"
                name="NgaySinh"
                value={employee.NgaySinh}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label>
                <strong>Ngày cấp</strong>
              </label>
              <input
                type="date"
                className="form-control"
                name="NgayCap"
                value={employee.NgayCap}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label>
                <strong>Tôn giáo</strong>
              </label>
              <input
                type="text"
                className="form-control"
                name="TonGiao"
                value={employee.TonGiao}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label>
                <strong>Nơi sinh</strong>
              </label>
              <input
                type="text"
                className="form-control"
                name="NoiSinh"
                value={employee.NoiSinh}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label>
                <strong>Tình trạng hôn nhân</strong>
              </label>
              <select
                className="form-control"
                name="TinhTrangHonNhan"
                value={employee.TinhTrangHonNhan}
                onChange={handleChange}
              >
                <option value="">Chọn tình trạng hôn nhân</option>
                <option value="Đã kết hôn">Đã kết hôn</option>
                <option value="Chưa kết hôn">Chưa kết hôn</option>
              </select>
            </div>
            <div className="mb-3">
              <label>
                <strong>Địa chỉ tạm trú</strong>
              </label>
              <input
                type="text"
                className="form-control"
                name="DCTamTru"
                value={employee.DCTamTru}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label>
                <strong>Địa chỉ thường trú</strong>
              </label>
              <input
                type="text"
                className="form-control"
                name="DCThuongTru"
                value={employee.DCThuongTru}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
          <label>
            <strong>Phòng ban</strong>
          </label>
          <select
            className="form-control"
            name="PhongBan"
            value={employee.PhongBan}
            onChange={handleChange}
          >
            <option value={employee.PhongBan}>
              {phongbanList.find((pb) => pb.id === employee.PhongBan)?.tenPhong || "Không xác định"}
            </option>
            {phongbanList.map((pb) => (
              <option key={pb.id} value={pb.id}>
                {pb.tenPhong}
              </option>
            ))}
          </select>
        </div>
          </div>
          
          {/* Cột phải */}
          <div className="col-6">
            <div className="mb-3">
              <label>
                <strong>Họ và Tên</strong>
              </label>
              <input
                type="text"
                className="form-control"
                name="HoTenNV"
                value={employee.HoTenNV}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label>
                <strong>Số điện thoại</strong>
              </label>
              <input
                type="text"
                className="form-control"
                name="SDT"
                value={employee.SDT}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label>
                <strong>Giới tính</strong>
              </label>
              <select
                className="form-control"
                name="GioiTinh"
                value={employee.GioiTinh}
                onChange={handleChange}
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
            <div className="mb-3">
              <label>
                <strong>Nơi cấp</strong>
              </label>
              <input
                type="text"
                className="form-control"
                name="NoiCap"
                value={employee.NoiCap}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label>
                <strong>Dân tộc</strong>
              </label>
              <input
                type="text"
                className="form-control"
                name="DanToc"
                value={employee.DanToc}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label>
                <strong>Trình độ học vấn</strong>
              </label>
              <select
                className="form-control"
                name="TrinhDoHocVan"
                value={employee.TrinhDoHocVan}
                onChange={handleChange}
              >
                <option value="">Chọn trình độ</option>
                <option value="Tiểu học">Tiểu học</option>
                <option value="THCS">THCS</option>
                <option value="THPT">THPT</option>
                <option value="Cao đẳng">Cao đẳng</option>
                <option value="Đại học">Đại học</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="mb-3">
              <label>
                <strong>Tình trạng</strong>
              </label>
              <select
                className="form-control"
                name="TinhTrang"
                value={employee.TinhTrang}
                onChange={handleChange}
              >
                <option value="Đang làm việc">Đang làm việc</option>
                <option value="Đã nghỉ việc">Đã Nghỉ việc</option>
                {/* <option value="Tạm ngừng">Tạm ngừng</option> */}
              </select>
            </div>
            <div className="mb-3">
          <label>
        
            <strong>Chức vụ</strong>
          </label>
          <select
            className="form-control"
            name="ChucVu"
            value={employee.ChucVu}
            onChange={handleChange}
          >
            <option value={employee.ChucVu}>
              {chucvuList.find((cv) => cv.id === employee.ChucVu)?.tenChucVu || "Không xác định"}
            </option>
            {chucvuList.map((cv) => (
              <option key={cv.id} value={cv.id}>
                {cv.tenChucVu}
              </option>
            ))}
          </select>
        </div>
          </div>
        </div>

        
        
        {/* Hàng thứ 3 */}
        <div className="row mt-4">
          <div className="col-12">
            <label>
              <strong>Ghi chú</strong>
            </label>
            <textarea
              className="form-control"
              name="GhiChu"
              rows="4"
              value={employee.GhiChu}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>
        {/* Nút Lưu và Hủy */}
        <div className="mt-4">
          <button type="submit" className="btn btn-primary me-2">
            Lưu thay đổi
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/dashboard/danh-sach-nhan-vien")}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployee;
