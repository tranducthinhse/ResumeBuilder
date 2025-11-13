import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function ViewCV(){
  const { uid, cvId } = useParams();
  const [cv, setCv] = useState(null);

  useEffect(()=>{
    if(!uid || !cvId) return;
    const load = async ()=>{
      const ref = doc(db, "users", uid, "cvs", cvId);
      const snap = await getDoc(ref);
      if(snap.exists()) setCv(snap.data());
    };
    load();
  }, [uid, cvId]);

  if(!cv) return <div>Loading...</div>;

  const personal = cv.sections?.find(s=>s.type==="personal")?.content || {};

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 shadow">
      <header className="mb-4">
        <h1 className="text-3xl font-bold">{personal.name}</h1>
        <div className="text-sm text-gray-600">{personal.email} • {personal.phone}</div>
        <div className="text-sm text-gray-600">{personal.address}</div>
      </header>

      <section className="mb-4">
        <h2 className="font-semibold">Tóm tắt</h2>
        <p>{personal.summary}</p>
      </section>

      {/* placeholder: other sections when added later */}
      <div className="text-gray-500">(Các phần khác sẽ hiển thị khi bạn thêm vào Editor)</div>
    </div>
  );
}
