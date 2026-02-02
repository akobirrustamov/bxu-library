import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ApiCall, { baseUrl } from "../config";
import { FiBook, FiPlus, FiEdit2, FiTrash2, FiUser, FiCalendar, FiEye, FiClock, FiDownload, FiFileText, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import bookImg from "../assets/newbook.jpg";

const AdminBadiiy = () => {
    const [list, setList] = useState([]);
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20); // Items per page
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

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
    }, [currentPage]); // Refetch when page changes

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await ApiCall("/api/v1/book/badiiy", "GET", null, {
                page: currentPage,
                size: pageSize,
            });

            if (!res?.error) {
                setList(res.data.content || []);
                setTotalPages(res.data.totalPages || 0);
                setTotalElements(res.data.totalElements || 0);
            } else {
                setList([]);
                setTotalPages(0);
                setTotalElements(0);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setList([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            name: "",
            author: "",
            publisher: "",
            genre: "",
            description: "",
            pdfId: null,
            imageId: null
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

            if (form.pdfId instanceof File) {
                pdfId = await uploadFile(form.pdfId, "/badiiy/pdf");
            }

            if (form.imageId instanceof File) {
                imageId = await uploadFile(form.imageId, "/badiiy/image");
            }

            const payload = {
                name: form.name,
                author: form.author,
                publisher: form.publisher,
                genre: form.genre,
                description: form.description,
                pdfId: pdfId || form.pdfId,
                imageId: imageId || form.imageId
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
            console.error("Error saving:", e);
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

    // Pagination controls
    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            // Show all pages
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show limited pages with ellipsis
            let start = Math.max(0, currentPage - 2);
            let end = Math.min(totalPages, start + maxVisiblePages);

            if (end - start < maxVisiblePages) {
                start = Math.max(0, end - maxVisiblePages);
            }

            for (let i = start; i < end; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <main className="lg:ml-72 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                            <FiBook className="text-white text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Badiiy Kitoblar</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                    Jami: <span className="font-bold">{totalElements} ta</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Sahifalar: <span className="font-bold">{totalPages}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setOpen(true)}
                        className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-2">
                            <FiPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                            <span className="font-semibold">Yangi kitob qo'shish</span>
                        </div>
                    </button>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {/* Empty state */}
                {!loading && list.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Kitoblar topilmadi</h3>
                        <p className="text-gray-500">Hozircha hech qanday badiiy kitob mavjud emas</p>
                        <button
                            onClick={() => setOpen(true)}
                            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FiPlus className="inline mr-2" />
                            Birinchi kitobni qo'shing
                        </button>
                    </div>
                )}

                {/* Books grid */}
                {!loading && list.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
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
                                                        setForm({
                                                            name: book.name || "",
                                                            author: book.author || "",
                                                            publisher: book.publisher || "",
                                                            genre: book.genre || "",
                                                            description: book.description || "",
                                                            pdfId: book.pdf?.id || null,
                                                            imageId: book.imageId || null
                                                        });
                                                        setOpen(true);
                                                    }}
                                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-lg"
                                                    title="Tahrirlash"
                                                >
                                                    <FiEdit2 className="text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(book.id)}
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

                                            {/* Description */}
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-gray-200">
                                {/* Page info */}
                                <div className="text-sm text-gray-600">
                                    Jami {totalElements} ta kitobdan {Math.min((currentPage * pageSize) + 1, totalElements)}-{Math.min((currentPage + 1) * pageSize, totalElements)} tasi ko'rsatilmoqda
                                </div>

                                {/* Pagination buttons */}
                                <div className="flex items-center gap-2">
                                    {/* Previous button */}
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 0}
                                        className={`p-2 rounded-lg ${currentPage === 0
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <FiChevronLeft className="w-5 h-5" />
                                    </button>

                                    {/* Page numbers */}
                                    {getPageNumbers().map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`w-10 h-10 rounded-lg font-medium ${currentPage === pageNum
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    ))}

                                    {/* Next button */}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages - 1}
                                        className={`p-2 rounded-lg ${currentPage === totalPages - 1
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        <FiChevronRight className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Page size info */}
                                <div className="text-sm text-gray-500">
                                    Har bir sahifada {pageSize} ta
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Modal */}
                {open && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">
                                {editId ? "Badiiy kitobni tahrirlash" : "Yangi badiiy kitob qo'shish"}
                            </h2>

                            {/* Kitob nomi */}
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kitob nomi *
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

                            {/* Tavsif */}
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tavsif
                            </label>
                            <textarea
                                placeholder="Kitob mazmuni haqida qisqacha tavsif"
                                className="w-full border p-2 rounded mb-3"
                                value={form.description || ""}
                                onChange={(e) =>
                                    setForm({ ...form, description: e.target.value })
                                }
                                rows="3"
                            />

                            {/* PDF */}
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                PDF fayl
                            </label>
                            <input
                                type="file"
                                accept="application/pdf"
                                className="w-full mb-3 p-2 border rounded"
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
                                className="w-full mb-4 p-2 border rounded"
                                onChange={(e) =>
                                    setForm({ ...form, imageId: e.target.files[0] })
                                }
                            />

                            {/* Actions */}
                            <div className="flex gap-2 mt-6">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                                >
                                    Saqlash
                                </button>
                                <button
                                    onClick={() => {
                                        setOpen(false);
                                        resetForm();
                                    }}
                                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
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