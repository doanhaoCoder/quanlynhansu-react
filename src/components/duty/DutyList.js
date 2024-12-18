import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const PositionList = () => {
  const [positions, setPositions] = useState([]);
  const [formData, setFormData] = useState({
    maChucVu: "",
    tenChucVu: "",
    moTa: "",
    luong: "", // Thêm trường lương
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const sessionUser = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const fetchPositions = async () => {
      setLoading(true);
      try {
        const positionRef = collection(db, "chucvu");
        const querySnapshot = await getDocs(positionRef);
        const positionData = [];
        querySnapshot.forEach((doc) => {
          positionData.push({ ...doc.data(), id: doc.id });
        });
        setPositions(positionData);
      } catch (error) {
        console.error("Error fetching positions: ", error);
        toast.error("Không thể tải danh sách chức vụ.");
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const { maChucVu, tenChucVu, moTa, luong } = formData;

    if (!maChucVu || !tenChucVu || !luong) {
      toast.error("Mã chức vụ, tên chức vụ và lương không được để trống.");
      return;
    }

    // Kiểm tra mã chức vụ có trùng không
    const isDuplicate = positions.some((pos) => pos.maChucVu === maChucVu);
    if (isDuplicate) {
      toast.error("Mã chức vụ đã tồn tại. Vui lòng nhập mã khác.");
      return;
    }

    try {
      await addDoc(collection(db, "chucvu"), {
        maChucVu,
        tenChucVu,
        moTa,
        luong: parseFloat(luong), // Chuyển lương thành số
        nguoiTao: sessionUser?.username,
        ngayTao: new Date().toISOString(),
        lastModified: null,
        modifiedBy: null,
      });
      setFormData({ maChucVu: "", tenChucVu: "", moTa: "", luong: "" });
      toast.success("Thêm chức vụ thành công!");
      setPositions((prev) => [
        ...prev,
        {
          maChucVu,
          tenChucVu,
          moTa,
          luong: parseFloat(luong),
          nguoiTao: sessionUser?.username,
          ngayTao: new Date().toISOString(),
          lastModified: null,
          modifiedBy: null,
        },
      ]);
    } catch (error) {
      console.error("Error adding position: ", error);
      toast.error("Không thể thêm chức vụ.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chức vụ này?")) {
      try {
        await deleteDoc(doc(db, "chucvu", id));
        setPositions(positions.filter((pos) => pos.id !== id));
        toast.success("Xóa chức vụ thành công!");
      } catch (error) {
        console.error("Error deleting position: ", error);
        toast.error("Không thể xóa chức vụ.");
      }
    }
  };

  return (
    <div className="mt-5">
      <h2>Danh Sách Chức Vụ</h2>

      {/* Form thêm chức vụ */}
      <form onSubmit={handleAdd} className="mt-4">
        <div className="row g-3">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              name="maChucVu"
              placeholder="Mã chức vụ"
              value={formData.maChucVu}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              name="tenChucVu"
              placeholder="Tên chức vụ"
              value={formData.tenChucVu}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              name="moTa"
              placeholder="Mô tả"
              value={formData.moTa}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              name="luong"
              placeholder="Lương (VNĐ)"
              value={formData.luong}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">
              Thêm Chức Vụ
            </button>
          </div>
        </div>
      </form>

      {/* Danh sách chức vụ */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table table-bordered table-striped mt-4">
          <thead className="table-dark">
            <tr>
              <th>STT</th>
              <th>Mã Chức Vụ</th>
              <th>Tên Chức Vụ</th>
              <th>Mô Tả</th>
              <th>Lương Ngày (VNĐ)</th>
              <th>Người Tạo</th>
              <th>Ngày Tạo</th>
              <th>Người Chỉnh Sửa</th>
              <th>Ngày Chỉnh Sửa</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos, index) => (
              <tr key={pos.id}>
                <td>{index + 1}</td>
                <td>{pos.maChucVu}</td>
                <td>{pos.tenChucVu}</td>
                <td>
                  {pos.moTa?.length > 50
                    ? `${pos.moTa.substring(0, 50)}...`
                    : pos.moTa}
                </td>
                <td>{pos.luong ? pos.luong.toLocaleString() : "Chưa có"} VNĐ</td>
                <td>{pos.nguoiTao}</td>
                <td>{new Date(pos.ngayTao).toLocaleDateString()}</td>
                <td>{pos.modifiedBy || "Chưa chỉnh sửa"}</td>
                <td>
                  {pos.lastModified
                    ? new Date(pos.lastModified).toLocaleDateString()
                    : "Chưa chỉnh sửa"}
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() =>
                      navigate(`/dashboard/chinh-sua-chuc-vu/${pos.id}`)
                    }
                  >
                    <FaEdit /> Sửa
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(pos.id)}
                  >
                    <FaTrashAlt /> Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PositionList;
