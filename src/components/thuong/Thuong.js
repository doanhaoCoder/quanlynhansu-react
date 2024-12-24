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

const Thuong = () => {
  const [bonuses, setBonuses] = useState([]);
  const [formData, setFormData] = useState({
    maThuong: "",
    noiDungThuong: "",
    soTienThuong: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const sessionUser = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const fetchBonuses = async () => {
      setLoading(true);
      try {
        const bonusRef = collection(db, "thuong");
        const querySnapshot = await getDocs(bonusRef);
        const bonusData = [];
        querySnapshot.forEach((doc) => {
          bonusData.push({ ...doc.data(), id: doc.id });
        });
        setBonuses(bonusData);
      } catch (error) {
        console.error("Error fetching bonuses: ", error);
        toast.error("Không thể tải danh sách thưởng.");
      } finally {
        setLoading(false);
      }
    };

    fetchBonuses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "soTienThuong" ? value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") : value,
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const { maThuong, noiDungThuong, soTienThuong } = formData;

    if (!maThuong || !noiDungThuong || !soTienThuong) {
      toast.error("Mã thưởng, nội dung thưởng và số tiền thưởng không được để trống.");
      return;
    }

    // Kiểm tra trùng mã thưởng
    const isDuplicate = bonuses.some((bonus) => bonus.maThuong === maThuong);
    if (isDuplicate) {
      toast.error("Mã thưởng đã tồn tại. Vui lòng nhập mã khác.");
      return;
    }

    try {
      await addDoc(collection(db, "thuong"), {
        maThuong,
        noiDungThuong,
        soTienThuong: parseFloat(soTienThuong.replace(/,/g, "")),
        nguoiTao: sessionUser?.username,
        ngayTao: new Date().toISOString(),
      });
      setFormData({ maThuong: "", noiDungThuong: "", soTienThuong: "" });
      toast.success("Thêm thưởng thành công!");
      setBonuses((prev) => [
        ...prev,
        {
          maThuong,
          noiDungThuong,
          soTienThuong: parseFloat(soTienThuong.replace(/,/g, "")),
          nguoiTao: sessionUser?.username,
          ngayTao: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error adding bonus: ", error);
      toast.error("Không thể thêm thưởng.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thưởng này?")) {
      try {
        await deleteDoc(doc(db, "thuong", id));
        setBonuses(bonuses.filter((bonus) => bonus.id !== id));
        toast.success("Xóa thưởng thành công!");
      } catch (error) {
        console.error("Error deleting bonus: ", error);
        toast.error("Không thể xóa thưởng.");
      }
    }
  };

  return (
    <div className="mt-5">
      <h2>Danh Sách Thưởng</h2>

      {/* Form thêm thưởng */}
      <form onSubmit={handleAdd} className="mt-4">
        <div className="row g-3">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              name="maThuong"
              placeholder="Mã thưởng"
              value={formData.maThuong}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              name="noiDungThuong"
              placeholder="Nội dung thưởng"
              value={formData.noiDungThuong}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              name="soTienThuong"
              placeholder="Số tiền thưởng (VNĐ)"
              value={formData.soTienThuong}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <button type="submit" className="btn btn-primary w-100">
              Thêm Thưởng
            </button>
          </div>
        </div>
      </form>

      {/* Thanh tìm kiếm */}
      <div className="form-group mt-4">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm kiếm mã thưởng hoặc nội dung thưởng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Danh sách thưởng */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table table-bordered table-striped mt-4">
          <thead className="table-dark">
            <tr>
              <th>STT</th>
              <th>Mã Thưởng</th>
              <th>Nội Dung Thưởng</th>
              <th>Số Tiền Thưởng</th>
              <th>Người Tạo</th>
              <th>Ngày Tạo</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {bonuses
              .filter(
                (bonus) =>
                  bonus.maThuong.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  bonus.noiDungThuong.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((bonus, index) => (
                <tr key={bonus.id}>
                  <td>{index + 1}</td>
                  <td>{bonus.maThuong}</td>
                  <td>{bonus.noiDungThuong}</td>
                  <td>{bonus.soTienThuong.toLocaleString()} VNĐ</td>
                  <td>{bonus.nguoiTao}</td>
                  <td>{new Date(bonus.ngayTao).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-info btn-sm me-2 mt-2"
                      onClick={() =>
                        navigate(`/dashboard/xem-thuong/${bonus.id}`)
                      }
                    >
                      <FaEye /> Xem
                    </button>
                    <button
                      className="btn btn-warning btn-sm me-2 mt-2"
                      onClick={() =>
                        navigate(`/dashboard/chinh-sua-thuong/${bonus.id}`)
                      }
                    >
                      <FaEdit /> Sửa
                    </button>
                    <button
                      className="btn btn-danger btn-sm mt-2"
                      onClick={() => handleDelete(bonus.id)}
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

export default Thuong;
