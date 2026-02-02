import React, { useEffect, useState } from "react";
import {
    FiBook,
    FiEdit2,
    FiTrash2,
    FiPlus,
    FiSearch,
    FiFilter,
    FiEye,
    FiX,
    FiCopy,
    FiImage,
    FiFileText,
    FiClock
} from "react-icons/fi";
import ApiCall from "../config";
import Sidebar from "./Sidebar";
import { Link } from "react-router-dom";
import Select from "react-select";

const AdminBooks = () => {
    /* =========================
       STATES
    ========================= */
    const [books, setBooks] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [page, setPage] = useState(0);
    const size = 20;
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [openModal, setOpenModal] = useState(false);
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        name: "",
        description: "",
        author: "",
        publisher: "",
        genre: "",
        subjectId: "",
        pdfId: null,
        imageId: null,
    });

    /* =========================
       LOAD DATA
    ========================= */
    useEffect(() => {
        loadBooks();
    }, [page, searchTerm, selectedSubject]);

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadBooks = async () => {
        setLoading(true);
        try {
            const res = await ApiCall("/api/v1/books", "GET", null, {
                page,
                size,
                title: searchTerm,
                author: searchTerm,
                publisher: searchTerm,
                subjectId: selectedSubject?.value || ""
            });

            if (!res?.error) {
                setBooks(res.data.content);
                setTotalPages(res.data.totalPages);
                setTotalElements(res.data.totalElements);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadSubjects = async () => {
        const res = await ApiCall("/api/v1/subject", "GET");
        if (!res?.error) setSubjects(res.data);
    };

    const subjectOptions = subjects?.map(s => ({
        value: s.id,
        label: s.name
    }));

    /* =========================
       CRUD
    ========================= */
    const handleEdit = (b) => {
        setEditId(b.id);
        setForm({
            name: b.name,
            description: b.description || "",
            author: b.author || "",
            publisher: b.publisher || "",
            genre: b.genre || "",
            subjectId: b.subject?.id || "",
            pdfId: b.pdf?.id || null,
            imageId: b.image?.id || null,
        });
        setOpenModal(true);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`${name} o‘chirilsinmi?`)) return;
        await ApiCall(`/api/v1/books/${id}`, "DELETE");
        loadBooks();
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
            subjectId: "",
            pdfId: null,
            imageId: null,
        });
    };

    const copyLink = (id) => {
        navigator.clipboard.writeText(`https://library.bxu.uz/book/${id}`);
    };

    /* =========================
       UI
    ========================= */
    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <div className="lg:ml-72 p-6">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <FiBook /> Kitoblar
                    </h1>
                    <button
                        onClick={() => setOpenModal(true)}
                        className="bg-blue-600 text-white px-5 py-2 rounded-xl flex items-center gap-2"
                    >
                        <FiPlus /> Yangi
                    </button>
                </div>

                {/* FILTERS */}
                <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(0);
                            }}
                            className="w-full pl-10 pr-3 py-2 border rounded-xl"
                            placeholder="Qidirish..."
                        />
                    </div>

                    <div className="w-64">
                        <Select
                            options={subjectOptions}
                            value={selectedSubject}
                            onChange={(v) => {
                                setSelectedSubject(v);
                                setPage(0);
                            }}
                            isClearable
                            placeholder="Fan"
                        />
                    </div>
                </div>

                {/* TABLE */}
                {loading ? (
                    <div className="text-center py-20">Yuklanmoqda...</div>
                ) : (
                    <div className="bg-white rounded-xl shadow overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100">
                            <tr>
                                <th className="p-4 text-left">Nomi</th>
                                <th className="p-4 text-left">Muallif</th>
                                <th className="p-4 text-left">Fan</th>
                                <th className="p-4 text-left">Amallar</th>
                            </tr>
                            </thead>
                            <tbody>
                            {books.map(b => (
                                <tr key={b.id} className="border-t">
                                    <td className="p-4">{b.name}</td>
                                    <td className="p-4">{b.author || "-"}</td>
                                    <td className="p-4">{b.subject?.name || "-"}</td>
                                    <td className="p-4 flex gap-3">
                                        <Link to={`/book/${b.id}`}><FiEye /></Link>
                                        <button onClick={() => copyLink(b.id)}><FiCopy /></button>
                                        <button onClick={() => handleEdit(b)}><FiEdit2 /></button>
                                        <button onClick={() => handleDelete(b.id, b.name)} className="text-red-600">
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {books.length === 0 && (
                            <div className="p-10 text-center text-gray-500">
                                Kitob topilmadi
                            </div>
                        )}

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="text-sm text-gray-600">
                                    Jami: {totalElements} ta
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        disabled={page === 0}
                                        onClick={() => setPage(page - 1)}
                                        className="px-3 py-2 border rounded disabled:opacity-40"
                                    >
                                        Oldingi
                                    </button>

                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i)}
                                            className={`px-3 py-2 border rounded ${
                                                page === i
                                                    ? "bg-blue-600 text-white"
                                                    : ""
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button
                                        disabled={page === totalPages - 1}
                                        onClick={() => setPage(page + 1)}
                                        className="px-3 py-2 border rounded disabled:opacity-40"
                                    >
                                        Keyingi
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL (shortened for clarity – your existing modal can stay) */}
            {openModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">
                            {editId ? "Tahrirlash" : "Yangi kitob"}
                        </h2>

                        <input
                            className="w-full border p-2 mb-3 rounded"
                            placeholder="Kitob nomi"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />

                        <div className="flex gap-3 justify-end">
                            <button onClick={closeModal} className="px-4 py-2 border rounded">
                                Bekor
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded">
                                Saqlash
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBooks;
