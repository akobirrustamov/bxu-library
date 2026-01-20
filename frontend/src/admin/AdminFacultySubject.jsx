import React, { useEffect, useState } from "react";
import {
    FiLink,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiSearch,
    FiFilter,
    FiX,
    FiBook,
    FiUsers,
    FiBookOpen,
    FiChevronRight,
    FiChevronDown,
    FiExternalLink,
    FiHash,
    FiCheck
} from "react-icons/fi";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import ApiCall from "../config";
import Sidebar from "./Sidebar";

const animatedComponents = makeAnimated();

const AdminFacultySubject = () => {
    const [facultySubjects, setFacultySubjects] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedSubject, setExpandedSubject] = useState(null);

    const [openModal, setOpenModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const [form, setForm] = useState({
        facultyId: "",
        subjectId: "",
    });

    /* =========================
       LOAD INITIAL DATA
    ========================= */
    useEffect(() => {
        loadFaculties();
        loadSubjects();
    }, []);

    /* =========================
       LOAD FACULTIES
    ========================= */
    const loadFaculties = async () => {
        try {
            const res = await ApiCall("/api/v1/faculty", "GET");
            if (!res?.error) setFaculties(res.data);
        } catch (error) {
            console.error("Error loading faculties:", error);
        }
    };

    /* =========================
       LOAD SUBJECTS
    ========================= */
    const loadSubjects = async () => {
        try {
            const res = await ApiCall("/api/v1/subject", "GET");
            if (!res?.error) setSubjects(res.data);
        } catch (error) {
            console.error("Error loading subjects:", error);
        }
    };

    /* =========================
       LOAD FACULTY SUBJECTS
    ========================= */
    const loadFacultySubjects = async (facultyId) => {
        if (!facultyId) {
            setFacultySubjects([]);
            return;
        }

        setLoading(true);
        try {
            const res = await ApiCall(`/api/v1/faculty-subject/by-faculty/${facultyId}`, "GET");
            if (!res?.error) setFacultySubjects(res.data);
        } catch (error) {
            console.error("Error loading faculty subjects:", error);
        } finally {
            setLoading(false);
        }
    };

    /* =========================
       FORM HELPERS
    ========================= */
    const resetForm = () => {
        setForm({
            facultyId: "",
            subjectId: "",
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
        if (!form.facultyId || !form.subjectId) {
            alert("Fakultet va Fan tanlanishi shart");
            return;
        }

        try {
            if (editId) {
                await ApiCall(`/api/v1/faculty-subject/${editId}`, "PUT", form);
            } else {
                await ApiCall("/api/v1/faculty-subject", "POST", form);
            }

            closeModal();
            loadFacultySubjects(selectedFaculty);
        } catch (error) {
            console.error("Error saving assignment:", error);
        }
    };

    /* =========================
       EDIT
    ========================= */
    const handleEdit = (fs) => {
        setEditId(fs.id);
        setForm({
            facultyId: fs.facultyId,
            subjectId: fs.subjectId,
        });
        setOpenModal(true);
    };

    /* =========================
       DELETE
    ========================= */
    const handleDelete = async (id, facultyName, subjectName) => {
        if (!window.confirm(`${subjectName} fanni ${facultyName} fakultetidan o'chirmoqchimisiz?`)) return;
        try {
            await ApiCall(`/api/v1/faculty-subject/${id}`, "DELETE");
            loadFacultySubjects(selectedFaculty);
        } catch (error) {
            console.error("Error deleting assignment:", error);
        }
    };

    /* =========================
       PREPARE SELECT OPTIONS
    ========================= */
    const facultyOptions = faculties.map(f => ({
        value: f.id,
        label: `${f.name} (${f.code})`,
        ...f
    }));

    const subjectOptions = subjects.map(s => ({
        value: s.id,
        label: s.name,
        description: s.description,
        ...s
    }));

    // Filter subjects that are not already assigned to the selected faculty
    const availableSubjectOptions = subjectOptions.filter(s =>
        !facultySubjects.some(fs =>
            fs.subjectId === s.value && fs.facultyId === Number(selectedFaculty)
        )
    );

    /* =========================
       STATS
    ========================= */
    const getStats = () => {
        const selectedFacultyData = faculties.find(f => f.id === Number(selectedFaculty));
        const totalSubjects = facultySubjects.length;
        const totalBooks = facultySubjects.reduce((acc, fs) => acc + (fs.bookCount || 0), 0);

        return {
            facultyName: selectedFacultyData?.name || "",
            facultyCode: selectedFacultyData?.code || "",
            totalSubjects,
            totalBooks,
            availableSubjects: subjects.length,
            assignedSubjects: new Set(facultySubjects.map(fs => fs.subjectId)).size
        };
    };

    const stats = getStats();
    const filteredSubjects = facultySubjects.filter(fs =>
        fs.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fs.facultyName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Custom styles for react-select
    const customStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: '52px',
            backgroundColor: '#f9fafb',
            borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
            borderRadius: '12px',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#3b82f6' : '#9ca3af'
            },
            paddingLeft: '12px'
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#dbeafe' : state.isFocused ? '#eff6ff' : 'white',
            color: state.isSelected ? '#1e40af' : '#1f2937',
            padding: '12px 16px',
            fontSize: '14px',
            '&:active': {
                backgroundColor: '#dbeafe'
            }
        }),
        menuPortal: (base) => ({
            ...base,
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            zIndex: 9999
        }),
        menu: (base) => ({
            ...base,
            padding: '8px',
            maxHeight: '300px'
        }),
        placeholder: (base) => ({
            ...base,
            color: '#6b7280',
            fontSize: '14px'
        }),
        singleValue: (base) => ({
            ...base,
            color: '#1f2937',
            fontSize: '14px',
            fontWeight: '500'
        }),
        indicatorSeparator: () => ({
            display: 'none'
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            color: state.isFocused ? '#3b82f6' : '#9ca3af',
            padding: '8px',
            transition: 'transform 0.2s',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'none'
        }),
        clearIndicator: (base) => ({
            ...base,
            padding: '8px',
            color: '#9ca3af',
            '&:hover': {
                color: '#ef4444'
            }
        })
    };

    // Custom option component with description
    const SubjectOption = ({ innerRef, innerProps, data, isSelected, isFocused }) => (
        <div
            ref={innerRef}
            {...innerProps}
            className={`
        px-4 py-3 cursor-pointer transition
        ${isSelected ? 'bg-blue-50' : ''}
        ${isFocused && !isSelected ? 'bg-gray-50' : ''}
      `}
        >
            <div className="font-medium text-gray-900">{data.label}</div>
            {data.description && (
                <div className="text-xs text-gray-500 mt-1 truncate">
                    {data.description}
                </div>
            )}
        </div>
    );

    // Custom faculty option component
    const FacultyOption = ({ innerRef, innerProps, data, isSelected, isFocused }) => (
        <div
            ref={innerRef}
            {...innerProps}
            className={`
        px-4 py-3 cursor-pointer transition
        ${isSelected ? 'bg-blue-50' : ''}
        ${isFocused && !isSelected ? 'bg-gray-50' : ''}
      `}
        >
            <div className="font-medium text-gray-900">{data.name}</div>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">Kod: {data.code}</span>
                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
          {data.educationTypeName || "Ta'lim turi"}
        </span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Sidebar />

            <div className="lg:ml-72">
                <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Fan Biriktirish Boshqaruvi</h1>
                                <p className="text-gray-600 mt-2">Fakultetlarga fanlarni biriktirish va boshqarish</p>
                            </div>
                            <button
                                onClick={() => {
                                    setForm({ facultyId: selectedFaculty, subjectId: "" });
                                    setOpenModal(true);
                                }}
                                disabled={!selectedFaculty}
                                className={`
                  flex items-center gap-2 px-6 py-3 
                  ${selectedFaculty
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                    : 'bg-gray-300 cursor-not-allowed'
                                } 
                  text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl
                `}
                            >
                                <FiLink className="text-xl" />
                                Yangi Biriktirish
                            </button>
                        </div>

                        {/* Faculty Selection with Searchable Select */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Fakultetni tanlang
                            </label>
                            <Select
                                options={facultyOptions}
                                value={facultyOptions.find(f => f.value === Number(selectedFaculty))}
                                onChange={(selected) => {
                                    setSelectedFaculty(selected ? selected.value.toString() : "");
                                    loadFacultySubjects(selected ? selected.value : "");
                                    setSearchTerm("");
                                }}
                                placeholder="Fakultet nomi yoki kodi bo'yicha qidiring..."
                                isSearchable
                                isClearable
                                styles={customStyles}
                                components={{ Option: FacultyOption }}
                                noOptionsMessage={() => "Fakultet topilmadi"}
                                loadingMessage={() => "Yuklanmoqda..."}
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>

                        {/* Stats Cards */}
                        {selectedFaculty && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Fakultet</p>
                                            <p className="text-lg font-bold text-gray-900 mt-1 truncate">
                                                {stats.facultyName}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-blue-100 rounded-xl">
                                            <FiUsers className="text-blue-600 text-xl" />
                                        </div>
                                    </div>
                                    <div className="mt-4 text-xs text-gray-500">
                                        Kod: {stats.facultyCode}
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Biriktirilgan fanlar</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {stats.totalSubjects}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-green-100 rounded-xl">
                                            <FiBook className="text-green-600 text-xl" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Jami kitoblar</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {stats.totalBooks}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-purple-100 rounded-xl">
                                            <FiBookOpen className="text-purple-600 text-xl" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Mavjud fanlar</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                                {stats.availableSubjects}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-orange-100 rounded-xl">
                                            <FiCheck className="text-orange-600 text-xl" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Search and Content */}
                        {selectedFaculty && (
                            <>
                                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                                    <div className="relative">
                                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Fan nomi bo'yicha qidirish..."
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
                                                <FiLink className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {searchTerm ? "Qidiruv natijasi topilmadi" : "Fanlar biriktirilmagan"}
                                                </h3>
                                                <p className="text-gray-600 mt-2">
                                                    {searchTerm
                                                        ? "Boshqa qidiruv so'zini kiriting yoki qidiruvni tozalang"
                                                        : `${stats.facultyName} fakultetiga hali fanlar biriktirilmagan`
                                                    }
                                                </p>
                                                {!searchTerm && (
                                                    <button
                                                        onClick={() => {
                                                            setForm({ facultyId: selectedFaculty, subjectId: "" });
                                                            setOpenModal(true);
                                                        }}
                                                        className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition"
                                                    >
                                                        <FiPlus />
                                                        Birinchi Fanni Biriktiring
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-100">
                                                {filteredSubjects.map((fs, index) => (
                                                    <div key={fs.id} className="group">
                                                        <div className="p-6 hover:bg-gray-50 transition-colors">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-start gap-4 flex-1">
                                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                                                                        {index + 1}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-3">
                                                                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                                                                                {fs.subjectName}
                                                                            </h3>
                                                                            {fs.bookCount > 0 && (
                                                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                          <FiBook className="w-3 h-3 mr-1" />
                                                                                    {fs.bookCount} ta kitob
                                        </span>
                                                                            )}
                                                                        </div>

                                                                        <div className="flex items-center gap-2 mt-2">
                                      <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                                        <FiUsers className="w-4 h-4" />
                                          {fs.facultyName}
                                      </span>
                                                                            <span className="text-gray-400">•</span>
                                                                            <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                                        <FiHash className="w-4 h-4" />
                                        Fan ID: {fs.subjectId}
                                      </span>
                                                                        </div>

                                                                        {/* Expandable Details */}
                                                                        {fs.description && (
                                                                            <div className="mt-3">
                                                                                <button
                                                                                    onClick={() => setExpandedSubject(expandedSubject === fs.id ? null : fs.id)}
                                                                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                                                                >
                                                                                    {expandedSubject === fs.id ? (
                                                                                        <>
                                                                                            <FiChevronDown />
                                                                                            Tavsifni yashirish
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <FiChevronRight />
                                                                                            Tavsifni ko'rish
                                                                                        </>
                                                                                    )}
                                                                                </button>
                                                                                {expandedSubject === fs.id && (
                                                                                    <p className="mt-2 text-gray-600 text-sm pl-6 border-l-2 border-blue-200">
                                                                                        {fs.description}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => handleEdit(fs)}
                                                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                                                                        title="Tahrirlash"
                                                                    >
                                                                        <FiEdit2 />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setConfirmDelete(fs)}
                                                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                                                                        title="O'chirish"
                                                                    >
                                                                        <FiTrash2 />
                                                                    </button>
                                                                </div>
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
                                                        <span className="font-medium">{filteredSubjects.length}</span> ta biriktirilgan fan
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
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Assignment Modal with Searchable Select */}
            {openModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editId ? "Biriktirishni Tahrirlash" : "Yangi Fan Biriktirish"}
                                </h2>
                                <p className="text-gray-600 text-sm mt-1">
                                    Fakultetga yangi fan biriktiring
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
                            {/* Selected Faculty */}
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg">
                                        <FiUsers className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Tanlangan fakultet</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {faculties.find(f => f.id === Number(form.facultyId))?.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Kod: {faculties.find(f => f.id === Number(form.facultyId))?.code}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Subject Selection with Searchable Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fan tanlang *
                                </label>
                                <Select
                                    options={availableSubjectOptions}
                                    value={subjectOptions.find(s => s.value === Number(form.subjectId))}
                                    onChange={(selected) => setForm({ ...form, subjectId: selected ? selected.value : "" })}
                                    placeholder="Fan nomi bo'yicha qidirish..."
                                    isSearchable
                                    isClearable
                                    styles={customStyles}
                                    components={{
                                        Option: SubjectOption,
                                        ...animatedComponents
                                    }}
                                    noOptionsMessage={() => "Mavjud fan topilmadi"}
                                    loadingMessage={() => "Yuklanmoqda..."}
                                    className="react-select-container z-50"
                                    classNamePrefix="react-select"
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    maxMenuHeight={300}
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Faqat hozircha biriktirilmagan fanlar ko'rsatiladi
                                </p>
                            </div>

                            {/* Selected Subject Preview */}
                            {form.subjectId && (
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tanlangan fan</h4>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <FiBook className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-gray-900">
                                                {subjects.find(s => s.id === Number(form.subjectId))?.name}
                                            </h5>
                                            {subjects.find(s => s.id === Number(form.subjectId))?.description && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {subjects.find(s => s.id === Number(form.subjectId))?.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Available Subjects Count */}
                            <div className="text-center text-sm text-gray-500">
                                {faculties.find(f => f.id === Number(form.facultyId))?.name} fakultetiga
                                <span className="font-semibold text-blue-600 mx-1">
                  {availableSubjectOptions.length}
                </span>
                                ta mavjud fan qolgan
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
                                    disabled={!form.subjectId}
                                    className={`
                    px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold 
                    rounded-xl transition shadow-lg
                    ${!form.subjectId
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:from-blue-700 hover:to-indigo-700'
                                    }
                  `}
                                >
                                    {editId ? "Saqlash" : "Biriktirish"}
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
                                Biriktirishni O'chirish
                            </h3>
                            <p className="text-gray-600 mb-6">
                                <span className="font-semibold text-red-600">{confirmDelete.subjectName}</span> fanni
                                <span className="font-semibold mx-1">{confirmDelete.facultyName}</span>
                                fakultetidan o'chirmoqchimisiz?
                            </p>

                            <div className="space-y-3 mb-6 p-4 bg-yellow-50 rounded-xl">
                                <p className="text-sm text-yellow-800 text-left">
                                    ⚠️ <strong>Diqqat:</strong> Ushbu fanga biriktirilgan barcha kitoblar saqlanib qoladi,
                                    lekin ular ushbu fakultet bilan bog'lanmaydi.
                                </p>
                                {confirmDelete.bookCount > 0 && (
                                    <div className="text-left text-sm text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <FiBook className="text-gray-400" />
                                            <span>Ushbu fanga biriktirilgan kitoblar: {confirmDelete.bookCount} ta</span>
                                        </div>
                                    </div>
                                )}
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
                                        handleDelete(confirmDelete.id, confirmDelete.facultyName, confirmDelete.subjectName);
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

            {/* Add global styles for react-select */}
            <style jsx global>{`
        .react-select-container {
          position: relative;
        }
        .react-select__control {
          min-height: 52px !important;
        }
        .react-select__menu {
          z-index: 9999 !important;
        }
        .react-select__option {
          padding: 12px 16px !important;
        }
      `}</style>
        </div>
    );
};

export default AdminFacultySubject;