import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc, query, where, writeBatch } from "firebase/firestore";
import { db } from "../../firebase";
import { Link } from "react-router-dom";
import { FaEye, FaTrash } from "react-icons/fa";

const DanhSachChamCong = () => {
  const [chamCongList, setChamCongList] = useState([]);

  useEffect(() => {
    const fetchChamCong = async () => {
      const chamCongSnap = await getDocs(collection(db, "ChamCong"));
      const data = chamCongSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChamCongList(data);
    };

    fetchChamCong();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) {
      try {
        // Delete ChamCong record
        await deleteDoc(doc(db, "ChamCong", id));

        // Delete corresponding ChamCongChiTiet records
        const chamCongChiTietQuery = query(
          collection(db, "ChamCongChiTiet"),
          where("MaChamCong", "==", id)
        );
        const chamCongChiTietSnap = await getDocs(chamCongChiTietQuery);
        const batch = writeBatch(db);
        chamCongChiTietSnap.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();

        setChamCongList(chamCongList.filter((chamCong) => chamCong.id !== id));
        alert("Xóa thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa: ", error);
        alert("Lỗi khi xóa!");
      }
    }
  };

  return (
    <div className="">
      <h2>Danh Sách Chấm Công</h2>
      <Link to="/dashboard/nghi-phep" className="btn btn-primary mb-3">
        Xem Danh Sách Nghỉ Phép
      </Link>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Mã Chấm Công</th>
            <th>Tháng</th>
            <th>Năm</th>
            <th>Người Chấm</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {chamCongList.map((chamCong) => (
            <tr key={chamCong.id}>
              <td>{chamCong.MaChamCong}</td>
              <td>{chamCong.Thang}</td>
              <td>{chamCong.Nam}</td>
              <td>{chamCong.NguoiCham}</td>
              <td>
                <Link to={`/dashboard/chi-tiet-cham-cong/${chamCong.id}`} className="btn btn-info btn-sm mr-2 me-2 mt-2">
                  <FaEye /> Xem
                </Link>
                <button
                  className="btn btn-danger btn-sm me-2 mt-2"
                  onClick={() => handleDelete(chamCong.id)}
                >
                  <FaTrash /> Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DanhSachChamCong;
