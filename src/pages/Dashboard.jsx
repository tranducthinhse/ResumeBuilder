import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../services/firebase";
import { Link } from "react-router-dom";

export default function Dashboard(){
  const { user } = useAuth();
  const [cvs, setCvs] = useState([]);

  useEffect(()=>{
    if(!user) return;
    const load = async ()=>{
      const q = query(collection(db, "users", user.uid, "cvs"), orderBy("updatedAt","desc"));
      const snap = await getDocs(q);
      const arr = snap.docs.map(d=>({id: d.id, ...d.data()}));
      setCvs(arr);
    };
    load();
  }, [user]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl">Dashboard</h2>
        <Link to="/create" className="px-4 py-2 bg-blue-600 text-white rounded">Tạo CV mới</Link>
      </div>

      {cvs.length === 0 ? (
        <div>Chưa có CV nào. Tạo CV mới để bắt đầu.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {cvs.map(cv=>(
            <div key={cv.id} className="p-4 border rounded bg-white">
              <h3 className="font-semibold">{cv.title || "Untitled"}</h3>
              <p className="text-sm text-gray-600">Cập nhật: {cv.updatedAt?.toDate?.().toLocaleString()}</p>
              <div className="mt-2 flex gap-2">
                <Link to={`/view/${user.uid}/${cv.id}`} className="px-3 py-1 border">Xem</Link>
                <Link to={`/create?edit=${cv.id}`} className="px-3 py-1 border">Sửa</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
