import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";

const ChamCongChiTiet = () => {
  const { id } = useParams();
  const [chamCong, setChamCong] = useState(null);
  const [chamCongChiTietList, setChamCongChiTietList] = useState([]);
  const [nhanVienMap, setNhanVienMap] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChamCong = async () => {
      try {
        const chamCongRef = doc(db, "ChamCong", id);
        const chamCongSnap = await getDoc(chamCongRef);

        if (chamCongSnap.exists()) {
          setChamCong(chamCongSnap.data());

          const chamCongChiTietQuery = query(
            collection(db, "ChamCongChiTiet"),
            where("MaChamCong", "==", id)
          );
          const chamCongChiTietSnap = await getDocs(chamCongChiTietQuery);
          const chiTietData = chamCongChiTietSnap.docs.map((doc) => doc.data());
          setChamCongChiTietList(chiTietData);

          const nhanVienSnap = await getDocs(collection(db, "nhanvien"));
          const nhanVienData = nhanVienSnap.docs.reduce((acc, doc) => {
            acc[doc.id] = doc.data();
            return acc;
          }, {});
          setNhanVienMap(nhanVienData);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChamCong();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!chamCong) {
    return <div>Không tìm thấy thông tin chấm công.</div>;
  }

  return (
    <div className="mt-5">
      <h2 className="mb-4" style={{ fontSize: "2rem", fontWeight: "bold" }}>
        <button
          className="btn btn-primary mb-2"
          onClick={() => navigate(-1)}
        >
          Trở lại
        </button>
        <br></br>
        Chi Tiết Chấm Công
      </h2>
      <div style={{ fontSize: "2rem", lineHeight: "2rem" }}>
        <div className="row">
          <div className="col-6">
            <p>
              <strong>Mã Chấm Công:</strong> {chamCong.MaChamCong}
            </p>
            <p>
              <strong>Tháng:</strong> {chamCong.Thang}
            </p>
            <p>
              <strong>Năm:</strong> {chamCong.Nam}
            </p>
            <p>
              <strong>Người Chấm:</strong> {chamCong.NguoiCham}
            </p>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col-12">
            <h3>Chi Tiết Nhân Viên</h3>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Mã NV</th>
                  <th>Tên NV</th>
                  <th>Ngày Nghỉ Có Phép</th>
                  <th>Ngày Nghỉ Không Phép</th>
                  <th>Ngày Công Thực Tế</th>
                </tr>
              </thead>
              <tbody>
                {chamCongChiTietList.map((chiTiet, index) => (
                  <tr key={index}>
                    <td>{nhanVienMap[chiTiet.NhanVienID]?.MaNV || "N/A"}</td>
                    <td>{nhanVienMap[chiTiet.NhanVienID]?.HoTenNV || "N/A"}</td>
                    <td>{chiTiet.NgayNghiCoPhep.join(", ")}</td>
                    <td>{chiTiet.NgayNghiKhongPhep.join(", ")}</td>
                    <td>{chiTiet.NgayCongThucTe}</td>
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

export default ChamCongChiTiet;
