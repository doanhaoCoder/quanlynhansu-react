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
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";

const PhuCap = () => {
  const [allowances, setAllowances] = useState([]);
  const [formData, setFormData] = useState({
    maPhuCap: "",
    noiDungPhuCap: "",
    soTienPhuCap: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const sessionUser = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const fetchAllowances = async () => {
      setLoading(true);
      try {
        const allowanceRef = collection(db, "phucap");
        const querySnapshot = await getDocs(allowanceRef);
        const allowanceData = [];
        querySnapshot.forEach((doc) => {
          allowanceData.push({ ...doc.data(), id: doc.id });
        });
        setAllowances(allowanceData);
      } catch (error) {
        console.error("Error fetching allowances: ", error);
        toast.error("Không thể tải danh sách phụ cấp.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllowances();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "soTienPhuCap" ? value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") : value,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const { maPhuCap, noiDungPhuCap, soTienPhuCap } = formData;

    if (!maPhuCap || !noiDungPhuCap || !soTienPhuCap) {
      toast.error("Mã phụ cấp, nội dung phụ cấp và số tiền phụ cấp không được để trống.");
      return;
    }

    // Kiểm tra trùng mã phụ cấp
    const isDuplicate = allowances.some((allowance) => allowance.maPhuCap === maPhuCap);
    if (isDuplicate) {
      toast.error("Mã phụ cấp đã tồn tại. Vui lòng nhập mã khác.");
      return;
    }

    try {
      await addDoc(collection(db, "phucap"), {
        maPhuCap,
        noiDungPhuCap,
        soTienPhuCap: parseFloat(soTienPhuCap.replace(/,/g, "")),
        nguoiTao: sessionUser?.username,
        ngayTao: new Date().toISOString(),
      });
      setFormData({ maPhuCap: "", noiDungPhuCap: "", soTienPhuCap: "" });
      toast.success("Thêm phụ cấp thành công!");
      setAllowances((prev) => [
        ...prev,
        {
          maPhuCap,
          noiDungPhuCap,
          soTienPhuCap: parseFloat(soTienPhuCap.replace(/,/g, "")),
          nguoiTao: sessionUser?.username,
          ngayTao: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error adding allowance: ", error);
      toast.error("Không thể thêm phụ cấp.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phụ cấp này?")) {
      try {
        await deleteDoc(doc(db, "phucap", id));
        setAllowances(allowances.filter((allowance) => allowance.id !== id));
        toast.success("Xóa phụ cấp thành công!");
      } catch (error) {
        console.error("Error deleting allowance: ", error);
        toast.error("Không thể xóa phụ cấp.");
      }
    }
  };

  return (
    <div className="mt-5">
      <h2>Danh Sách Phụ Cấp</h2>

      {/* Form thêm phụ cấp */}
      <form onSubmit={handleAdd} className="mt-4">
        <div className="row g-3">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              name="maPhuCap"
              placeholder="Mã phụ cấp"
              value={formData.maPhuCap}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              name="noiDungPhuCap"
              placeholder="Nội dung phụ cấp"
              value={formData.noiDungPhuCap}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              name="soTienPhuCap"
              placeholder="Số tiền phụ cấp (VNĐ)"
              value={formData.soTienPhuCap}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <button type="submit" className="btn btn-primary w-100">
              Thêm Phụ Cấp
            </button>
          </div>
        </div>
      </form>

      {/* Thanh tìm kiếm */}
      <div className="form-group mt-4">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm kiếm mã phụ cấp hoặc nội dung phụ cấp..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Danh sách phụ cấp */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table table-bordered table-striped mt-4">
          <thead className="table-dark">
            <tr>
              <th>STT</th>
              <th>Mã Phụ Cấp</th>
              <th>Nội Dung Phụ Cấp</th>
              <th>Số Tiền Phụ Cấp</th>
              <th>Người Tạo</th>
              <th>Ngày Tạo</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {allowances
              .filter(
                (allowance) =>
                  allowance.maPhuCap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  allowance.noiDungPhuCap.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((allowance, index) => (
                <tr key={allowance.id}>
                  <td>{index + 1}</td>
                  <td>{allowance.maPhuCap}</td>
                  <td>{allowance.noiDungPhuCap}</td>
                  <td>{allowance.soTienPhuCap.toLocaleString()} VNĐ</td>
                  <td>{allowance.nguoiTao}</td>
                  <td>{new Date(allowance.ngayTao).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-info btn-sm me-2 mt-2"
                      onClick={() =>
                        navigate(`/dashboard/xem-phu-cap/${allowance.id}`)
                      }
                    >
                      <FaEye /> Xem
                    </button>
                    <button
                      className="btn btn-warning btn-sm me-2 mt-2"
                      onClick={() =>
                        navigate(`/dashboard/chinh-sua-phu-cap/${allowance.id}`)
                      }
                    >
                      <FaEdit /> Sửa
                    </button>
                    <button
                      className="btn btn-danger btn-sm mt-2"
                      onClick={() => handleDelete(allowance.id)}
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

export default PhuCap;
