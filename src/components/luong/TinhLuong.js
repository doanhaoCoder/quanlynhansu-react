import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

const TinhLuong = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const sessionUser = JSON.parse(sessionStorage.getItem("user"));
  const { id } = useParams(); // Lấy ID nhân viên từ URL
  const [employee, setEmployee] = useState(null);
  const [nhanVienList, setNhanVienList] = useState([]);
  const [tinhLuongData, setTinhLuongData] = useState({
    MaLuong: "",
    NhanVienID: "",
    SoNgayCong: 0,
    GhiChu: "",
    PhuCap: 0,
    Thuong: 0,
    NgayTinhLuong: "",
    NguoiTao: "", // Tên người tạo
    NgayTao: "", // Ngày tạo
    LuongNgay: 0, // Lương cơ bản
  });
  // const [username, setUsername] = useState(""); // Tên người tạo từ session
  const [error, setError] = useState(""); // Lỗi nếu có trường bắt buộc chưa nhập

  useEffect(() => {
    // Lấy danh sách nhân viên
    const fetchNhanVien = async () => {
      const nhanVienSnap = await getDocs(collection(db, "nhanvien"));
      const data = nhanVienSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNhanVienList(data);
    };

    fetchNhanVien();

    // Lấy thông tin người tạo từ session

    // setUsername(userSession);

    // Lấy mã lương tiếp theo (tăng dần)
    const fetchMaLuong = async () => {
      const maLuongQuery = query(
        collection(db, "Luong"),
        orderBy("MaLuong", "desc"),
        limit(1)
      );
      const maLuongSnap = await getDocs(maLuongQuery);
      if (!maLuongSnap.empty) {
        const lastRecord = maLuongSnap.docs[0].data();
        const lastMaLuong = lastRecord.MaLuong;
        const newMaLuong = `ML${(parseInt(lastMaLuong.replace("ML", "")) + 1)
          .toString()
          .padStart(3, "0")}`;
        setTinhLuongData((prevData) => ({
          ...prevData,
          MaLuong: newMaLuong,
        }));
      } else {
        setTinhLuongData((prevData) => ({
          ...prevData,
          MaLuong: "ML001",
        }));
      }
    };

    fetchMaLuong();
  }, []);

  // Lấy thông tin nhân viên để tính lương cơ bản
  const handleNhanVienChange = async (e) => {
    const nvId = e.target.value;
    setTinhLuongData({
      ...tinhLuongData,
      NhanVienID: nvId,
    });

    // Lấy thông tin nhân viên để lấy Lương cơ bản
    if (nvId) {
      const nhanVienRef = doc(db, "nhanvien", nvId);
      const nhanVienSnap = await getDoc(nhanVienRef);

      const employeeData = nhanVienSnap.data();
      if (employeeData.ChucVu) {
        const chucVuRef = doc(db, "chucvu", employeeData.ChucVu);
        const chucVuSnap = await getDoc(chucVuRef);
        if (chucVuSnap.exists()) {
          const chucVuData = chucVuSnap.data();
          employeeData.tenChucVu = chucVuData.tenChucVu; // Kiểm tra tên trường tại đây
          employeeData.luongChucVu = chucVuData.luong; // Kiểm tra tên trường tại đây
        }
      }

      // Cập nhật state employee với dữ liệu đầy đủ
      setEmployee(employeeData);

      if (nhanVienSnap.exists()) {
        const nhanVienData = nhanVienSnap.data();
        setTinhLuongData((prevData) => ({
          ...prevData,
          LuongNgay: employeeData.luongChucVu,
        }));
      }
      // console.log(employeeData.luongChucVu);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    // Chỉ xử lý nếu giá trị nhập vào là hợp lệ (không phải ký tự không phải số)
    const formattedValue = value.replace(/\D/g, ''); // Loại bỏ tất cả ký tự không phải số
  
    // Kiểm tra nếu là các trường cần chuyển thành số (Thuong, PhuCap)
    const newValue = (name === "Thuong" || name === "PhuCap") ? Number(formattedValue) : value;
  
    setTinhLuongData({
      ...tinhLuongData,
      [name]: newValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra xem tất cả các trường bắt buộc đã được nhập hay chưa
    if (
      !tinhLuongData.NhanVienID ||
      !tinhLuongData.SoNgayCong ||
      !tinhLuongData.NgayTinhLuong ||
      !tinhLuongData.GhiChu
    ) {
      setError("Vui lòng nhập đủ các trường bắt buộc!");
      return;
    }

    try {
      // Tính lương theo số ngày công
      const tongLuong =
        parseFloat(tinhLuongData.LuongNgay) *
          parseInt(tinhLuongData.SoNgayCong) +
        parseFloat(tinhLuongData.PhuCap) +
        parseFloat(tinhLuongData.Thuong);

      // Thêm dữ liệu lương vào Firestore
      await addDoc(collection(db, "Luong"), {
        ...tinhLuongData,
        NguoiTao: sessionUser?.username,
        NgayTao: new Date().toISOString(),
        TongLuong: tongLuong,
      });

      toast.success("Tính lương thành công!");
      setTinhLuongData({
        MaLuong: "",
        NhanVienID: "",
        SoNgayCong: 0,
        GhiChu: "",
        PhuCap: 0,
        Thuong: 0,
        NgayTinhLuong: "",
        NguoiTao: sessionUser?.username,
        NgayTao: new Date().toISOString(),
        LuongNgay: 0,
      });
    } catch (error) {
      toast.error("Lỗi khi tính lương: " + error.message);
    }
  };

  return (
    <div className="container tinh-luong">
      <h2>Tính Lương</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="MaLuong">Mã Lương</label>
          <input
            type="text"
            id="MaLuong"
            name="MaLuong"
            className="form-control"
            value={tinhLuongData.MaLuong}
            readOnly
          />
        </div>

        <div className="form-group">
          <label htmlFor="NhanVienID">Chọn Nhân Viên</label>

          {/* Ô tìm kiếm */}
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Tìm nhân viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Dropdown danh sách nhân viên */}
          <select
            id="NhanVienID"
            name="NhanVienID"
            className="form-control"
            value={tinhLuongData.NhanVienID}
            onChange={handleNhanVienChange}
            required
          >
            <option value="">Chọn nhân viên</option>
            {nhanVienList
              .filter(
                (nv) =>
                  nv.MaNV.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  nv.HoTenNV.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  nv.TinhTrang.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((nv) => (
                <option key={nv.id} value={nv.id}>
                  {nv.MaNV} - {nv.HoTenNV} - ({nv.TinhTrang})
                </option>
              ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="SoNgayCong">Số Ngày Công</label>
          <input
            type="number"
            id="SoNgayCong"
            name="SoNgayCong"
            className="form-control"
            value={tinhLuongData.SoNgayCong}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="GhiChu">Ghi Chú (Ngày nghỉ, lý do nghỉ)</label>
          <textarea
            id="GhiChu"
            name="GhiChu"
            className="form-control"
            value={tinhLuongData.GhiChu}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
  <label htmlFor="PhuCap">Phụ Cấp</label>
  <input
    type="text"
    id="PhuCap"
    name="PhuCap"
    className="form-control"
    value={new Intl.NumberFormat().format(tinhLuongData.PhuCap)} // Định dạng số với dấu phân cách
    onChange={handleChange}
    onBlur={(e) => {
      // Khi người dùng rời khỏi ô input, chuyển lại thành số để gửi vào Firebase
      const formattedValue = e.target.value.replace(/\D/g, '');
      setTinhLuongData({
        ...tinhLuongData,
        PhuCap: Number(formattedValue),
      });
    }}
  />
</div>

<div className="form-group">
  <label htmlFor="Thuong">Thưởng</label>
  <input
    type="text"
    id="Thuong"
    name="Thuong"
    className="form-control"
    value={new Intl.NumberFormat().format(tinhLuongData.Thuong)} // Định dạng số với dấu phân cách
    onChange={handleChange}
    onBlur={(e) => {
      // Khi người dùng rời khỏi ô input, chuyển lại thành số để gửi vào Firebase
      const formattedValue = e.target.value.replace(/\D/g, '');
      setTinhLuongData({
        ...tinhLuongData,
        Thuong: Number(formattedValue),
      });
    }}
  />
</div>


        <div className="form-group">
          <label htmlFor="NgayTinhLuong">Ngày Tính Lương</label>
          <input
            type="date"
            id="NgayTinhLuong"
            name="NgayTinhLuong"
            className="form-control"
            value={tinhLuongData.NgayTinhLuong}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Tính Lương
        </button>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
    </div>
  );
};

export default TinhLuong;
