import React, { useEffect, useState } from "react";
import {
    FiBook,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiSearch,
    FiFilter,
    FiX,
    FiCheck,
    FiBookOpen,
    FiHash,
    FiInfo,
    FiClock
} from "react-icons/fi";
import ApiCall from "../config";
import Sidebar from "./Sidebar";

const AdminSubject = () => {
    const [subjects, setSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        withDescription: 0,
        recent: 0
    });

    const [openModal, setOpenModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const [form, setForm] = useState({
        name: "",
        description: "",
    });

    /* =========================
       LOAD SUBJECTS
    ========================= */
    const loadSubjects = async () => {
        setLoading(true);
        try {
            const res = await ApiCall("/api/v1/subject", "GET");
            if (!res?.error) {
                setSubjects(res.data);
                calculateStats(res.data);
            }
        } catch (error) {
            console.error("Error loading subjects:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubjects();
    }, []);

    useEffect(() => {
        filterSubjects();
    }, [subjects, searchTerm]);

    const calculateStats = (data) => {
        const total = data.length;
        const withDescription = data.filter(s => s.description?.trim()).length;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recent = data.filter(s => new Date(s.createdAt) > weekAgo).length;

        setStats({ total, withDescription, recent });
    };

    const filterSubjects = () => {
        if (!searchTerm.trim()) {
            setFilteredSubjects(subjects);
            return;
        }

        const filtered = subjects.filter(subject =>
            subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subject.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSubjects(filtered);
    };

    /* =========================
       FORM HELPERS
    ========================= */
    const resetForm = () => {
        setForm({
            name: "",
            description: "",
        });
        setEditId(null);
    };

    const closeModal = () => {
        setOpenModal(false);
        resetForm();
    };

    /* =========================
       CREATE / UPDATE
    ========================= */
    const handleSubmit = async () => {
        if (!form.name.trim()) {
            alert("Fan nomi majburiy");
            return;
        }

        try {
            if (editId) {
                await ApiCall(`/api/v1/subject/${editId}`, "PUT", form);
            } else {
                await ApiCall("/api/v1/subject", "POST", form);
            }

            closeModal();
            loadSubjects();
        } catch (error) {
            console.error("Error saving subject:", error);
        }
    };

    /* =========================
       EDIT
    ========================= */
    const handleEdit = (subject) => {
        setEditId(subject.id);
        setForm({
            name: subject.name,
            description: subject.description || "",
        });
        setOpenModal(true);
    };

    /* =========================
       DELETE
    ========================= */
    const handleDelete = async (id, name) => {
        if (!window.confirm(`${name} fanini o'chirmoqchimisiz?`)) return;
        try {
            await ApiCall(`/api/v1/subject/${id}`, "DELETE");
            loadSubjects();
        } catch (error) {
            console.error("Error deleting subject:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Sidebar />

            <div className="lg:ml-72">
                <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Fanlar Boshqaruvi</h1>
                                <p className="text-gray-600 mt-2">Barcha o'quv fanlari va yo'nalishlari</p>
                            </div>
                            <button
                                onClick={() => setOpenModal(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <FiPlus className="text-xl" />
                                Yangi Fan
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Jami Fanlar</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-xl">
                                        <FiBook className="text-blue-600 text-2xl" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Tavsif bilan</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.withDescription}</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-xl">
                                        <FiInfo className="text-green-600 text-2xl" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">So'nggi 7 kun</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.recent}</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-xl">
                                        <FiClock className="text-purple-600 text-2xl" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                            <div className="relative">
                                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Fan nomi yoki tavsifi bo'yicha qidirish..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Subjects List */}
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                {filteredSubjects.length === 0 ? (
                                    <div className="text-center py-16">
                                        <FiBookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900">Fanlar topilmadi</h3>
                                        <p className="text-gray-600 mt-2">
                                            {searchTerm
                                                ? "Qidiruv natijasi bo'yicha fan topilmadi"
                                                : "Hozircha fanlar mavjud emas"}
                                        </p>
                                        {!searchTerm && (
                                            <button
                                                onClick={() => setOpenModal(true)}
                                                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition"
                                            >
                                                <FiPlus />
                                                Birinchi Fan Qo'shing
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {filteredSubjects.map((subject, index) => (
                                            <div
                                                key={subject.id}
                                                className="p-6 hover:bg-gray-50 transition-colors group"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                                                                {index + 1}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                                                                    {subject.name}
                                                                </h3>
                                                                <div className="flex items-center gap-2 mt-1">
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    <FiHash className="w-3 h-3 mr-1" />
                                    ID: {subject.id}
                                  </span>
                                                                    {subject.description && (
                                                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                      <FiCheck className="w-3 h-3 mr-1" />
                                      Tavsif mavjud
                                    </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {subject.description && (
                                                            <p className="text-gray-600 mt-3 pl-11 border-l-2 border-blue-200">
                                                                {subject.description}
                                                            </p>
                                                        )}

                                                        {/* Book Count (if available) */}
                                                        {subject.bookCount !== undefined && (
                                                            <div className="flex items-center gap-2 mt-4 pl-11">
                                                                <FiBook className="text-gray-400" />
                                                                <span className="text-sm text-gray-500">
                                  {subject.bookCount} ta kitob
                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(subject)}
                                                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                                                            title="Tahrirlash"
                                                        >
                                                            <FiEdit2 />
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmDelete(subject)}
                                                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                                                            title="O'chirish"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Results Count */}
                                {filteredSubjects.length > 0 && (
                                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">{filteredSubjects.length}</span> ta fan topildi
                                            </div>
                                            {searchTerm && (
                                                <button
                                                    onClick={() => setSearchTerm("")}
                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    Qidiruvni tozalash
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Subject Modal */}
            {openModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editId ? "Fanni Tahrirlash" : "Yangi Fan Qo'shish"}
                                </h2>
                                <p className="text-gray-600 text-sm mt-1">
                                    Fan ma'lumotlarini to'ldiring
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Subject Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fan nomi *
                                </label>
                                <div className="relative">
                                    <FiBook className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Masalan: Dasturlash asoslari"
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Fan nomi talabalar uchun aniq va tushunarli bo'lishi kerak
                                </p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tavsif (Ixtiyoriy)
                                </label>
                                <div className="relative">
                                    <FiInfo className="absolute left-4 top-3 text-gray-400" />
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        rows="4"
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                        placeholder="Fan haqida qisqacha tavsif..."
                                    />
                                </div>
                                <div className="flex justify-between mt-2">
                                    <p className="text-xs text-gray-500">
                                        Tavsif fan tushunchasini yaxshiroq tushunishga yordam beradi
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {form.description.length}/500
                                    </p>
                                </div>
                            </div>

                            {/* Preview Card */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Ko'rinish</h4>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                                        1
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-gray-900">
                                            {form.name || "Fan nomi"}
                                        </h5>
                                        {form.description && (
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                {form.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                <button
                                    onClick={closeModal}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!form.name.trim()}
                                    className={`
                    px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold 
                    rounded-xl transition shadow-lg
                    ${!form.name.trim()
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:from-blue-700 hover:to-indigo-700'
                                    }
                  `}
                                >
                                    {editId ? "Saqlash" : "Qo'shish"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <FiTrash2 className="text-red-600 text-2xl" />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Fanni O'chirish
                            </h3>
                            <p className="text-gray-600 mb-6">
                                <span className="font-semibold text-red-600">{confirmDelete.name}</span> fanini
                                o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
                            </p>

                            <div className="space-y-3">
                                <p className="text-sm text-gray-500">
                                    ⚠️ Bu fanga biriktirilgan barcha kitoblar o'chirilmaydi,
                                    lekin ular ushbu fansiz qoladi.
                                </p>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    onClick={() => {
                                        handleDelete(confirmDelete.id, confirmDelete.name);
                                        setConfirmDelete(null);
                                    }}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition shadow-lg"
                                >
                                    O'chirish
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Styles */}
            <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
        </div>
    );
};

export default AdminSubject;