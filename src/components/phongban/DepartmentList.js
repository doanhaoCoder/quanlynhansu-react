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

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    maPhong: "",
    tenPhong: "",
    moTa: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const sessionUser = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const departmentRef = collection(db, "phongban");
        const querySnapshot = await getDocs(departmentRef);
        const departmentData = [];
        querySnapshot.forEach((doc) => {
          departmentData.push({ ...doc.data(), id: doc.id });
        });

        // Fetch the number of members for each department
        const updatedDepartmentData = await Promise.all(
          departmentData.map(async (dept) => {
            const q = query(collection(db, "nhanvien"), where("PhongBan", "==", dept.id));
            const querySnapshot = await getDocs(q);
            dept.memberCount = querySnapshot.size;
            return dept;
          })
        );

        setDepartments(updatedDepartmentData);
      } catch (error) {
        console.error("Error fetching departments: ", error);
        toast.error("Không thể tải danh sách phòng ban.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
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
    const { maPhong, tenPhong, moTa } = formData;

    if (!maPhong || !tenPhong) {
      toast.error("Mã phòng và tên phòng không được để trống.");
      return;
    }

    try {
      await addDoc(collection(db, "phongban"), {
        maPhong,
        tenPhong,
        moTa,
        nguoiTao: sessionUser?.username,
        ngayTao: new Date().toISOString(),
        lastModified: null,
        modifiedBy: null,
      });
      setFormData({ maPhong: "", tenPhong: "", moTa: "" });
      toast.success("Thêm phòng ban thành công!");
      setDepartments((prev) => [
        ...prev,
        {
          maPhong,
          tenPhong,
          moTa,
          nguoiTao: sessionUser?.username,
          ngayTao: new Date().toISOString(),
          lastModified: null,
          modifiedBy: null,
          memberCount: 0, // New department initially has 0 members
        },
      ]);
    } catch (error) {
      console.error("Error adding department: ", error);
      toast.error("Không thể thêm phòng ban.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng ban này?")) {
      try {
        await deleteDoc(doc(db, "phongban", id));
        setDepartments(departments.filter((dept) => dept.id !== id));
        toast.success("Xóa phòng ban thành công!");
      } catch (error) {
        console.error("Error deleting department: ", error);
        toast.error("Không thể xóa phòng ban.");
      }
    }
  };

  return (
    <div className="mt-5">
      <h2>Danh Sách Phòng Ban</h2>

      {/* Form thêm phòng ban */}
      <form onSubmit={handleAdd} className="mt-4">
        <div className="row g-3">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              name="maPhong"
              placeholder="Mã phòng"
              value={formData.maPhong}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              name="tenPhong"
              placeholder="Tên phòng"
              value={formData.tenPhong}
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
            <button type="submit" className="btn btn-primary w-100">
              Thêm Phòng Ban
            </button>
          </div>
        </div>
      </form>

      {/* Danh sách phòng ban */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table table-bordered table-striped mt-4">
          <thead className="table-dark">
            <tr>
              <th>STT</th>
              <th>Mã Phòng</th>
              <th>Tên Phòng</th>
              <th>Mô Tả</th>
              <th>Người Tạo</th>
              <th>Ngày Tạo</th>
              <th>Người Chỉnh Sửa</th>
              <th>Ngày Chỉnh Sửa</th>
              <th>Số Lượng Thành Viên</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, index) => (
              <tr key={dept.id}>
                <td>{index + 1}</td>
                <td>{dept.maPhong}</td>
                <td>{dept.tenPhong}</td>
                <td>
                  {dept.moTa?.length > 50
                    ? `${dept.moTa.substring(0, 50)}...`
                    : dept.moTa}
                </td>
                <td>{dept.nguoiTao}</td>
                <td>{new Date(dept.ngayTao).toLocaleDateString()}</td>
                <td>{dept.modifiedBy || "Chưa chỉnh sửa"}</td>
                <td>
                  {dept.lastModified
                    ? new Date(dept.lastModified).toLocaleDateString()
                    : "Chưa chỉnh sửa"}
                </td>
                <td>{dept.memberCount}</td>
                <td>
                  <button
                    className="btn btn-info btn-sm me-2 mt-2"
                    onClick={() =>
                      navigate(`/dashboard/xem-phong-ban/${dept.id}`)
                    }
                  >
                    <FaEye /> Xem nhân viên
                  </button>
                  <button
                    className="btn btn-warning btn-sm me-2 mt-2"
                    onClick={() =>
                      navigate(`/dashboard/chinh-sua-phong-ban/${dept.id}`)
                    }
                  >
                    <FaEdit /> Sửa
                  </button>
                  <button
                    className="btn btn-danger btn-sm mt-2"
                    onClick={() => handleDelete(dept.id)}
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

export default DepartmentList;
