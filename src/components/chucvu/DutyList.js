import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";

const DutyList = () => {
  const [duties, setDuties] = useState([]);
  const [formData, setFormData] = useState({
    maChucVu: "",
    tenChucVu: "",
    moTa: "",
    luong: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const sessionUser = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const fetchDuties = async () => {
      setLoading(true);
      try {
        const dutyRef = collection(db, "chucvu");
        const querySnapshot = await getDocs(dutyRef);
        const dutyData = [];
        querySnapshot.forEach((doc) => {
          dutyData.push({ ...doc.data(), id: doc.id });
        });

        // Fetch the number of members for each duty
        const updatedDutyData = await Promise.all(
          dutyData.map(async (duty) => {
            const q = query(collection(db, "nhanvien"), where("ChucVu", "==", duty.id));
            const querySnapshot = await getDocs(q);
            duty.memberCount = querySnapshot.size;
            return duty;
          })
        );

        setDuties(updatedDutyData);
      } catch (error) {
        console.error("Error fetching duties: ", error);
        toast.error("Không thể tải danh sách chức vụ.");
      } finally {
        setLoading(false);
      }
    };

    fetchDuties();
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

    try {
      await addDoc(collection(db, "chucvu"), {
        maChucVu,
        tenChucVu,
        moTa,
        luong: parseFloat(luong),
        nguoiTao: sessionUser?.username,
        ngayTao: new Date().toISOString(),
        lastModified: null,
        modifiedBy: null,
      });
      setFormData({ maChucVu: "", tenChucVu: "", moTa: "", luong: "" });
      toast.success("Thêm chức vụ thành công!");
      setDuties((prev) => [
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
          memberCount: 0, // New duty initially has 0 members
        },
      ]);
    } catch (error) {
      console.error("Error adding duty: ", error);
      toast.error("Không thể thêm chức vụ.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chức vụ này?")) {
      try {
        await deleteDoc(doc(db, "chucvu", id));
        setDuties(duties.filter((duty) => duty.id !== id));
        toast.success("Xóa chức vụ thành công!");
      } catch (error) {
        console.error("Error deleting duty: ", error);
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
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              name="luong"
              placeholder="Lương ngày (VNĐ)"
              value={formData.luong}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <button type="submit" className="btn btn-primary w-100">
              Thêm Chức Vụ
            </button>
          </div>
        </div>
        <div className="row g-3 mt-3">
          <div className="col-md-12">
            <input
              type="text"
              className="form-control"
              name="moTa"
              placeholder="Mô tả"
              value={formData.moTa}
              onChange={handleChange}
            />
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
              <th>Lương Ngày</th>
              <th>Người Tạo</th>
              <th>Ngày Tạo</th>
              <th>Người Chỉnh Sửa</th>
              <th>Ngày Chỉnh Sửa</th>
              <th>Số Lượng Thành Viên</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {duties.map((duty, index) => (
              <tr key={duty.id}>
                <td>{index + 1}</td>
                <td>{duty.maChucVu}</td>
                <td>{duty.tenChucVu}</td>
                <td>
                  {duty.moTa?.length > 50
                    ? `${duty.moTa.substring(0, 50)}...`
                    : duty.moTa}
                </td>
                <td>{duty.luong.toLocaleString()} VNĐ</td>
                <td>{duty.nguoiTao}</td>
                <td>{new Date(duty.ngayTao).toLocaleDateString()}</td>
                <td>{duty.modifiedBy || "Chưa chỉnh sửa"}</td>
                <td>
                  {duty.lastModified
                    ? new Date(duty.lastModified).toLocaleDateString()
                    : "Chưa chỉnh sửa"}
                </td>
                <td>{duty.memberCount}</td>
                <td>
                  <button
                    className="btn btn-info btn-sm me-2 mt-2"
                    onClick={() =>
                      navigate(`/dashboard/xem-chuc-vu/${duty.id}`)
                    }
                  >
                    <FaEye /> Xem nhân viên
                  </button>
                  <button
                    className="btn btn-warning btn-sm me-2 mt-2"
                    onClick={() =>
                      navigate(`/dashboard/chinh-sua-chuc-vu/${duty.id}`)
                    }
                  >
                    <FaEdit /> Sửa
                  </button>
                  <button
                    className="btn btn-danger btn-sm mt-2"
                    onClick={() => handleDelete(duty.id)}
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

export default DutyList;
