import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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
    TinhTrang: "",
    GhiChu: "",
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const docRef = doc(db, "nhanvien", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEmployee(docSnap.data());
        } else {
          toast.error("Không tìm thấy nhân viên!");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching employee data: ", error);
        toast.error("Lỗi khi tải dữ liệu nhân viên.");
      }
    };

    fetchEmployee();
  }, [id, navigate]);

  // Hàm xử lý cập nhật nhân viên
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "nhanvien", id);
      await updateDoc(docRef, employee);
      toast.success("Cập nhật nhân viên thành công!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating employee: ", error);
      toast.error("Không thể cập nhật nhân viên.");
    }
  };

  // Hàm xử lý thay đổi giá trị
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({ ...prev, [name]: value }));
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

        <div className="mt-4">
          <button type="submit" className="btn btn-primary me-2">
            Lưu thay đổi
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/dashboard")}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployee;
