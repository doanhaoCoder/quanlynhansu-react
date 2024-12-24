import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const PhuCapView = () => {
  const { id } = useParams();
  const [allowance, setAllowance] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllowance = async () => {
      try {
        const allowanceRef = doc(db, "phucap", id);
        const allowanceSnap = await getDoc(allowanceRef);

        if (allowanceSnap.exists()) {
          setAllowance(allowanceSnap.data());
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching allowance: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllowance();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!allowance) {
    return <div>Không tìm thấy thông tin phụ cấp.</div>;
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
        Chi Tiết Phụ Cấp
      </h2>
      <div style={{ fontSize: "2rem", lineHeight: "2rem" }}>
        <div className="row">
          <div className="col-6">
            <p>
              <strong>Mã Phụ Cấp:</strong> {allowance.maPhuCap}
            </p>
            <p>
              <strong>Nội Dung Phụ Cấp:</strong> {allowance.noiDungPhuCap}
            </p>
            <p>
              <strong>Số Tiền Phụ Cấp:</strong> {allowance.soTienPhuCap.toLocaleString()} VNĐ
            </p>
          </div>
          <div className="col-6">
            <p>
              <strong>Người Tạo:</strong> {allowance.nguoiTao}
            </p>
            <p>
              <strong>Ngày Tạo:</strong> {new Date(allowance.ngayTao).toLocaleDateString()}
            </p>
            {allowance.lastModified && (
              <p>
                <strong>Ngày Chỉnh Sửa:</strong> {new Date(allowance.lastModified).toLocaleDateString()}
              </p>
            )}
            {allowance.modifiedBy && (
              <p>
                <strong>Người Chỉnh Sửa:</strong> {allowance.modifiedBy}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhuCapView;
