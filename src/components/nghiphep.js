import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const NghiPhep = () => {
  const [nghiPhepList, setNghiPhepList] = useState([]);
  const [nhanVienMap, setNhanVienMap] = useState({});
  const [chamCongMap, setChamCongMap] = useState({});

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
          HoTenNV: doc.data().HoTenNV
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

  return (
    <div className="">
      <h2>Danh Sách Nghỉ Phép</h2>
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
          {nghiPhepList.map((nghiPhep) => (
            <tr key={nghiPhep.id}>
              <td>{nhanVienMap[nghiPhep.NhanVienID]?.MaNV}</td>
              <td>{nhanVienMap[nghiPhep.NhanVienID]?.HoTenNV}</td>
              <td>{chamCongMap[nghiPhep.MaChamCong]?.Thang}</td>
              <td>{chamCongMap[nghiPhep.MaChamCong]?.Nam}</td>
              <td>{nghiPhep.NgayNghiCoPhep.length}</td>
              <td>{nghiPhep.NgayNghiKhongPhep.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NghiPhep;
