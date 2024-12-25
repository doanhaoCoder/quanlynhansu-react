import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";

const ChiTietBangLuong = () => {
  const { id } = useParams(); // Lấy ID nhân viên từ URL
  const [bangLuong, setBangLuong] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Khai báo hook navigate

  useEffect(() => {
    const fetchBangLuong = async () => {
      try {
        const bangLuongRef = doc(db, "Luong", id); // Dùng ID để lấy tài liệu
        const bangLuongSnap = await getDoc(bangLuongRef);

        if (bangLuongSnap.exists()) {
          const bangLuongData = bangLuongSnap.data();

          if (bangLuongData.NhanVienID) {
            const nhanVienRef = doc(db, "nhanvien", bangLuongData.NhanVienID);
            const nhanVienSnap = await getDoc(nhanVienRef);
            if (nhanVienSnap.exists()) {
              const nhanVienData = nhanVienSnap.data();
              bangLuongData.tenNV = nhanVienData.HoTenNV;
              bangLuongData.maNV = nhanVienData.MaNV;

              const chamCongChiTietQuery = query(
                collection(db, "ChamCongChiTiet"),
                where("MaChamCong", "==", bangLuongData.MaChamCong)
              );
              const chamCongChiTietSnap = await getDocs(chamCongChiTietQuery);
              if (!chamCongChiTietSnap.empty) {
                const chamCongChiTietData = chamCongChiTietSnap.docs[0].data();
                bangLuongData.SoNgayCong = chamCongChiTietData.NgayCongThucTe;
              }

              const ghiChuPhuCap = JSON.parse(
                bangLuongData.GhiChuPhuCap || "{}"
              );
              const phuCapIds = Object.keys(ghiChuPhuCap).filter(
                (id) => ghiChuPhuCap[id]
              );
              const phuCapSnap = await getDocs(collection(db, "phucap"));
              const phuCapData = phuCapSnap.docs.reduce((acc, doc) => {
                acc[doc.id] = doc.data();
                return acc;
              }, {});
              bangLuongData.GhiChuPhuCap = phuCapIds
                .map((id) => phuCapData[id]?.noiDungPhuCap)
                .join(", ");

              const ghiChuThuong = JSON.parse(
                bangLuongData.GhiChuThuong || "{}"
              );
              const thuongIds = Object.keys(ghiChuThuong).filter(
                (id) => ghiChuThuong[id]
              );
              const thuongSnap = await getDocs(collection(db, "thuong"));
              const thuongData = thuongSnap.docs.reduce((acc, doc) => {
                acc[doc.id] = doc.data();
                return acc;
              }, {});
              bangLuongData.GhiChuThuong = thuongIds
                .map((id) => thuongData[id]?.noiDungThuong)
                .join(", ");
            }
          }

          if (bangLuongData.MaChamCong) {
            const chamCongRef = doc(db, "ChamCong", bangLuongData.MaChamCong);
            const chamCongSnap = await getDoc(chamCongRef);
            if (chamCongSnap.exists()) {
              bangLuongData.MaChamCong = chamCongSnap.data().MaChamCong;
            }
          }

          setBangLuong(bangLuongData);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching bang luong: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBangLuong();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!bangLuong) {
    return <div>Không tìm thấy thông tin bảng lương.</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4" style={{ fontSize: "2rem", fontWeight: "bold" }}>
        <button className="btn btn-primary mb-2" onClick={() => navigate(-1)}>
          Trở lại
        </button>
        <br></br>
        Chi Tiết Bảng Lương
      </h2>
      <div style={{ fontSize: "2rem", lineHeight: "2rem" }}>
        <div className="row">
          <div className="col-6">
            <p
              className="text-danger"
              style={{ fontSize: "1.8rem", lineHeight: "2rem" }}
            >
              <strong>Mã Lương:</strong> {bangLuong.MaLuong}
            </p>
            <p
              className="text-danger"
              style={{ fontSize: "1.8rem", lineHeight: "2rem" }}
            >
              <strong>Tên Nhân Viên:</strong> {bangLuong.tenNV || "Nhân viên đã bị xóa"}
            </p>
            <p>
              <strong>Mã Nhân Viên:</strong> {bangLuong.maNV}
            </p>
            <p>
              <strong>Chức Vụ:</strong> {bangLuong.ChucVu}
            </p>
            <p>
              <strong>Phòng ban:</strong> {bangLuong.PhongBan}
            </p>
            <p>
              <strong>Lương Chức Vụ:</strong>{" "}
              {bangLuong.LuongChucVu
                ? bangLuong.LuongChucVu.toLocaleString()
                : "N/A"}{" "}
              VNĐ
            </p>
          </div>
          <div className="col-6">
            <p>
              <strong>Mã Chấm Công:</strong> {bangLuong.MaChamCong}
            </p>
            <p>
              <strong>Số Ngày Công:</strong> {bangLuong.SoNgayCong || "Chấm công này đã bị xóa"}
            </p>
            <p>
              <strong>Phụ Cấp:</strong>{" "}
              {bangLuong.PhuCap ? bangLuong.PhuCap.toLocaleString() : "0"} VNĐ
            </p>
            <p>
              <strong>Ghi Chú Phụ Cấp:</strong> {bangLuong.GhiChuPhuCap || "Không có"}
            </p>
            <p>
              <strong>Thưởng:</strong>{" "}
              {bangLuong.Thuong ? bangLuong.Thuong.toLocaleString() : "0"} VNĐ
            </p>
            <p>
              <strong>Ghi Chú Thưởng:</strong> {bangLuong.GhiChuThuong || "Không có"}
            </p>
            <p>
              <strong>Tổng Lương:</strong> {bangLuong.TongLuong? bangLuong.TongLuong.toLocaleString()
                : "N/A"}{" "}
              VNĐ
            </p>
            <p>
              <strong>Đóng bảo hiểm 10.5%(Lương cơ bản + phụ cấp):</strong> {bangLuong.BaoHiem? bangLuong.BaoHiem.toLocaleString()
                : "N/A"}{" "}
              VNĐ
            </p>
            <p
              className="text-danger"
              style={{ fontSize: "1.8rem", lineHeight: "2rem" }}
            >
              <strong>Lương Thực Nhận:</strong>{" "}
              {bangLuong.TongLuong
                ? bangLuong.LuongThucNhan.toLocaleString()
                : "N/A"}{" "}
              VNĐ
            </p>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-6">
            <p>
              <strong>Ngày Tính Lương:</strong>{" "}
              {new Date(bangLuong.NgayTinhLuong).toLocaleDateString()}
            </p>
            <p>
              <strong>Ngày Tạo Bảng:</strong>{" "}
              {new Date(bangLuong.NgayTao).toLocaleString()}
            </p>
            <p>
              <strong>Người Tạo Bảng:</strong> {bangLuong.NguoiTao}
            </p>
          </div>
          <div className="col-6"></div>
        </div>
      </div>
    </div>
  );
};

export default ChiTietBangLuong;
