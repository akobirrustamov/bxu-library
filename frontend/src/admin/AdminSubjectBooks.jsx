import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiCall, {baseUrl} from "../config";
import Sidebar from "./Sidebar";
import { FiBook, FiUser, FiFileText, FiDatabase } from "react-icons/fi";

export default function AdminSubjectBooks() {
    const { subjectId } = useParams();

    const [books, setBooks] = useState([]);
    const [subjectName, setSubjectName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        ApiCall(`/api/v1/books/by-subject/${subjectId}`, "GET")
            .then(res => {
                if (!res?.error) {
                    setBooks(res.data || []);
                    if (res.data?.length > 0) {
                        setSubjectName(res.data[0].subjectName);
                    }
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [subjectId]);

    /* =========================
       CALCULATED STATISTICS
    ========================= */
    const totalBooks = books.length;
    const totalLibraryCount = books.reduce(
        (sum, b) => sum + (b.libraryCount || 0),
        0
    );
    const handleDownload = async (file, name) => {
        try {
            alert(file)
            if (!file) {
                alert("❌ Fayl ID topilmadi");
                return;
            }

            const token = localStorage.getItem("authToken");
            const response = await fetch(
                `${baseUrl}/api/v1/file/getFile/${file}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("❌ Faylni yuklab bo‘lmadi");
            }

            // Faylni blob ko‘rinishida olish
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Fayl nomini olish (name maydonidan)
            const fileName = name+".pdf" || "downloaded_file.pdf";

            // Yuklab olishni boshlash
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();

            // URL ni tozalash
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download error:", error);
            alert("Xatolik yuz berdi: " + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            <Sidebar />

            <main className="lg:ml-72 p-4 md:p-6">
                {/* ================= HEADER ================= */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {subjectName || "Fan bo‘yicha kitoblar"}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Ushbu fan bo‘yicha mavjud elektron adabiyotlar
                    </p>
                </div>

                {/* ================= TOP STATISTICS ================= */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-2xl p-6 shadow-lg flex items-center gap-4">
                            <div className="p-4 bg-blue-100 rounded-xl">
                                <FiBook className="text-blue-600 text-2xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Jami kitoblar</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {totalBooks}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg flex items-center gap-4">
                            <div className="p-4 bg-green-100 rounded-xl">
                                <FiDatabase className="text-green-600 text-2xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Kutubxonadagi jami nusxalar
                                </p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {totalLibraryCount}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= LOADING ================= */}
                {loading && (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
                    </div>
                )}

                {/* ================= EMPTY ================= */}
                {!loading && books.length === 0 && (
                    <div className="text-center text-gray-500 py-10 bg-white rounded-xl shadow">
                        Bu fan bo‘yicha kitoblar mavjud emas
                    </div>
                )}

                {/* ================= TABLE ================= */}
                {!loading && books.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                    №
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                    Kitob nomi
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                    Muallif
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                    Nashriyot
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                    Janr
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                    Kutubxona
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                    Soni
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                    PDF
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {books.map((book, index) => (
                                <tr
                                    key={book.id}
                                    className="border-t hover:bg-gray-50 transition"
                                >
                                    <td className="px-4 py-3 text-sm">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {book.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {book.author || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {book.publisher || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {book.genre || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm">
                                            <span
                                                className={`font-semibold ${
                                                    book.isHaveLibrary
                                                        ? "text-green-600"
                                                        : "text-gray-400"
                                                }`}
                                            >
                                                {book.isHaveLibrary ? "Ha" : "Yo‘q"}
                                            </span>
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm font-semibold">
                                        {book.libraryCount || 0}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {book.pdfId ? (
                                            <button
                                                onClick={()=>handleDownload(book.pdfId, book.name)}

                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline font-semibold cursor-pointer"
                                            >
                                                Ochish
                                            </button>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
