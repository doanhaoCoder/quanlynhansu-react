import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase";

const ChamCong = () => {
  const [nhanVienList, setNhanVienList] = useState([]);
  const [ngayNghiCoPhep, setNgayNghiCoPhep] = useState({});
  const [ngayNghiKhongPhep, setNgayNghiKhongPhep] = useState({});
  const [hasDaysOff, setHasDaysOff] = useState({});
  const [duplicateMonths, setDuplicateMonths] = useState([]);
  const [chamCongData, setChamCongData] = useState({
    MaChamCong: "",
    Thang: new Date().getMonth() + 1,
    Nam: new Date().getFullYear(),
    NguoiCham: JSON.parse(sessionStorage.getItem("user"))?.username || "",
  });

  useEffect(() => {
    const fetchNhanVien = async () => {
      const nhanVienSnap = await getDocs(collection(db, "nhanvien"));
      const data = nhanVienSnap.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((nv) => nv.TinhTrang !== "Đã nghỉ việc");
      setNhanVienList(data);
    };

    fetchNhanVien();

    const fetchMaChamCong = async () => {
      const maChamCongQuery = query(
        collection(db, "ChamCong"),
        orderBy("MaChamCong", "desc"),
        limit(1)
      );
      const maChamCongSnap = await getDocs(maChamCongQuery);
      if (!maChamCongSnap.empty) {
        const lastRecord = maChamCongSnap.docs[0].data();
        const lastMaChamCong = lastRecord.MaChamCong;
        const newMaChamCong = `CC${(parseInt(lastMaChamCong.replace("CC", "")) + 1)
          .toString()
          .padStart(3, "0")}`;
        setChamCongData((prevData) => ({
          ...prevData,
          MaChamCong: newMaChamCong,
        }));
      } else {
        setChamCongData((prevData) => ({
          ...prevData,
          MaChamCong: "CC001",
        }));
      }
    };

    fetchMaChamCong();
  }, []);

  useEffect(() => {
    const checkDuplicate = async () => {
      const chamCongSnap = await getDocs(collection(db, "ChamCong"));
      const data = chamCongSnap.docs.map((doc) => doc.data());
      const duplicates = data
        .filter((item) => item.Nam === chamCongData.Nam)
        .map((item) => parseInt(item.Thang));
      setDuplicateMonths(duplicates);
    };

    checkDuplicate();
  }, [chamCongData.Nam, chamCongData.Thang]);

  const handleNgayNghiChange = (nvId, day, type) => {
    if (type === "coPhep") {
      setNgayNghiCoPhep((prev) => ({
        ...prev,
        [nvId]: prev[nvId]
          ? prev[nvId].includes(day)
            ? prev[nvId].filter((d) => d !== day)
            : [...prev[nvId], day]
          : [day],
      }));
    } else {
      setNgayNghiKhongPhep((prev) => ({
        ...prev,
        [nvId]: prev[nvId]
          ? prev[nvId].includes(day)
            ? prev[nvId].filter((d) => d !== day)
            : [...prev[nvId], day]
          : [day],
      }));
    }
  };

  const handleHasDaysOffChange = (nvId) => {
    setHasDaysOff((prev) => ({
      ...prev,
      [nvId]: !prev[nvId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const chamCongRef = await addDoc(collection(db, "ChamCong"), {
        ...chamCongData,
      });

      for (const nv of nhanVienList) {
        const ngayCongThucTe = 26 - (ngayNghiKhongPhep[nv.id]?.length || 0);

        await addDoc(collection(db, "ChamCongChiTiet"), {
          MaChamCong: chamCongRef.id,
          NhanVienID: nv.id,
          NgayNghiCoPhep: ngayNghiCoPhep[nv.id] || [],
          NgayNghiKhongPhep: ngayNghiKhongPhep[nv.id] || [],
          NgayCongThucTe: ngayCongThucTe,
        });
      }

      alert("Chấm công thành công!");
      setChamCongData({
        MaChamCong: "",
        Thang: new Date().getMonth() + 1,
        Nam: new Date().getFullYear(),
        NguoiCham: JSON.parse(sessionStorage.getItem("user"))?.username || "",
      });
      setNgayNghiCoPhep({});
      setNgayNghiKhongPhep({});
      setHasDaysOff({});
    } catch (error) {
      alert("Lỗi khi chấm công: " + error.message);
    }
  };

  const daysInMonth = new Date(chamCongData.Nam, chamCongData.Thang, 0).getDate();

  return (
    <div className="cham-cong">
      <h2>Chấm Công</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="MaChamCong">Mã Chấm Công</label>
          <input
            type="text"
            id="MaChamCong"
            name="MaChamCong"
            className="form-control"
            value={chamCongData.MaChamCong}
            readOnly
          />
        </div>

        <div className="form-group">
          <label htmlFor="Thang">Tháng</label>
          <select
            id="Thang"
            name="Thang"
            className="form-control"
            value={chamCongData.Thang}
            onChange={(e) =>
              setChamCongData({ ...chamCongData, Thang: e.target.value })
            }
            required
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {month} {duplicateMonths.includes(month) ? "- đã chấm công" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="Nam">Năm</label>
          <input
            type="number"
            id="Nam"
            name="Nam"
            className="form-control"
            value={chamCongData.Nam}
            onChange={(e) =>
              setChamCongData({ ...chamCongData, Nam: e.target.value })
            }
            required
          />
        </div>

        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Tên NV</th>
                <th>Có ngày nghỉ</th>
              </tr>
            </thead>
            <tbody>
              {nhanVienList.map((nv) => (
                <tr key={nv.id}>
                  <td>{nv.MaNV}</td>
                  <td>{nv.HoTenNV}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={hasDaysOff[nv.id] || false}
                      onChange={() => handleHasDaysOffChange(nv.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {nhanVienList.map((nv) => (
          hasDaysOff[nv.id] && (
            <div key={nv.id} className="ngay-nghi-table" style={{ overflowX: "auto" }}>
              <h4>{nv.MaNV} - {nv.HoTenNV}</h4>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                      <th key={day}>{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Nghỉ Có Phép</td>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                      <td key={day}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={ngayNghiCoPhep[nv.id]?.includes(day) || false}
                          onChange={() => handleNgayNghiChange(nv.id, day, "coPhep")}
                        />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Nghỉ Không Phép</td>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                      <td key={day}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={ngayNghiKhongPhep[nv.id]?.includes(day) || false}
                          onChange={() => handleNgayNghiChange(nv.id, day, "khongPhep")}
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )
        ))}

        <button type="submit" className="btn btn-primary" disabled={duplicateMonths.includes(parseInt(chamCongData.Thang))}>
          Chấm Công
        </button>
      </form>
    </div>
  );
};

export default ChamCong;
