import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ApiCall, { baseUrl } from "../config";
import { FiBook, FiPlus, FiEdit2, FiTrash2, FiUser, FiCalendar, FiEye, FiClock, FiDownload, FiFileText, FiChevronLeft, FiChevronRight, FiFilter } from "react-icons/fi";
import bookImg from "../assets/newbook.jpg";

const AdminIlmiy = () => {
    const [list, setList] = useState([]);
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Pagination state (client-side pagination since filter returns List)
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Filter state
    const [filters, setFilters] = useState({
        mavzu: "",
        ixtisosligi: "",
        author: "",
        genre: "",
        isHaveLibrary: null,
        createdAt: null
    });

    const [form, setForm] = useState({
        mavzu: "",
        ixtisosligi: "",
        author: "",
        genre: "Dissertatsiya",
        isHaveLibrary: false,
        libraryCount: 0,
        pdfId: null
    });

    // Genre options
    const genreOptions = [
        { value: "Dissertatsiya", label: "Dissertatsiya" },
        { value: "Avtoreferat", label: "Avtoreferat" },
        { value: "Monografiya", label: "Monografiya" },
        { value: "Darslik", label: "Darslik" },
        { value: "Qo'llanma", label: "Qo'llanma" },
        { value: "Maqola", label: "Maqola" },
        { value: "Tezis", label: "Tezis" }
    ];

    useEffect(() => {
        fetchData();
    }, []); // Remove currentPage dependency since we'll do client-side pagination

    const fetchData = async () => {
        setLoading(true);
        try {
            // Build query params
            const params = {};
            if (filters.mavzu) params.mavzu = filters.mavzu;
            if (filters.ixtisosligi) params.ixtisosligi = filters.ixtisosligi;
            if (filters.author) params.author = filters.author;
            if (filters.genre) params.genre = filters.genre;
            if (filters.isHaveLibrary !== null) params.isHaveLibrary = filters.isHaveLibrary;
            if (filters.createdAt) params.createdAt = filters.createdAt;

            const res = await ApiCall("/api/v1/ilmiy/filter", "GET", null, params);

            if (!res?.error) {
                // The filter endpoint returns a List (array), not a Page object
                const data = Array.isArray(res.data) ? res.data : [];
                setList(data);
                setTotalElements(data.length);
                setTotalPages(Math.ceil(data.length / pageSize));
            } else {
                setList([]);
                setTotalElements(0);
                setTotalPages(0);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setList([]);
            setTotalElements(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    // Get current page data for client-side pagination
    const getCurrentPageData = () => {
        const start = currentPage * pageSize;
        const end = start + pageSize;
        return list.slice(start, end);
    };

    const resetForm = () => {
        setForm({
            mavzu: "",
            ixtisosligi: "",
            author: "",
            genre: "Dissertatsiya",
            isHaveLibrary: false,
            libraryCount: 0,
            pdfId: null
        });
        setEditId(null);
    };

    const resetFilters = () => {
        setFilters({
            mavzu: "",
            ixtisosligi: "",
            author: "",
            genre: "",
            isHaveLibrary: null,
            createdAt: null
        });
        setCurrentPage(0);
        fetchData();
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

        return res.data;
    };

    const handleSave = async () => {
        if (!form.mavzu) {
            alert("Mavzu majburiy");
            return;
        }

        try {
            let pdfId = null;

            if (form.pdfId instanceof File) {
                pdfId = await uploadFile(form.pdfId, "/ilmiy/pdf");
            }

            const payload = {
                mavzu: form.mavzu,
                ixtisosligi: form.ixtisosligi,
                author: form.author,
                genre: form.genre,
                isHaveLibrary: form.isHaveLibrary,
                libraryCount: form.libraryCount,
                pdfId: pdfId || form.pdfId
            };

            let res;
            if (editId) {
                res = await ApiCall(`/api/v1/ilmiy/${editId}`, "PUT", payload);
            } else {
                res = await ApiCall("/api/v1/ilmiy", "POST", payload);
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
        await ApiCall(`/api/v1/ilmiy/${id}`, "DELETE");
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

    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }
        } else {
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

    const handleFilter = () => {
        setCurrentPage(0);
        fetchData();
    };

    const currentPageData = getCurrentPageData();

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <main className="lg:ml-72 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                            <FiBook className="text-white text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Ilmiy Kitoblar</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                                    Jami: <span className="font-bold">{totalElements} ta</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Sahifalar: <span className="font-bold">{totalPages}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <FiFilter className="text-lg" />
                            <span className="font-semibold">Filter</span>
                        </button>

                        <button
                            onClick={() => setOpen(true)}
                            className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                            <div className="relative flex items-center gap-2">
                                <FiPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                                <span className="font-semibold">Yangi kitob qo'shish</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                        <h3 className="text-lg font-semibold mb-4">Filterlar</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mavzu</label>
                                <input
                                    type="text"
                                    placeholder="Mavzu bo'yicha qidirish"
                                    className="w-full border p-2 rounded"
                                    value={filters.mavzu || ""}
                                    onChange={(e) => setFilters({ ...filters, mavzu: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ixtisosligi</label>
                                <input
                                    type="text"
                                    placeholder="Ixtisosligi bo'yicha qidirish"
                                    className="w-full border p-2 rounded"
                                    value={filters.ixtisosligi || ""}
                                    onChange={(e) => setFilters({ ...filters, ixtisosligi: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Muallif</label>
                                <input
                                    type="text"
                                    placeholder="Muallif bo'yicha qidirish"
                                    className="w-full border p-2 rounded"
                                    value={filters.author || ""}
                                    onChange={(e) => setFilters({ ...filters, author: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Janr</label>
                                <select
                                    className="w-full border p-2 rounded bg-white"
                                    value={filters.genre || ""}
                                    onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                                >
                                    <option value="">Barcha janrlar</option>
                                    {genreOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kutubxonada mavjudligi</label>
                                <select
                                    className="w-full border p-2 rounded bg-white"
                                    value={filters.isHaveLibrary === null ? "" : filters.isHaveLibrary.toString()}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFilters({
                                            ...filters,
                                            isHaveLibrary: val === "" ? null : val === "true"
                                        });
                                    }}
                                >
                                    <option value="">Barchasi</option>
                                    <option value="true">Mavjud</option>
                                    <option value="false">Mavjud emas</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleFilter}
                                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                            >
                                Qidirish
                            </button>
                            <button
                                onClick={resetFilters}
                                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                            >
                                Tozalash
                            </button>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                )}

                {!loading && list.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Kitoblar topilmadi</h3>
                        <p className="text-gray-500">Hozircha hech qanday ilmiy kitob mavjud emas</p>
                        <button
                            onClick={() => setOpen(true)}
                            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <FiPlus className="inline mr-2" />
                            Birinchi kitobni qo'shing
                        </button>
                    </div>
                )}

                {!loading && list.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {currentPageData.map((item) => {
                                const hasPDF = !!item.pdf?.id;
                                const genreLabel = genreOptions.find(opt => opt.value === item.genre)?.label || item.genre;

                                return (
                                    <div
                                        key={item.id}
                                        className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
                                    >
                                        <div className="relative h-40 bg-gradient-to-br from-purple-500 to-indigo-600 p-6">
                                            <FiBook className="text-white text-6xl opacity-50 absolute right-4 bottom-4" />
                                            <div className="relative z-10">
                                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                                                    {item.mavzu}
                                                </h3>
                                                {item.ixtisosligi && (
                                                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                                                        {item.ixtisosligi}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <button
                                                    onClick={() => {
                                                        setEditId(item.id);
                                                        setForm({
                                                            mavzu: item.mavzu || "",
                                                            ixtisosligi: item.ixtisosligi || "",
                                                            author: item.author || "",
                                                            genre: item.genre || "Dissertatsiya",
                                                            isHaveLibrary: item.isHaveLibrary || false,
                                                            libraryCount: item.libraryCount || 0,
                                                            pdfId: item.pdf?.id || null
                                                        });
                                                        setOpen(true);
                                                    }}
                                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-lg"
                                                    title="Tahrirlash"
                                                >
                                                    <FiEdit2 className="text-purple-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-lg"
                                                    title="O'chirish"
                                                >
                                                    <FiTrash2 className="text-red-600" />
                                                </button>
                                            </div>

                                            {hasPDF && (
                                                <div className="absolute top-3 left-3">
                                                    <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-1">
                                                        <FiFileText className="w-3 h-3" />
                                                        PDF
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5">
                                            {item.author && (
                                                <div className="flex items-center gap-2 text-gray-700 mb-3">
                                                    <FiUser className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm">{item.author}</span>
                                                </div>
                                            )}

                                            {item.genre && (
                                                <div className="flex items-center gap-2 text-gray-600 mb-3">
                                                    <FiBook className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm">Janr: {genreLabel}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-600">Kutubxonada:</span>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.isHaveLibrary ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {item.isHaveLibrary ? 'Mavjud' : 'Mavjud emas'}
                                                    </span>
                                                </div>
                                                {item.isHaveLibrary && (
                                                    <div className="text-sm text-gray-600">
                                                        Soni: <span className="font-semibold">{item.libraryCount}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                                {hasPDF ? (
                                                    <button
                                                        onClick={() => handleDownload(item.pdf.id, item.mavzu)}
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

                                                {hasPDF && (
                                                    <button
                                                        onClick={() => window.open(`${baseUrl}/api/v1/file/getFile/${item.pdf.id}`, "_blank")}
                                                        className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-600 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300"
                                                        title="Ko'rish"
                                                    >
                                                        <FiEye />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                                                {item.createdAt && (
                                                    <div className="flex items-center gap-1">
                                                        <FiClock className="w-3 h-3" />
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </div>
                                                )}
                                                <div className="font-mono">
                                                    ID: {item.id}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-gray-200">
                                <div className="text-sm text-gray-600">
                                    Jami {totalElements} ta kitobdan {Math.min((currentPage * pageSize) + 1, totalElements)}-{Math.min((currentPage + 1) * pageSize, totalElements)} tasi ko'rsatilmoqda
                                </div>

                                <div className="flex items-center gap-2">
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

                                    {getPageNumbers().map((pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`w-10 h-10 rounded-lg font-medium ${currentPage === pageNum
                                                ? 'bg-purple-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    ))}

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

                                <div className="text-sm text-gray-500">
                                    Har bir sahifada {pageSize} ta
                                </div>
                            </div>
                        )}
                    </>
                )}

                {open && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">
                                {editId ? "Ilmiy kitobni tahrirlash" : "Yangi ilmiy kitob qo'shish"}
                            </h2>

                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mavzu *
                            </label>
                            <input
                                type="text"
                                placeholder="Mavzuni kiriting"
                                className="w-full border p-2 mb-3 rounded"
                                value={form.mavzu || ""}
                                onChange={(e) => setForm({ ...form, mavzu: e.target.value })}
                            />

                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ixtisosligi
                            </label>
                            <input
                                type="text"
                                placeholder="Ixtisosligini kiriting"
                                className="w-full border p-2 mb-3 rounded"
                                value={form.ixtisosligi || ""}
                                onChange={(e) => setForm({ ...form, ixtisosligi: e.target.value })}
                            />

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

                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Janr
                            </label>
                            <select
                                className="w-full border p-2 mb-3 rounded bg-white"
                                value={form.genre || "Dissertatsiya"}
                                onChange={(e) => setForm({ ...form, genre: e.target.value })}
                            >
                                {genreOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <div className="mb-3">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.isHaveLibrary || false}
                                        onChange={(e) => setForm({ ...form, isHaveLibrary: e.target.checked })}
                                        className="w-4 h-4 text-purple-600"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Kutubxonada mavjud</span>
                                </label>
                            </div>

                            {form.isHaveLibrary && (
                                <>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kutubxonadagi soni
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Nusxalar soni"
                                        className="w-full border p-2 mb-3 rounded"
                                        value={form.libraryCount || 0}
                                        onChange={(e) => setForm({ ...form, libraryCount: parseInt(e.target.value) || 0 })}
                                    />
                                </>
                            )}

                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                PDF fayl
                            </label>
                            <input
                                type="file"
                                accept="application/pdf"
                                className="w-full mb-4 p-2 border rounded"
                                onChange={(e) =>
                                    setForm({ ...form, pdfId: e.target.files[0] })
                                }
                            />

                            <div className="flex gap-2 mt-6">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium"
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

export default AdminIlmiy;