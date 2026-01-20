import React, { useEffect, useState } from "react";
import ApiCall, { baseUrl } from "../config";
import {
    FiBook,
    FiUser,
    FiCalendar,
    FiEye,
    FiClock,
    FiDownload,
    FiFileText,
    FiChevronLeft,
    FiChevronRight
} from "react-icons/fi";
import bookImg from "../assets/newbook.jpg";
import {Link} from "react-router-dom";

const PAGE_SIZE = 8;

const AdminBadiiy = () => {
    const [list, setList] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData(page);
    }, [page]);

    const fetchData = async (pageNumber) => {
        setLoading(true);

        const res = await ApiCall("/api/v1/book/badiiy", "GET", null, {
            page: pageNumber,
            size: PAGE_SIZE,
        });

        if (!res?.error) {
            setList(res.data.content || []);
            setTotalPages(res.data.totalPages || 0);
        }

        setLoading(false);
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
        <div id={"badiiy"} className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">


                <div className="mb-8 group">
                    <div className="bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900 rounded-2xl p-8 relative overflow-hidden">
                        {/* Animated Background Elements */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-amber-500/10 to-orange-500/10 rounded-full translate-x-1/3 translate-y-1/3"></div>

                        <div className="relative z-10">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="flex-1">
                                    <div className="inline-flex items-center gap-4 mb-6 p-3 bg-white/5 backdrop-blur-sm rounded-2xl">
                                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                                            <FiBook className="text-white text-2xl" />
                                        </div>
                                        <h1 className="text-4xl font-bold text-white">
                                            Badiiy Kitoblar
                                        </h1>
                                    </div>

                                    <p className="text-white/80 text-lg mb-8 max-w-2xl">
                                        Har bir sahifa - yangi olam. Har bir qahramon - yangi do'st.
                                        Badiiy asarlar orqali insoniyatning abadiy qadriyatlariga sayohat.
                                    </p>

                                    <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm">
              ✨ Klassik asarlar
            </span>
                                        <span className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm">
              📖 Zamonaviy adabiyot
            </span>
                                        <span className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm">
              🏆 Mukofotlanganlar
            </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                                        <div className="text-3xl font-bold text-white">1.5K+</div>
                                        <div className="text-white/70 text-sm">Kitoblar</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                                        <div className="text-3xl font-bold text-white">200+</div>
                                        <div className="text-white/70 text-sm">Mualliflar</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                                        <div className="text-3xl font-bold text-white">50+</div>
                                        <div className="text-white/70 text-sm">Mamlakatlar</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                                        <div className="text-3xl font-bold text-white">10+</div>
                                        <div className="text-white/70 text-sm">Til</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOOK GRID */}
                {loading ? (
                    <p className="text-center text-gray-500 py-10">
                        Yuklanmoqda...
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {list.map((book) => {
                            const imageUrl = book?.image?.id
                                ? `${baseUrl}/api/v1/file/img/${book.image.id}`
                                : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";

                            const hasPDF = !!book.pdf?.id;

                            return (
                                <div
                                    key={book.id}
                                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
                                >
                                    {/* IMAGE */}
                                    <div className="relative h-72 overflow-hidden">
                                        <img
                                            src={imageUrl}
                                            alt={book.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            onError={(e) => (e.target.src = bookImg)}
                                        />

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        {hasPDF && (
                                            <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-1">
                          <FiFileText className="w-3 h-3" />
                          PDF
                        </span>
                                            </div>
                                        )}

                                        {book.genre && (
                                            <div className="absolute bottom-3 left-3">
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-full shadow-lg">
                          {book.genre}
                        </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* INFO */}
                                    <div className="p-5">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {book.name}
                                        </h3>

                                        {book.author && (
                                            <div className="flex items-center gap-2 text-gray-700 mb-2">
                                                <FiUser className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm">{book.author}</span>
                                            </div>
                                        )}

                                        {book.publisher && (
                                            <div className="flex items-center gap-2 text-gray-600 mb-3">
                                                <FiCalendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-xs">{book.publisher}</span>
                                            </div>
                                        )}

                                        {/* ACTIONS */}
                                        <div className="flex gap-2 mt-4 pt-2 border-t border-gray-100">
                                            {hasPDF ? (
                                                <button
                                                    onClick={() =>
                                                        handleDownload(book.pdf.id, book.name)
                                                    }
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow"
                                                >
                                                    <FiDownload />
                                                    Yuklab olish
                                                </button>
                                            ) : (
                                                <div className="flex-1 text-center px-4 py-3 bg-gray-100 text-gray-500 rounded-xl text-sm">
                                                    PDF mavjud emas
                                                </div>
                                            )}

                                            {/*{hasPDF && (*/}
                                            {/*    <button*/}

                                            {/*        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"*/}
                                            {/*        title="Ko‘rish"*/}
                                            {/*    >*/}
                                            {/*        <Link to={"/badiiy/"+book.id}>*/}
                                            {/*            <FiEye />*/}
                                            {/*        </Link>*/}

                                            {/*    </button>*/}
                                            {/*)}*/}
                                        </div>

                                        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                                            {book.createdAt && (
                                                <div className="flex items-center gap-1">
                                                    <FiClock className="w-3 h-3" />
                                                    {new Date(book.createdAt).toLocaleDateString()}
                                                </div>
                                            )}
                                            <div className="font-mono">ID: {book.id}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-10">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage((p) => p - 1)}
                            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 flex items-center gap-1"
                        >
                            <FiChevronLeft />
                            Oldingi
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i)}
                                className={`px-4 py-2 rounded-lg border ${
                                    page === i
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white hover:bg-gray-100"
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            disabled={page === totalPages - 1}
                            onClick={() => setPage((p) => p + 1)}
                            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50 flex items-center gap-1"
                        >
                            Keyingi
                            <FiChevronRight />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBadiiy;
