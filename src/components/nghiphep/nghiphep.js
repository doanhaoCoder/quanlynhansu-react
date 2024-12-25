import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const NghiPhep = () => {
  const [nghiPhepList, setNghiPhepList] = useState([]);
  const [nhanVienMap, setNhanVienMap] = useState({});
  const [chamCongMap, setChamCongMap] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [combineLeaveDays, setCombineLeaveDays] = useState(false);

  useEffect(() => {
    const fetchNghiPhep = async () => {
      const nghiPhepSnap = await getDocs(collection(db, "ChamCongChiTiet"));
      const data = nghiPhepSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNghiPhepList(data);
    };

    const fetchNhanVien = async () => {
      const nhanVienSnap = await getDocs(collection(db, "nhanvien"));
      const nhanVienData = nhanVienSnap.docs.reduce((acc, doc) => {
        acc[doc.id] = {
          MaNV: doc.data().MaNV,
          HoTenNV: doc.data().HoTenNV,
        };
        return acc;
      }, {});
      setNhanVienMap(nhanVienData);
    };

    const fetchChamCong = async () => {
      const chamCongSnap = await getDocs(collection(db, "ChamCong"));
      const chamCongData = chamCongSnap.docs.reduce((acc, doc) => {
        acc[doc.id] = { Thang: doc.data().Thang, Nam: doc.data().Nam };
        return acc;
      }, {});
      setChamCongMap(chamCongData);
    };

    fetchNghiPhep();
    fetchNhanVien();
    fetchChamCong();
  }, []);

  const filteredNghiPhepList = nghiPhepList.filter((nghiPhep) => {
    const chamCong = chamCongMap[nghiPhep.MaChamCong];
    if (!chamCong) return false;

    console.log("ChamCong:", chamCong);
    console.log("Selected Month:", selectedMonth);
    console.log("Selected Year:", selectedYear);

    const matchesMonth = selectedMonth === "all" || String(chamCong.Thang) === String(selectedMonth);
    const matchesYear = selectedYear === "all" || String(chamCong.Nam) === String(selectedYear);

    console.log("Matches Month:", matchesMonth);
    console.log("Matches Year:", matchesYear);

    return matchesMonth && matchesYear;
  });

  const combinedNghiPhepList = combineLeaveDays
    ? Object.values(
        filteredNghiPhepList.reduce((acc, nghiPhep) => {
          const chamCong = chamCongMap[nghiPhep.MaChamCong];
          const key = `${nghiPhep.NhanVienID}-${chamCong.Nam}`;
          if (acc[key]) {
            acc[key].NgayNghiCoPhep = acc[key].NgayNghiCoPhep.concat(nghiPhep.NgayNghiCoPhep);
            acc[key].NgayNghiKhongPhep = acc[key].NgayNghiKhongPhep.concat(nghiPhep.NgayNghiKhongPhep);
          } else {
            acc[key] = { ...nghiPhep, Thang: "Gộp", Nam: chamCong.Nam };
          }
          return acc;
        }, {})
      )
    : filteredNghiPhepList;

  return (
    <div>
      <h2>Danh Sách Nghỉ Phép</h2>

      {/* Bộ lọc tháng và năm */}
      <div className="filters">
        <label  style={{ marginRight: "1rem" }}>
          Tháng:
          <select
            className="form-control"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="all">Tất cả</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                Tháng {month}
              </option>
            ))}
          </select>
        </label>
        <label>
          Năm:
          <select
            className="form-control"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="all">Tất cả</option>
            {[2023, 2024, 2025].map((year) => (
              <option key={year} value={year}>
                Năm {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Checkbox to combine leave days */}
      <div className="combine-leave-days mt-2 mb-2">
        <label>
          <input
            type="checkbox"
            checked={combineLeaveDays}
            onChange={(e) => setCombineLeaveDays(e.target.checked)}
          />
          Gộp ngày nghỉ
        </label>
      </div>

      {/* Bảng hiển thị danh sách */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Mã NV</th>
            <th>Tên Nhân Viên</th>
            <th>Tháng</th>
            <th>Năm</th>
            <th>Ngày Nghỉ Có Phép</th>
            <th>Ngày Nghỉ Không Phép</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(combinedNghiPhepList).map((nghiPhep) => {
            const chamCong = chamCongMap[nghiPhep.MaChamCong];
            return (
              <tr key={nghiPhep.id}>
                <td>{nhanVienMap[nghiPhep.NhanVienID]?.MaNV}</td>
                <td>{nhanVienMap[nghiPhep.NhanVienID]?.HoTenNV}</td>
                <td>{chamCong?.Thang}</td>
                <td>{chamCong?.Nam}</td>
                <td>{nghiPhep.NgayNghiCoPhep.length}</td>
                <td>{nghiPhep.NgayNghiKhongPhep.length}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default NghiPhep;
