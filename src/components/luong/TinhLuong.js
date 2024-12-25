import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

const TinhLuong = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const sessionUser = JSON.parse(sessionStorage.getItem("user"));
  const { id } = useParams(); // Lấy ID nhân viên từ URL
  const [attendanceList, setAttendanceList] = useState([]);
  const [usedAttendanceList, setUsedAttendanceList] = useState([]);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [nhanVienList, setNhanVienList] = useState([]);
  const [phuCap, setPhuCap] = useState({});
  const [thuong, setThuong] = useState({});
  const [tinhLuongData, setTinhLuongData] = useState({
    MaLuong: "",
    MaChamCong: "",
    NgayTinhLuong: "",
    NguoiTao: sessionUser?.username || "",
    NgayTao: new Date().toISOString(),
  });
  const [error, setError] = useState(""); // Lỗi nếu có trường bắt buộc chưa nhập
  const [allowances, setAllowances] = useState([]);
  const [bonuses, setBonuses] = useState([]);

  useEffect(() => {
    // Lấy danh sách chấm công
    const fetchAttendance = async () => {
      const attendanceSnap = await getDocs(collection(db, "ChamCong"));
      const data = attendanceSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAttendanceList(data);
    };

    fetchAttendance();

    // Lấy danh sách chấm công đã được tính lương
    const fetchUsedAttendance = async () => {
      const usedAttendanceSnap = await getDocs(collection(db, "Luong"));
      const usedData = usedAttendanceSnap.docs.map((doc) => doc.data().MaChamCong);
      setUsedAttendanceList(usedData);
    };

    fetchUsedAttendance();

    // Lấy mã lương tiếp theo (tăng dần)
    const fetchMaLuong = async () => {
      const maLuongQuery = query(
        collection(db, "Luong"),
        orderBy("MaLuong", "desc"),
        limit(1)
      );
      const maLuongSnap = await getDocs(maLuongQuery);
      if (!maLuongSnap.empty) {
        const lastRecord = maLuongSnap.docs[0].data();
        const lastMaLuong = lastRecord.MaLuong;
        const newMaLuong = `ML${(parseInt(lastMaLuong.replace("ML", "")) + 1)
          .toString()
          .padStart(3, "0")}`;
        setTinhLuongData((prevData) => ({
          ...prevData,
          MaLuong: newMaLuong,
        }));
      } else {
        setTinhLuongData((prevData) => ({
          ...prevData,
          MaLuong: "ML001",
        }));
      }
    };

    fetchMaLuong();

    // Lấy danh sách phụ cấp
    const fetchAllowances = async () => {
      const allowanceSnap = await getDocs(collection(db, "phucap"));
      const allowanceData = allowanceSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllowances(allowanceData);
    };

    fetchAllowances();

    // Lấy danh sách thưởng
    const fetchBonuses = async () => {
      const bonusSnap = await getDocs(collection(db, "thuong"));
      const bonusData = bonusSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBonuses(bonusData);
    };

    fetchBonuses();
  }, []);

  const handleAttendanceChange = async (e) => {
    const attendanceId = e.target.value;
    setTinhLuongData({
      ...tinhLuongData,
      MaChamCong: attendanceId,
    });

    if (attendanceId) {
      const attendanceRef = doc(db, "ChamCong", attendanceId);
      const attendanceSnap = await getDoc(attendanceRef);

      if (attendanceSnap.exists()) {
        const attendanceData = attendanceSnap.data();
        setSelectedAttendance(attendanceData);

        const chamCongChiTietQuery = query(
          collection(db, "ChamCongChiTiet"),
          where("MaChamCong", "==", attendanceId)
        );
        const chamCongChiTietSnap = await getDocs(chamCongChiTietQuery);
        const chiTietData = chamCongChiTietSnap.docs.map((doc) => doc.data());

        const nhanVienSnap = await getDocs(collection(db, "nhanvien"));
        const nhanVienData = nhanVienSnap.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data();
          return acc;
        }, {});

        const nhanVienList = await Promise.all(
          chiTietData.map(async (chiTiet) => {
            const nhanVien = nhanVienData[chiTiet.NhanVienID];
            if (nhanVien) {
              const chucVuRef = doc(db, "chucvu", nhanVien.ChucVu);
              const chucVuSnap = await getDoc(chucVuRef);
              if (chucVuSnap.exists()) {
                nhanVien.tenChucVu = chucVuSnap.data().tenChucVu;
                nhanVien.LuongChucVu = chucVuSnap.data().luong;
              }

              const phongBanRef = doc(db, "phongban", nhanVien.PhongBan);
              const phongBanSnap = await getDoc(phongBanRef);
              if (phongBanSnap.exists()) {
                nhanVien.tenPhong = phongBanSnap.data().tenPhong;
              }
            }
            return {
              ...chiTiet,
              ...nhanVien,
            };
          })
        );

        setNhanVienList(nhanVienList);
      }
    }
  };

  const handlePhuCapChange = (nvId, allowanceId) => {
    setPhuCap((prev) => ({
      ...prev,
      [nvId]: {
        ...prev[nvId],
        [allowanceId]: !prev[nvId]?.[allowanceId],
      },
    }));
  };

  const handleThuongChange = (nvId, bonusId) => {
    setThuong((prev) => ({
      ...prev,
      [nvId]: {
        ...prev[nvId],
        [bonusId]: !prev[nvId]?.[bonusId],
      },
    }));
  };

  const calculateInsurance = (luongChucVu, soTienPhuCap) => {
    return (luongChucVu + soTienPhuCap) * 0.105;
  };

  const calculateNetSalary = (tongLuong, insurance) => {
    return tongLuong - insurance;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      for (const nv of nhanVienList) {
        const totalAllowances = Object.keys(phuCap[nv.NhanVienID] || {}).reduce((sum, allowanceId) => {
          const allowance = allowances.find((a) => a.id === allowanceId);
          return sum + (phuCap[nv.NhanVienID][allowanceId] ? (allowance ? allowance.soTienPhuCap : 0) : 0);
        }, 0);

        const totalBonuses = Object.keys(thuong[nv.NhanVienID] || {}).reduce((sum, bonusId) => {
          const bonus = bonuses.find((b) => b.id === bonusId);
          return sum + (thuong[nv.NhanVienID][bonusId] ? (bonus ? bonus.soTienThuong : 0) : 0);
        }, 0);

        const insurance = calculateInsurance(parseFloat(nv.LuongChucVu), totalAllowances);

        const tongLuong =
          parseFloat(nv.LuongChucVu) * parseFloat(nv.NgayCongThucTe) +
          totalAllowances +
          totalBonuses;

        const netSalary = calculateNetSalary(tongLuong, insurance);

        await addDoc(collection(db, "Luong"), {
          ...tinhLuongData,
          NhanVienID: nv.NhanVienID,
          PhongBan: nv.tenPhong,
          ChucVu: nv.tenChucVu,
          LuongChucVu: nv.LuongChucVu,
          PhuCap: totalAllowances,
          GhiChuPhuCap: JSON.stringify(phuCap[nv.NhanVienID] || {}),
          Thuong: totalBonuses,
          GhiChuThuong: JSON.stringify(thuong[nv.NhanVienID] || {}),
          TongLuong: tongLuong,
          BaoHiem: insurance,
          LuongThucNhan: netSalary,
        });
      }

      toast.success("Tính lương thành công!");
      setTinhLuongData({
        MaLuong: "",
        MaChamCong: "",
        NgayTinhLuong: "",
        NguoiTao: sessionUser?.username || "",
        NgayTao: new Date().toISOString(),
      });
      setPhuCap({});
      setThuong({});
      setError("");
    } catch (error) {
      toast.error("Lỗi khi tính lương: " + error.message);
    }
  };

  return (
    <div className="container tinh-luong">
      <h2>Tính Lương</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="MaLuong">Mã Lương</label>
          <input
            type="text"
            id="MaLuong"
            name="MaLuong"
            className="form-control"
            value={tinhLuongData.MaLuong}
            readOnly
          />
        </div>

        <div className="form-group">
          <label htmlFor="searchTerm">Tìm kiếm mã chấm công</label>
          <input
            type="text"
            id="searchTerm"
            name="searchTerm"
            className="form-control mb-2"
            placeholder="Tìm mã chấm công..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="MaChamCong">Chọn Mã Chấm Công</label>
          <select
            id="MaChamCong"
            name="MaChamCong"
            className="form-control"
            value={tinhLuongData.MaChamCong}
            onChange={handleAttendanceChange}
            required
          >
            <option value="">Chọn mã chấm công</option>
            {attendanceList
              .filter((attendance) =>
                attendance.MaChamCong.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((attendance) => (
                <option key={attendance.id} value={attendance.id}>
                  {attendance.MaChamCong} - {attendance.Thang}/{attendance.Nam}{" "}
                  {usedAttendanceList.includes(attendance.id) ? "- đã tính lương" : ""}
                </option>
              ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="NgayTinhLuong">Ngày Tính Lương</label>
          <input
            type="date"
            id="NgayTinhLuong"
            name="NgayTinhLuong"
            className="form-control"
            value={tinhLuongData.NgayTinhLuong}
            onChange={(e) =>
              setTinhLuongData({ ...tinhLuongData, NgayTinhLuong: e.target.value })
            }
            required
          />
        </div>

        {nhanVienList.length > 0 && (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Mã NV</th>
                  <th>Tên NV</th>
                  <th>Phụ Cấp</th>
                  <th>Thưởng</th>
                </tr>
              </thead>
              <tbody>
                {nhanVienList.map((nv) => (
                  <tr key={nv.NhanVienID}>
                    <td>{nv.MaNV}</td>
                    <td>{nv.HoTenNV}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={phuCap[nv.NhanVienID] || false}
                        onChange={() => handlePhuCapChange(nv.NhanVienID, "toggle")}
                      />
                      {phuCap[nv.NhanVienID] && (
                        <div>
                          {allowances.map((allowance) => (
                            <div key={allowance.id}>
                              <input
                                type="checkbox"
                                checked={phuCap[nv.NhanVienID]?.[allowance.id] || false}
                                onChange={() => handlePhuCapChange(nv.NhanVienID, allowance.id)}
                              />
                              {allowance.maPhuCap} - {allowance.noiDungPhuCap}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={thuong[nv.NhanVienID] || false}
                        onChange={() => handleThuongChange(nv.NhanVienID, "toggle")}
                      />
                      {thuong[nv.NhanVienID] && (
                        <div>
                          {bonuses.map((bonus) => (
                            <div key={bonus.id}>
                              <input
                                type="checkbox"
                                checked={thuong[nv.NhanVienID]?.[bonus.id] || false}
                                onChange={() => handleThuongChange(nv.NhanVienID, bonus.id)}
                              />
                              {bonus.maThuong} - {bonus.noiDungThuong}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={usedAttendanceList.includes(tinhLuongData.MaChamCong)}>
          Tính Lương
        </button>
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </form>
    </div>
  );
};

export default TinhLuong;