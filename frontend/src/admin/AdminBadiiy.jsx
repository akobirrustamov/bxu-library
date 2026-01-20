import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ApiCall, { baseUrl } from "../config";
import {FiBook, FiPlus, FiEdit, FiTrash,FiEdit2,FiUser,FiTrash2,FiCalendar,FiEye,FiClock, FiDownload, FiFileText} from "react-icons/fi";
import bookImage from "../assets/newbook.jpg";
import bookImg from "../assets/newbook.jpg";
const AdminBadiiy = () => {
    const [list, setList] = useState([]);
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        name: "",
        author: "",
        publisher: "",
        genre: "",
        description: "",
        pdfId: null,
        imageId: null
    });


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await ApiCall("/api/v1/book/badiiy", "GET", null, {
            page: 0,
            size: 100,
        });

        if (!res?.error) setList(res.data.content);
    };

    const resetForm = () => {
        setForm({
            name: "",
            author: "",
            publisher: "",
            genre: "",
            description: "",
            pdf: null,
        });
        setEditId(null);
    };
    const uploadFile = async (file, prefix) => {
        const formData = new FormData();
        formData.append("photo", file);
        formData.append("prefix", prefix);

        const res = await ApiCall(
            "/api/v1/file/upload",
            "POST",
            formData,
            null,
            true
        );

        return res.data; // UUID
    };

    const handleSave = async () => {
        if (!form.name) {
            alert("Nomi majburiy");
            return;
        }

        try {
            let pdfId = null;
            let imageId = null;

            if (form.pdfId) {
                pdfId = await uploadFile(form.pdfId, "/badiiy/pdf");
            }

            if (form.imageId) {
                imageId = await uploadFile(form.imageId, "/badiiy/image");
            }

            const payload = {
                name: form.name,
                author: form.author,
                publisher: form.publisher,
                genre: form.genre,
                description: form.description,
                pdfId,
                imageId
            };

            let res;
            if (editId) {
                res = await ApiCall(`/api/v1/badiiy/${editId}`, "PUT", payload);
            } else {
                res = await ApiCall("/api/v1/badiiy", "POST", payload);
            }

            if (res?.error) {
                alert("Saqlashda xatolik");
                return;
            }

            setOpen(false);
            resetForm();
            fetchData();
        } catch (e) {
            alert("Fayl yuklashda xatolik");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("O‘chirishni tasdiqlaysizmi?")) return;
        await ApiCall(`/api/v1/badiiy/${id}`, "DELETE");
        fetchData();
    };

    const handleDownload = async (file, name) => {

        try {
            if (!file) return alert("❌ Fayl topilmadi");

            const token = localStorage.getItem("authToken");
            const res = await fetch(`${baseUrl}/api/v1/file/getFile/${file}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = name + ".pdf";
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert("Yuklab bo‘lmadi");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <main className="lg:ml-72 p-6">
                <div className="flex justify-between mb-6">
                    <h1 className="text-3xl font-bold flex gap-2">
                        <FiBook /> Badiiy Kitoblar
                    </h1>
                    <button
                        onClick={() => setOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <FiPlus /> Qo‘shish
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {list.map((book) => {
                        const imageUrl = book.imageId
                            ? `${baseUrl}/api/v1/file/img/${book.imageId}`
                            : bookImg;

                        const hasPDF = !!book.pdf?.id;

                        return (
                            <div
                                key={book.id}
                                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
                            >
                                {/* Book Image Section */}
                                <div className="relative h-52 overflow-hidden">
                                    <img
                                        src={imageUrl}
                                        alt={book.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        onError={(e) => {
                                            e.target.src = bookImg;
                                        }}
                                    />

                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Action buttons overlay */}
                                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button
                                            onClick={() => {
                                                setEditId(book.id);
                                                setForm(book);
                                                setOpen(true);
                                            }}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-lg"
                                            title="Tahrirlash"
                                        >
                                            <FiEdit2 className="text-blue-600" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(book.id, book.name)}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-lg"
                                            title="O'chirish"
                                        >
                                            <FiTrash2 className="text-red-600" />
                                        </button>
                                    </div>

                                    {/* PDF Badge */}
                                    {hasPDF && (
                                        <div className="absolute top-3 left-3">
              <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-1">
                <FiFileText className="w-3 h-3" />
                PDF
              </span>
                                        </div>
                                    )}

                                    {/* Genre Badge */}
                                    {book.genre && (
                                        <div className="absolute bottom-3 left-3">
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full shadow-lg">
                {book.genre}
              </span>
                                        </div>
                                    )}
                                </div>

                                {/* Book Info Section */}
                                <div className="p-5">
                                    {/* Subject Badge */}
                                    {book.subject?.name && (
                                        <div className="mb-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                <FiBook className="w-3 h-3" />
                  {book.subject.name}
              </span>
                                        </div>
                                    )}

                                    {/* Title */}
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {book.name}
                                    </h3>

                                    {/* Author */}
                                    {book.author && (
                                        <div className="flex items-center gap-2 text-gray-700 mb-3">
                                            <FiUser className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm">{book.author}</span>
                                        </div>
                                    )}

                                    {/* Publisher */}
                                    {book.publisher && (
                                        <div className="flex items-center gap-2 text-gray-600 mb-4">
                                            <FiCalendar className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs">{book.publisher}</span>
                                        </div>
                                    )}

                                    {/* Description (if available) */}
                                    {book.description && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {book.description}
                                        </p>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                        {hasPDF ? (
                                            <button
                                                onClick={() => handleDownload(book.pdf.id, book.name)}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 group/btn shadow hover:shadow-lg"
                                            >
                                                <FiDownload className="animate-bounce group-hover/btn:animate-none" />
                                                Yuklab olish
                                            </button>
                                        ) : (
                                            <div className="flex-1">
                                                <div className="text-center px-4 py-3 bg-gray-100 text-gray-500 rounded-xl text-sm">
                                                    PDF mavjud emas
                                                </div>
                                            </div>
                                        )}

                                        {/* Quick View Button */}
                                        {hasPDF && (
                                            <button
                                                onClick={() => window.open(`${baseUrl}/api/v1/file/getFile/${book.pdf.id}`, "_blank")}
                                                className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300"
                                                title="Ko'rish"
                                            >
                                                <FiEye />
                                            </button>
                                        )}
                                    </div>

                                    {/* Additional Info */}
                                    <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                                        {book.createdAt && (
                                            <div className="flex items-center gap-1">
                                                <FiClock className="w-3 h-3" />
                                                {new Date(book.createdAt).toLocaleDateString()}
                                            </div>
                                        )}

                                        {/* Book ID */}
                                        <div className="font-mono">
                                            ID: {book.id}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {open && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl w-full max-w-md">

                            <h2 className="text-xl font-bold mb-4">
                                {editId ? "Badiiy kitobni tahrirlash" : "Yangi badiiy kitob qo‘shish"}
                            </h2>

                            {/* Kitob nomi */}
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kitob nomi
                            </label>
                            <input
                                type="text"
                                placeholder="Kitob nomini kiriting"
                                className="w-full border p-2 mb-3 rounded"
                                value={form.name || ""}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />

                            {/* Muallif */}
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Muallif
                            </label>
                            <input
                                type="text"
                                placeholder="Muallifning ismi va familiyasi"
                                className="w-full border p-2 mb-3 rounded"
                                value={form.author || ""}
                                onChange={(e) => setForm({ ...form, author: e.target.value })}
                            />

                            {/* Nashriyot */}
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nashriyot
                            </label>
                            <input
                                type="text"
                                placeholder="Nashriyot nomini kiriting"
                                className="w-full border p-2 mb-3 rounded"
                                value={form.publisher || ""}
                                onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                            />

                            {/* Janr */}
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Janr
                            </label>
                            <input
                                type="text"
                                placeholder="Masalan: Roman, hikoya, qissa"
                                className="w-full border p-2 mb-3 rounded"
                                value={form.genre || ""}
                                onChange={(e) => setForm({ ...form, genre: e.target.value })}
                            />

                            {/*/!* Tavsif *!/*/}
                            {/*<label className="block text-sm font-medium text-gray-700 mb-1">*/}
                            {/*    Tavsif*/}
                            {/*</label>*/}
                            {/*<textarea*/}
                            {/*    placeholder="Kitob mazmuni haqida qisqacha tavsif"*/}
                            {/*    className="w-full border p-2 rounded mb-3"*/}
                            {/*    value={form.description || ""}*/}
                            {/*    onChange={(e) =>*/}
                            {/*        setForm({ ...form, description: e.target.value })*/}
                            {/*    }*/}
                            {/*/>*/}

                            {/* PDF */}
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                PDF fayl
                            </label>
                            <input
                                type="file"
                                accept="application/pdf"
                                className="w-full mb-3"
                                onChange={(e) =>
                                    setForm({ ...form, pdfId: e.target.files[0] })
                                }
                            />

                            {/* Rasm */}
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Muqova rasmi (ixtiyoriy)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                className="w-full mb-4"
                                onChange={(e) =>
                                    setForm({ ...form, imageId: e.target.files[0] })
                                }
                            />

                            {/* Actions */}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                                >
                                    Saqlash
                                </button>
                                <button
                                    onClick={() => {
                                        setOpen(false);
                                        resetForm();
                                    }}
                                    className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400 transition"
                                >
                                    Bekor qilish
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default AdminBadiiy;
