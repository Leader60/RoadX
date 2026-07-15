"use client";
import { useState } from "react";
import { storage, db } from "@/lib/firebaseConfig"; // ربطنا بالملف الذي أنشأناه
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";

export default function UploadMusic() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      // 1. رفع الملف إلى Storage
      const storageRef = ref(storage, `music/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // 2. حفظ رابط الملف في Firestore
      await addDoc(collection(db, "songs"), {
        name: file.name,
        url: url,
        createdAt: new Date(),
      });

      alert("تم رفع الأغنية بنجاح!");
    } catch (error) {
      console.error("خطأ في الرفع:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3>رفع أغنية جديدة</h3>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button 
        onClick={handleUpload} 
        disabled={uploading}
        className="bg-blue-500 text-white p-2 mt-2 rounded"
      >
        {uploading ? "جاري الرفع..." : "رفع الأغنية"}
      </button>
    </div>
  );
}
