import React, { useEffect, useState, useCallback } from "react";
import {
    FiBook,
    FiEdit2,
    FiTrash2,
    FiPlus,
    FiSearch,
    FiFilter,
    FiDownload,
    FiEye,
    FiX,
    FiUpload,
    FiCopy,
    FiImage,
    FiFileText,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
    FiClock,
    FiRefreshCw,
    FiPrinter,
    FiGrid
} from "react-icons/fi";
import ApiCall from "../config";
import Sidebar from "./Sidebar";
import { Link } from "react-router-dom";
import Select from "react-select";
import debounce from 'lodash/debounce';

const AdminBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState({ pdf: 0, image: 0 });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Filter state
    const [filters, setFilters] = useState({
        title: "",
        author: "",
        publisher: "",
        subjectId: null
    });
    const [subjects, setSubjects] = useState([]);

    // Modal states
    const [openModal, setOpenModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [libraryModalOpen, setLibraryModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [libraryCount, setLibraryCount] = useState(0);

    // View mode
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

    const [form, setForm] = useState({
        name: "",
        description: "",
        author: "",
        publisher: "",
        genre: "",
        path: "",
        subjectId: "",
        pdfId: null,
        imageId: null,
    });

    /* =========================
       LOAD DATA WITH PAGINATION
    ========================= */
    useEffect(() => {
        loadSubjects();
    }, []);

    useEffect(() => {
        loadBooks();
    }, [currentPage, pageSize, filters]);

    const loadBooks = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                title: filters.title,
                author: filters.author,
                publisher: filters.publisher,
                subjectId: filters.subjectId
            };

            // Remove empty parameters
            Object.keys(params).forEach(key => {
                if (params[key] === "" || params[key] === null) {
                    delete params[key];
                }
            });

            const res = await ApiCall("/api/v1/books", "GET", null, params);
            console.log("Books response:", res);

            if (!res?.error) {
                setBooks(res.data.content || []);
                setTotalPages(res.data.totalPages || 0);
                setTotalElements(res.data.totalElements || 0);
            }
        } catch (error) {
            console.error("Error loading books:", error);
            setBooks([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    const loadSubjects = async () => {
        try {
            const res = await ApiCall("/api/v1/subject", "GET");
            if (!res?.error) setSubjects(res.data);
        } catch (error) {
            console.error("Error loading subjects:", error);
        }
    };

    const subjectOptions = subjects.map(s => ({
        value: s.id,
        label: s.name
    }));

    /* =========================
       FILTER HANDLERS
    ========================= */
    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(0); // Reset to first page when filter changes
    };

    // Debounced search for better performance
    const debouncedSearch = useCallback(
        debounce((value, field) => {
            updateFilter(field, value);
        }, 500),
        []
    );

    const handleSearch = (e) => {
        e.preventDefault();
        loadBooks();
    };

    const clearFilters = () => {
        setFilters({
            title: "",
            author: "",
            publisher: "",
            subjectId: null
        });
        setCurrentPage(0);
    };

    /* =========================
       PAGINATION HANDLERS
    ========================= */
    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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

    /* =========================
       FILE UPLOAD WITH PROGRESS
    ========================= */
    const uploadFile = async (file, type) => {
        const subject = subjects.find(s => s.id == form.subjectId);

        if (!subject) {
            alert("Avval fan tanlang");
            return;
        }

        const safePrefix = subject.name
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "");

        const formData = new FormData();
        formData.append("photo", file);
        formData.append("prefix", "/" + safePrefix);

        setUploadProgress(prev => ({ ...prev, [type]: 0 }));

        const progressInterval = setInterval(() => {
            setUploadProgress(prev => ({
                ...prev,
                [type]: Math.min(prev[type] + 10, 90)
            }));
        }, 200);

        try {
            const res = await ApiCall(
                "/api/v1/file/upload",
                "POST",
                formData,
                null,
                true
            );

            clearInterval(progressInterval);
            setUploadProgress(prev => ({ ...prev, [type]: 100 }));

            setTimeout(() => {
                setUploadProgress(prev => ({ ...prev, [type]: 0 }));
            }, 1000);

            return res.data;
        } catch (error) {
            clearInterval(progressInterval);
            setUploadProgress(prev => ({ ...prev, [type]: 0 }));
            throw error;
        }
    };

    /* =========================
       FORM HANDLERS
    ========================= */
    const handleSubmit = async () => {
        if (!form.name || !form.subjectId || !form.pdfId) {
            alert("Name, Subject va PDF majburiy");
            return;
        }

        const payload = { ...form };

        try {
            if (editId) {
                await ApiCall(`/api/v1/books/${editId}`, "PUT", payload);
            } else {
                await ApiCall("/api/v1/books", "POST", payload);
            }

            closeModal();
            loadBooks();
        } catch (error) {
            console.error("Error saving book:", error);
        }
    };

    const closeModal = () => {
        setOpenModal(false);
        setEditId(null);
        setForm({
            name: "",
            description: "",
            author: "",
            publisher: "",
            genre: "",
            path: "",
            subjectId: "",
            pdfId: null,
            imageId: null,
        });
        setUploadProgress({ pdf: 0, image: 0 });
    };

    const handleEdit = (b) => {
        setEditId(b.id);
        setForm({
            name: b.name,
            description: b.description || "",
            author: b.author || "",
            publisher: b.publisher || "",
            genre: b.genre || "",
            path: b.path || "",
            subjectId: b.subject?.id,
            pdfId: b.pdf?.id || null,
            imageId: b.image?.id || null,
        });
        setOpenModal(true);
    };

    /* =========================
       OTHER FUNCTIONS
    ========================= */
    const copyLink = (bookId) => {
        const link = `https://library.bxu.uz/book/${bookId}`;
        navigator.clipboard.writeText(link)
            .then(() => {
                // Show toast notification
                const toast = document.createElement('div');
                toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in';
                toast.textContent = '✅ Havola nusxalandi!';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
            })
            .catch(() => {
                alert("❌ Nusxalashda xatolik");
            });
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`${name} kitobini o'chirmoqchimisiz?`)) return;
        try {
            await ApiCall(`/api/v1/books/${id}`, "DELETE");
            loadBooks();
        } catch (error) {
            console.error("Error deleting book:", error);
        }
    };

    const updateLibraryCount = async () => {
        try {
            await ApiCall(
                `/api/v1/books/library/${selectedBook.id}/${libraryCount}`,
                "PUT"
            );
            setLibraryModalOpen(false);
            loadBooks();
        } catch (e) {
            console.error(e);
            alert("Saqlashda xatolik");
        }
    };

    const downloadReport = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch('/api/v1/books/hisobot', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'books_report.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading report:", error);
            alert("Hisobot yuklab olishda xatolik");
        }
    };

    /* =========================
       STATISTICS
    ========================= */
    const getStats = () => {
        const totalBooks = totalElements;
        const pdfBooks = books.filter(b => b.pdf?.id).length;
        const imageBooks = books.filter(b => b.image?.id).length;
        const libraryBooks = books.filter(b => b.isHaveLibrary).length;

        return { totalBooks, pdfBooks, imageBooks, libraryBooks };
    };

    const stats = getStats();

    /* =========================
       RENDER FUNCTIONS
    ========================= */
    const renderTable = () => (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                        <th className="py-4 px-2 text-left text-gray-700 font-semibold"></th>
                        <th className="py-4 px-2 text-left text-gray-700 font-semibold">Kitob nomi</th>
                        <th className="py-4 px-2 text-left text-gray-700 font-semibold">
                            Kutubxona
                        </th>
                        <th className="py-4 px-2 text-left text-gray-700 font-semibold">Muallif</th>
                        <th className="py-4 px-2 text-left text-gray-700 font-semibold">Fan</th>
                        <th className="py-4 px-2 text-left text-gray-700 font-semibold">Nashriyot</th>
                        <th className="py-4 px-2 text-left text-gray-700 font-semibold">Havola</th>
                        <th className="py-4 px-2 text-left text-gray-700 font-semibold">Amallar</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {books.map((book, index) => (
                        <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-2">
                                <div>
                                    <div className="font-medium text-gray-900">{index+1}</div>

                                </div>
                            </td>
                            <td className="py-4 px-2">
                                <div>
                                    <div className="font-medium text-gray-900">{book.name}</div>
                                    <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                                        {book.description || "Tavsif yo'q"}
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-2">
                                <button
                                    onClick={() => {
                                        setSelectedBook(book);
                                        setLibraryCount(book.libraryCount || 0);
                                        setLibraryModalOpen(true);
                                    }}
                                    className={`
                                            px-3 py-1 rounded-full text-sm font-semibold
                                            ${book.isHaveLibrary
                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                        : "bg-red-100 text-red-700 hover:bg-red-200"}
                                        `}
                                >
                                    {book.isHaveLibrary ? book.libraryCount : "Yo'q"}
                                </button>
                            </td>

                            <td className="py-4 px-2">
                                <div className="font-medium text-gray-900">{book.author || "Noma'lum"}</div>
                            </td>
                            <td className="py-4 px-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                                        {book.subject?.name || "Fan tanlanmagan"}
                                    </span>
                            </td>
                            <td className="py-4 px-2">
                                <div className="text-gray-700">{book.publisher || "Noma'lum"}</div>
                            </td>
                            <td className="py-4 px-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => copyLink(book.id)}
                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                                        title="Havolani nusxalash"
                                    >
                                        <FiCopy />
                                    </button>
                                    <span className="text-xs text-gray-500 truncate max-w-xs">
                                            .../{book.id}
                                        </span>
                                </div>
                            </td>
                            <td className="py-4 px-2">
                                <div className="flex items-center gap-4">
                                    <Link
                                        to={`/book/${book?.id}`}
                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                                        title="Ko'rish"
                                    >
                                        <FiEye />
                                    </Link>
                                    {/*<button*/}
                                    {/*    onClick={() => handleEdit(book)}*/}
                                    {/*    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition"*/}
                                    {/*    title="Tahrirlash"*/}
                                    {/*>*/}
                                    {/*    <FiEdit2 />*/}
                                    {/*</button>*/}
                                    <button
                                        onClick={() => handleDelete(book.id, book.name)}
                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                                        title="O'chirish"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {books.length === 0 && (
                <div className="text-center py-12">
                    <FiBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Kitoblar topilmadi</h3>
                    <p className="text-gray-600 mt-2">
                        {Object.values(filters).some(f => f)
                            ? "Qidiruv natijasi bo'yicha kitob topilmadi"
                            : "Hozircha kitoblar mavjud emas"}
                    </p>
                </div>
            )}
        </div>
    );

    const renderGrid = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
                <div key={book.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg line-clamp-2">{book.name}</h3>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {book.description || "Tavsif yo'q"}
                                </p>
                            </div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 ml-2">
                                {book.subject?.name || "Fan"}
                            </span>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center text-gray-700">
                                <span className="font-medium w-20">Muallif:</span>
                                <span className="ml-2">{book.author || "Noma'lum"}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                                <span className="font-medium w-20">Nashriyot:</span>
                                <span className="ml-2">{book.publisher || "Noma'lum"}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    setSelectedBook(book);
                                    setLibraryCount(book.libraryCount || 0);
                                    setLibraryModalOpen(true);
                                }}
                                className={`
                                    w-full px-3 py-2 rounded-lg text-sm font-semibold mb-2
                                    ${book.isHaveLibrary
                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                    : "bg-red-100 text-red-700 hover:bg-red-200"}
                                `}
                            >
                                {book.isHaveLibrary ? `Kutubxonada: ${book.libraryCount}` : "Kutubxonada yo'q"}
                            </button>

                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => copyLink(book.id)}
                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                                        title="Havolani nusxalash"
                                    >
                                        <FiCopy className="w-4 h-4" />
                                    </button>
                                    <Link
                                        to={`/book/${book?.id}`}
                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                                        title="Ko'rish"
                                    >
                                        <FiEye className="w-4 h-4" />
                                    </Link>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/*<button*/}
                                    {/*    onClick={() => handleEdit(book)}*/}
                                    {/*    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition"*/}
                                    {/*    title="Tahrirlash"*/}
                                    {/*>*/}
                                    {/*    <FiEdit2 className="w-4 h-4" />*/}
                                    {/*</button>*/}
                                    <button
                                        onClick={() => handleDelete(book.id, book.name)}
                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
                                        title="O'chirish"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const hasActiveFilters = Object.values(filters).some(f => f !== "" && f !== null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Sidebar />

            <div className="lg:ml-72">
                <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Kitoblar Boshqaruvi</h1>
                                <p className="text-gray-600 mt-2">Barcha elektron kitoblar va resurslar</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setOpenModal(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    <FiPlus className="text-xl" />
                                    Yangi Kitob
                                </button>
                                <button
                                    onClick={downloadReport}
                                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                                >
                                    <FiPrinter className="text-lg" />
                                    Hisobot
                                </button>
                            </div>
                        </div>


                        {/* Filters */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                                <div className="flex-1">
                                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1 relative">
                                            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Kitob nomi bo'yicha qidirish..."
                                                value={filters.title}
                                                onChange={(e) => {
                                                    setFilters(prev => ({ ...prev, title: e.target.value }));
                                                    debouncedSearch(e.target.value, 'title');
                                                }}
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                    </form>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setViewMode('table')}
                                            className={`p-3 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600'}`}
                                            title="Jadval ko'rinishi"
                                        >
                                            <FiGrid />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-3 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-600'}`}
                                            title="Guruh ko'rinishi"
                                        >
                                            <FiGrid className="rotate-45" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={loadBooks}
                                        className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition"
                                        title="Yangilash"
                                    >
                                        <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Muallif
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Muallif bo'yicha qidirish..."
                                        value={filters.author}
                                        onChange={(e) => updateFilter('author', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nashriyot
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nashriyot bo'yicha qidirish..."
                                        value={filters.publisher}
                                        onChange={(e) => updateFilter('publisher', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fan
                                    </label>
                                    <Select
                                        options={subjectOptions}
                                        value={subjectOptions.find(o => o.value === filters.subjectId) || null}
                                        onChange={(option) => updateFilter('subjectId', option?.value || null)}
                                        isSearchable
                                        isClearable
                                        placeholder="Barcha fanlar"
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        styles={{
                                            control: (base) => ({
                                                ...base,
                                                borderRadius: "0.75rem",
                                                backgroundColor: "#f9fafb",
                                                borderColor: "#e5e7eb",
                                                minHeight: "48px",
                                            }),
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Filters Actions */}
                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-4">
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <FiX />
                                            Filtrlarni tozalash
                                        </button>
                                    )}
                                    <div className="text-sm text-gray-600">
                                        {hasActiveFilters && "Faol filtrlarni qo'llash"}
                                    </div>
                                </div>

                                {/* Items per page selector */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Har sahifada:</span>
                                    <div className="flex gap-1">
                                        {[10, 20, 50, 100].map(size => (
                                            <button
                                                key={size}
                                                onClick={() => {
                                                    setPageSize(size);
                                                    setCurrentPage(0);
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                                    pageSize === size
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <>
                                {/* Books Content */}
                                {viewMode === 'table' ? renderTable() : renderGrid()}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-gray-200">
                                        {/* Page info */}
                                        <div className="text-sm text-gray-600">
                                            Jami {totalElements} ta kitobdan {Math.min((currentPage * pageSize) + 1, totalElements)}-{Math.min((currentPage + 1) * pageSize, totalElements)} tasi ko'rsatilmoqda
                                        </div>

                                        {/* Pagination buttons */}
                                        <div className="flex items-center gap-2">
                                            {/* First page */}
                                            <button
                                                onClick={() => handlePageChange(0)}
                                                disabled={currentPage === 0}
                                                className={`p-2 rounded-lg ${currentPage === 0
                                                    ? 'text-gray-400 cursor-not-allowed'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                                title="Birinchi sahifa"
                                            >
                                                <FiChevronsLeft className="w-5 h-5" />
                                            </button>

                                            {/* Previous page */}
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 0}
                                                className={`p-2 rounded-lg ${currentPage === 0
                                                    ? 'text-gray-400 cursor-not-allowed'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                                title="Oldingi sahifa"
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

                                            {/* Next page */}
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages - 1}
                                                className={`p-2 rounded-lg ${currentPage === totalPages - 1
                                                    ? 'text-gray-400 cursor-not-allowed'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                                title="Keyingi sahifa"
                                            >
                                                <FiChevronRight className="w-5 h-5" />
                                            </button>

                                            {/* Last page */}
                                            <button
                                                onClick={() => handlePageChange(totalPages - 1)}
                                                disabled={currentPage === totalPages - 1}
                                                className={`p-2 rounded-lg ${currentPage === totalPages - 1
                                                    ? 'text-gray-400 cursor-not-allowed'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                                title="Oxirgi sahifa"
                                            >
                                                <FiChevronsRight className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Page selector */}
                                        <div className="text-sm text-gray-500">
                                            Sahifa {currentPage + 1} / {totalPages}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Book Modal */}
            {openModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editId ? "Kitobni Tahrirlash" : "Yangi Kitob Qo'shish"}
                                </h2>
                                <p className="text-gray-600 text-sm mt-1">
                                    Kitob ma'lumotlarini to'ldiring
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
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Kitob nomi *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Kitob nomini kiriting"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Muallif
                                    </label>
                                    <input
                                        type="text"
                                        value={form.author}
                                        onChange={(e) => setForm({ ...form, author: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Muallif ismi"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nashriyot
                                    </label>
                                    <input
                                        type="text"
                                        value={form.publisher}
                                        onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Nashriyot nomi"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Janr
                                    </label>
                                    <input
                                        type="text"
                                        value={form.genre}
                                        onChange={(e) => setForm({ ...form, genre: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Kitob janri"
                                    />
                                </div>
                            </div>

                            {/* Subject Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fan *
                                </label>
                                <Select
                                    options={subjectOptions}
                                    value={subjectOptions.find(o => o.value === form.subjectId) || null}
                                    onChange={(option) =>
                                        setForm({ ...form, subjectId: option ? option.value : "" })
                                    }
                                    isSearchable
                                    placeholder="Fan tanlang"
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            borderRadius: "0.75rem",
                                            backgroundColor: "#f9fafb",
                                            borderColor: "#d1d5db",
                                            minHeight: "48px",
                                        }),
                                    }}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tavsif
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                    placeholder="Kitob haqida qisqacha tavsif"
                                />
                            </div>

                            {/* File Uploads */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* PDF Upload */}
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-blue-500 transition">
                                    <label className="block mb-3">
                                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                                            <FiFileText className="text-blue-600" />
                                            PDF Fayl *
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Kitobning PDF shakli</p>
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={async (e) => {
                                            const id = await uploadFile(e.target.files[0], "pdf");
                                            setForm({ ...form, pdfId: id });
                                        }}
                                    />
                                    {uploadProgress.pdf > 0 && (
                                        <div className="mt-2">
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                                                    style={{ width: `${uploadProgress.pdf}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 text-center">
                                                Yuklanmoqda... {uploadProgress.pdf}%
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Image Upload */}
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-green-500 transition">
                                    <label className="block mb-3">
                                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                                            <FiImage className="text-green-600" />
                                            Rasm (Ixtiyoriy)
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Kitob muqovasi</p>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const id = await uploadFile(e.target.files[0], "image");
                                            setForm({ ...form, imageId: id });
                                        }}
                                    />
                                    {uploadProgress.image > 0 && (
                                        <div className="mt-2">
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
                                                    style={{ width: `${uploadProgress.image}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 text-center">
                                                Yuklanmoqda... {uploadProgress.image}%
                                            </p>
                                        </div>
                                    )}
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
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
                                >
                                    {editId ? "Saqlash" : "Qo'shish"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {libraryModalOpen && selectedBook && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">
                            Kutubxona sonini o'zgartirish
                        </h2>
                        <div className="mb-6">
                            <p className="text-gray-600 mb-2">
                                Kitob: <span className="font-semibold">{selectedBook.name}</span>
                            </p>
                            <p className="text-sm text-gray-500">
                                Kutubxonada mavjud sonni kiriting
                            </p>
                        </div>
                        <input
                            type="number"
                            min="0"
                            value={libraryCount}
                            onChange={(e) => setLibraryCount(Number(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-6"
                            placeholder="Kitoblar soni"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setLibraryModalOpen(false)}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                            >
                                Bekor qilish
                            </button>
                            <button
                                onClick={updateLibraryCount}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition"
                            >
                                Saqlash
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slideIn 0.3s ease-out;
                }
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

export default AdminBooks;