import React, { useEffect, useState } from "react";
import {
    FiUsers,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiSearch,
    FiFilter,
    FiX,
    FiHash,
    FiBook,
    FiTrendingUp,
    FiBookOpen,
    FiCode
} from "react-icons/fi";
import ApiCall from "../config";
import Sidebar from "./Sidebar";

const AdminFaculty = () => {
    const [faculties, setFaculties] = useState([]);
    const [filteredFaculties, setFilteredFaculties] = useState([]);
    const [educationTypes, setEducationTypes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        bachelor: 0,
        master: 0
    });

    const [openModal, setOpenModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const [form, setForm] = useState({
        code: "",
        name: "",
        educationTypeId: "",
    });

    /* =========================
       LOAD DATA
    ========================= */
    const loadFaculties = async () => {
        setLoading(true);
        try {
            const res = await ApiCall("/api/v1/faculty", "GET");
            if (!res?.error) {
                setFaculties(res.data);
                calculateStats(res.data);
            }
        } catch (error) {
            console.error("Error loading faculties:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadEducationTypes = async () => {
        try {
            const res = await ApiCall("/api/v1/type", "GET");
            if (!res?.error) setEducationTypes(res.data);
        } catch (error) {
            console.error("Error loading education types:", error);
        }
    };

    useEffect(() => {
        loadFaculties();
        loadEducationTypes();
    }, []);

    useEffect(() => {
        filterFaculties();
    }, [faculties, searchTerm, selectedType]);

    const calculateStats = (data) => {
        const total = data.length;
        const bachelor = data.filter(f =>
            educationTypes.find(e => e.id === f.educationTypeId)?.name === "Bakalavr"
        ).length;
        const master = data.filter(f =>
            educationTypes.find(e => e.id === f.educationTypeId)?.name === "Magistr"
        ).length;

        setStats({ total, bachelor, master });
    };

    const filterFaculties = () => {
        let filtered = faculties;

        if (searchTerm) {
            filtered = filtered.filter(faculty =>
                faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                faculty.code.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedType) {
            filtered = filtered.filter(faculty =>
                faculty.educationTypeId === selectedType
            );
        }

        setFilteredFaculties(filtered);
    };

    /* =========================
       FORM HELPERS
    ========================= */
    const resetForm = () => {
        setForm({
            code: "",
            name: "",
            educationTypeId: "",
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
        if (!form.code.trim() || !form.name.trim() || !form.educationTypeId) {
            alert("Kod, Nomi va Ta'lim turi majburiy");
            return;
        }

        try {
            if (editId) {
                await ApiCall(`/api/v1/faculty/${editId}`, "PUT", form);
            } else {
                await ApiCall("/api/v1/faculty", "POST", form);
            }

            closeModal();
            loadFaculties();
        } catch (error) {
            console.error("Error saving faculty:", error);
        }
    };

    /* =========================
       EDIT
    ========================= */
    const handleEdit = (faculty) => {
        setEditId(faculty.id);
        setForm({
            code: faculty.code,
            name: faculty.name,
            educationTypeId: faculty.educationTypeId,
        });
        setOpenModal(true);
    };

    /* =========================
       DELETE
    ========================= */
    const handleDelete = async (id, name) => {
        if (!window.confirm(`${name} yo'nalishini o'chirmoqchimisiz?`)) return;
        try {
            await ApiCall(`/api/v1/faculty/${id}`, "DELETE");
            loadFaculties();
        } catch (error) {
            console.error("Error deleting faculty:", error);
        }
    };

    const getEducationTypeName = (id) => {
        const type = educationTypes.find(e => e.id === id);
        return type ? type.name : "Noma'lum";
    };

    const getEducationTypeColor = (id) => {
        const type = educationTypes.find(e => e.id === id);
        if (!type) return "gray";

        return type.name === "Bakalavr" ? "blue" :
            type.name === "Magistr" ? "purple" : "gray";
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
                                <h1 className="text-3xl font-bold text-gray-900">Yo'nalishlar Boshqaruvi</h1>
                                <p className="text-gray-600 mt-2">Barcha fakultetlar va o'quv yo'nalishlari</p>
                            </div>
                            <button
                                onClick={() => setOpenModal(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <FiPlus className="text-xl" />
                                Yangi Yo'nalish
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Jami Yo'nalishlar</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-xl">
                                        <FiUsers className="text-blue-600 text-2xl" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Bakalavr</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.bachelor}</p>
                                    </div>
                                    <div className="p-3 bg-green-100 rounded-xl">
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Magistr</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.master}</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 rounded-xl">
                                        <FiTrendingUp className="text-purple-600 text-2xl" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Yo'nalish nomi yoki kodi bo'yicha qidirish..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div className="relative">
                                    <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
                                    >
                                        <option value="">Barcha ta'lim turlari</option>
                                        {educationTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {(searchTerm || selectedType) && (
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={() => {
                                            setSearchTerm("");
                                            setSelectedType("");
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                        <FiX className="w-4 h-4" />
                                        Filtrlarni tozalash
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Faculties List */}
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                {filteredFaculties.length === 0 ? (
                                    <div className="text-center py-16">
                                        <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900">Yo'nalishlar topilmadi</h3>
                                        <p className="text-gray-600 mt-2">
                                            {searchTerm || selectedType
                                                ? "Qidiruv natijasi bo'yicha yo'nalish topilmadi"
                                                : "Hozircha yo'nalishlar mavjud emas"}
                                        </p>
                                        {!searchTerm && !selectedType && (
                                            <button
                                                onClick={() => setOpenModal(true)}
                                                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition"
                                            >
                                                <FiPlus />
                                                Birinchi Yo'nalish Qo'shing
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                        {filteredFaculties.map((faculty) => (
                                            <div
                                                key={faculty.id}
                                                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                                            >
                                                <div className="p-6">
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                                            <FiCode className="text-white text-xl" />
                                                        </div>
                                                        <span className={`
                              inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                              ${getEducationTypeColor(faculty.educationTypeId) === "blue"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : getEducationTypeColor(faculty.educationTypeId) === "purple"
                                                                ? "bg-purple-100 text-purple-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }
                            `}>
                              {getEducationTypeName(faculty.educationTypeId)}
                            </span>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="space-y-3">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                                                                {faculty.name}
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <FiHash className="text-gray-400" />
                                                                <span className="text-sm text-gray-600">{faculty.code}</span>
                                                            </div>
                                                        </div>

                                                        {/* Stats */}
                                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                            <div className="text-center">
                                                                <FiBook className="text-blue-500 mx-auto mb-1" />
                                                                <span className="text-xs text-gray-600">Kitoblar</span>
                                                            </div>
                                                            <div className="text-center">
                                                                <FiUsers className="text-green-500 mx-auto mb-1" />
                                                                <span className="text-xs text-gray-600">Talabalar</span>
                                                            </div>
                                                            <div className="text-center">
                                                                <FiBookOpen className="text-purple-500 mx-auto mb-1" />
                                                                <span className="text-xs text-gray-600">Fanlar</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                                                        <button
                                                            onClick={() => handleEdit(faculty)}
                                                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                                                            title="Tahrirlash"
                                                        >
                                                            <FiEdit2 />
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmDelete(faculty)}
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
                                {filteredFaculties.length > 0 && (
                                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">{filteredFaculties.length}</span> ta yo'nalish topildi
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {searchTerm && (
                                                    <button
                                                        onClick={() => setSearchTerm("")}
                                                        className="text-sm text-blue-600 hover:text-blue-800"
                                                    >
                                                        Qidiruvni tozalash
                                                    </button>
                                                )}
                                                <div className="text-xs text-gray-500">
                                                    Sahifa: 1/{Math.ceil(filteredFaculties.length / 9)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Faculty Modal */}
            {openModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editId ? "Yo'nalishni Tahrirlash" : "Yangi Yo'nalish Qo'shish"}
                                </h2>
                                <p className="text-gray-600 text-sm mt-1">
                                    Yo'nalish ma'lumotlarini to'ldiring
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
                            {/* Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Yo'nalish kodi *
                                </label>
                                <div className="relative">
                                    <FiHash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={form.code}
                                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Masalan: KI-101"
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Kodingiz fakultet yoki kafedra kodiga mos kelishi kerak
                                </p>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Yo'nalish nomi *
                                </label>
                                <div className="relative">
                                    <FiBook className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Masalan: Kompyuter injiniringi"
                                    />
                                </div>
                            </div>

                            {/* Education Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ta'lim turi *
                                </label>
                                <div className="relative">
                                    <select
                                        value={form.educationTypeId}
                                        onChange={(e) => setForm({ ...form, educationTypeId: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
                                    >
                                        <option value="">Ta'lim turini tanlang</option>
                                        {educationTypes.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Preview Card */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Ko'rinish</h4>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                        <FiCode className="text-white" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h5 className="font-medium text-gray-900">
                                                {form.name || "Yo'nalish nomi"}
                                            </h5>
                                            {form.educationTypeId && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {educationTypes.find(e => e.id === form.educationTypeId)?.name || "Tur"}
                        </span>
                                            )}
                                        </div>
                                        {form.code && (
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <FiHash className="w-3 h-3" />
                                                {form.code}
                                            </div>
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
                                    disabled={!form.code.trim() || !form.name.trim() || !form.educationTypeId}
                                    className={`
                    px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold 
                    rounded-xl transition shadow-lg
                    ${!form.code.trim() || !form.name.trim() || !form.educationTypeId
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
                                Yo'nalishni O'chirish
                            </h3>
                            <p className="text-gray-600 mb-6">
                                <span className="font-semibold text-red-600">{confirmDelete.name}</span> yo'nalishini
                                o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
                            </p>

                            <div className="space-y-3 mb-6 p-4 bg-yellow-50 rounded-xl">
                                <p className="text-sm text-yellow-800 text-left">
                                    ⚠️ <strong>Diqqat:</strong> Ushbu yo'nalishga biriktirilgan barcha fanlar va kitoblar o'chirilmaydi,
                                    lekin ular bu yo'nalishsiz qoladi.
                                </p>
                                <div className="text-left text-sm text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <FiHash className="text-gray-400" />
                                        <span>Kod: {confirmDelete.code}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span>Ta'lim turi: {getEducationTypeName(confirmDelete.educationTypeId)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
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
        </div>
    );
};

export default AdminFaculty;