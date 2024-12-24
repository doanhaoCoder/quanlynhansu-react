import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const ThuongView = () => {
  const { id } = useParams();
  const [bonus, setBonus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBonus = async () => {
      try {
        const bonusRef = doc(db, "thuong", id);
        const bonusSnap = await getDoc(bonusRef);

        if (bonusSnap.exists()) {
          setBonus(bonusSnap.data());
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching bonus: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBonus();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!bonus) {
    return <div>Không tìm thấy thông tin thưởng.</div>;
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
        Chi Tiết Thưởng
      </h2>
      <div style={{ fontSize: "2rem", lineHeight: "2rem" }}>
        <div className="row">
          <div className="col-6">
            <p>
              <strong>Mã Thưởng:</strong> {bonus.maThuong}
            </p>
            <p>
              <strong>Nội Dung Thưởng:</strong> {bonus.noiDungThuong}
            </p>
            <p>
              <strong>Số Tiền Thưởng:</strong> {bonus.soTienThuong.toLocaleString()} VNĐ
            </p>
          </div>
          <div className="col-6">
            <p>
              <strong>Người Tạo:</strong> {bonus.nguoiTao}
            </p>
            <p>
              <strong>Ngày Tạo:</strong> {new Date(bonus.ngayTao).toLocaleDateString()}
            </p>
            {bonus.lastModified && (
              <p>
                <strong>Ngày Chỉnh Sửa:</strong> {new Date(bonus.lastModified).toLocaleDateString()}
              </p>
            )}
            {bonus.modifiedBy && (
              <p>
                <strong>Người Chỉnh Sửa:</strong> {bonus.modifiedBy}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThuongView;
