import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FiBook,
    FiUser,
    FiDownload,
    FiShare2,
    FiBookmark,
    FiStar,
    FiCalendar,
    FiFileText,
    FiClock,
    FiArrowLeft,
    FiEye,
    FiPrinter,
    FiMail,
    FiFacebook,
    FiTwitter,
    FiLinkedin,
    FiCopy,
    FiCheck
} from "react-icons/fi";
import { TbFileDescription } from "react-icons/tb";
import ApiCall, { baseUrl } from "../config";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const OneBook = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [relatedBooks, setRelatedBooks] = useState([]);

    useEffect(() => {
        fetchBook();
        checkBookmark();
        fetchRelatedBooks();
    }, [id]);

    const fetchBook = async () => {
        setLoading(true);
        try {
            // Corrected: Added slash before ${id}
            const res = await ApiCall(`/api/v1/badiiy/${id}`, "GET");
            if (!res?.error) {
                setBook(res.data);
                console.log("Book data:", res.data);
            } else {
                setError("Kitob topilmadi");
            }
        } catch (error) {
            console.error("Error fetching book:", error);
            setError("Kitobni yuklashda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedBooks = async () => {
        try {
            const res = await ApiCall(`/api/v1/badiiy?page=0&size=8`, "GET");
            if (!res?.error && res.data) {
                // Handle paginated response
                const booksData = res.data.content || res.data;
                const allBooks = Array.isArray(booksData) ? booksData : [];

                // Filter out current book and get related ones
                const related = allBooks
                    .filter(b => b.id !== parseInt(id))
                    .slice(0, 4);

                setRelatedBooks(related);
                console.log("Related books:", related);
            }
        } catch (error) {
            console.error("Error fetching related books:", error);
        }
    };

    const checkBookmark = () => {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        setIsBookmarked(bookmarks.includes(parseInt(id)));
    };

    const toggleBookmark = () => {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        const bookId = parseInt(id);

        if (isBookmarked) {
            const newBookmarks = bookmarks.filter(b => b !== bookId);
            localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
        } else {
            bookmarks.push(bookId);
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        }

        setIsBookmarked(!isBookmarked);
    };

    const handleDownload = async () => {
        if (!book?.pdf?.id) {
            alert("Ushbu kitobning PDF versiyasi mavjud emas");
            return;
        }

        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch(
                `${baseUrl}/api/v1/file/getFile/${book.pdf.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/octet-stream"
                    }
                }
            );

            if (!res.ok) throw new Error("Yuklab bo'lmadi");

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${book.name || "kitob"}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Success toast
            showToast("✅ Kitob yuklab olindi!");
        } catch (error) {
            console.error("Download error:", error);
            alert("Yuklab bo'lmadi: " + error.message);
        }
    };

    const handleShare = (platform) => {
        const url = window.location.href;
        const title = book?.name || "Elektron Kitob";
        const text = `${book?.name} - ${book?.author}`;

        switch (platform) {
            case 'copy':
                navigator.clipboard.writeText(url).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                });
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                break;
            case 'telegram':
                window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'email':
                window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`);
                break;
            default:
                break;
        }
    };

    const showToast = (message) => {
        const toast = document.createElement("div");
        toast.className = "fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-in";
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Noma'lum";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('uz-UZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-center items-center h-96">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FiBook className="text-blue-600 text-2xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-20">
                        <FiBook className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {error || "Kitob topilmadi"}
                        </h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            So'ralgan kitob mavjud emas yoki o'chirilgan bo'lishi mumkin.
                        </p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                        >
                            <FiArrowLeft />
                            Orqaga qaytish
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const imageUrl = book.imageId
        ? `${baseUrl}/api/v1/file/img/${book.imageId}`
        : book.image?.id
            ? `${baseUrl}/api/v1/file/img/${book.image.id}`
            : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";

    // Get PDF ID from either pdfId or pdf object
    const pdfId = book.pdfId || book.pdf?.id;

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    <span>Orqaga</span>
                </button>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Book Cover */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-8">
                                    {/* Book Cover */}
                                    <div className="relative group">
                                        <div className="aspect-[3/4] overflow-hidden rounded-2xl shadow-xl bg-gradient-to-br from-gray-100 to-gray-200">
                                            <img
                                                src={imageUrl}
                                                alt={book.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
                                                }}
                                            />
                                        </div>

                                        {/* Bookmark Button */}
                                        <button
                                            onClick={toggleBookmark}
                                            className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                                            title={isBookmarked ? "Belgilangan" : "Belgilash"}
                                        >
                                            <FiBookmark className={`text-xl ${isBookmarked ? 'text-blue-600 fill-blue-600' : 'text-gray-600'}`} />
                                        </button>
                                    </div>

                                    {/* Download Button */}
                                    {pdfId && (
                                        <button
                                            onClick={handleDownload}
                                            className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                                        >
                                            <FiDownload className="text-xl" />
                                            <span>PDF Yuklab Olish</span>
                                        </button>
                                    )}

                                    {/* Quick Stats */}
                                    <div className="mt-6 grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-xl text-center">
                                            <div className="text-2xl font-bold text-gray-900">PDF</div>
                                            <div className="text-sm text-gray-600 mt-1">Format</div>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl text-center">
                                            <div className="text-2xl font-bold text-gray-900">
                                                {book.genre || "Badiiy"}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">Janr</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Book Details */}
                            <div className="lg:col-span-2">
                                {/* Header */}
                                <div className="mb-6">
                                    {book.genre && (
                                        <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
                                            {book.genre}
                                        </span>
                                    )}

                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                        {book.name}
                                    </h1>

                                    <div className="flex items-center gap-4 text-gray-600 mb-6">
                                        <div className="flex items-center gap-2">
                                            <FiUser className="text-gray-400" />
                                            <span className="font-medium">{book.author || "Muallif ko'rsatilmagan"}</span>
                                        </div>
                                        {book.publisher && (
                                            <div className="flex items-center gap-2">
                                                <FiCalendar className="text-gray-400" />
                                                <span>{book.publisher}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <TbFileDescription className="text-blue-600 text-xl" />
                                        <h2 className="text-xl font-bold text-gray-900">Tavsif</h2>
                                    </div>
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700 leading-relaxed text-lg">
                                            {book.description || "Ushbu kitob haqida tavsif mavjud emas."}
                                        </p>
                                    </div>
                                </div>

                                {/* Book Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-gray-50 p-5 rounded-xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <FiFileText className="text-blue-600" />
                                            <h3 className="font-semibold text-gray-900">Kitob Ma'lumotlari</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Muallif:</span>
                                                <span className="font-medium">{book.author || "Noma'lum"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Nashriyot:</span>
                                                <span className="font-medium">{book.publisher || "Noma'lum"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Janr:</span>
                                                <span className="font-medium">{book.genre || "Badiiy"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-5 rounded-xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <FiCalendar className="text-blue-600" />
                                            <h3 className="font-semibold text-gray-900">Qo'shilgan Vaqti</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Qo'shilgan:</span>
                                                <span className="font-medium">{formatDate(book.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-4 mb-8">
                                    {pdfId && (
                                        <>
                                            {/*<button*/}
                                            {/*    onClick={() => window.open(`${baseUrl}/api/v1/file/getFile/${pdfId}`, "_blank")}*/}
                                            {/*    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"*/}
                                            {/*>*/}
                                            {/*    <FiEye />*/}
                                            {/*    Onlayn O'qish*/}
                                            {/*</button>*/}

                                            <button
                                                onClick={handleDownload}
                                                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
                                            >
                                                <FiDownload />
                                                Yuklab Olish
                                            </button>
                                        </>
                                    )}

                                    {/*<button*/}
                                    {/*    onClick={() => window.print()}*/}
                                    {/*    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"*/}
                                    {/*>*/}
                                    {/*    <FiPrinter />*/}
                                    {/*    Chop etish*/}
                                    {/*</button>*/}
                                </div>

                                {/* Share Section */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FiShare2 />
                                        Ulashish
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => handleShare('copy')}
                                            className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                                            title="Linkni nusxalash"
                                        >
                                            {copied ? <FiCheck className="text-green-600" /> : <FiCopy />}
                                            <span className="hidden sm:inline">{copied ? "Nusxalandi!" : "Nusxalash"}</span>
                                        </button>

                                        <button
                                            onClick={() => handleShare('facebook')}
                                            className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
                                            title="Facebook'da ulashish"
                                        >
                                            <FiFacebook className="text-xl" />
                                        </button>

                                        <button
                                            onClick={() => handleShare('twitter')}
                                            className="p-3 bg-blue-50 text-blue-400 rounded-xl hover:bg-blue-100 transition-colors"
                                            title="Twitter'da ulashish"
                                        >
                                            <FiTwitter className="text-xl" />
                                        </button>

                                        {/* Telegram Button */}
                                        <button
                                            onClick={() => handleShare('telegram')}
                                            className="p-3 bg-sky-100 text-sky-600 rounded-xl hover:bg-sky-200 transition-colors"
                                            title="Telegram'da ulashish"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.06-.2-.07-.06-.17-.04-.24-.02-.1.02-1.79 1.14-5.06 3.34-.48.33-.91.5-1.3.49-.43-.01-1.27-.25-1.89-.46-.76-.26-1.37-.4-1.32-.84.03-.24.32-.49.89-.76 3.47-1.51 5.78-2.51 6.94-3.01 3.05-1.32 3.68-1.55 4.1-1.56.09 0 .29.02.42.12.1.08.13.19.14.27-.01.06.01.28 0 0z"/>
                                            </svg>
                                        </button>

                                        <button
                                            onClick={() => handleShare('linkedin')}
                                            className="p-3 bg-blue-200 text-blue-700 rounded-xl hover:bg-blue-300 transition-colors"
                                            title="LinkedIn'da ulashish"
                                        >
                                            <FiLinkedin className="text-xl" />
                                        </button>

                                        <button
                                            onClick={() => handleShare('email')}
                                            className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                                            title="Email orqali ulashish"
                                        >
                                            <FiMail className="text-xl" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Books Section */}
                {relatedBooks.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <FiStar className="text-blue-600" />
                            O'xshash Kitoblar
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedBooks.map((relatedBook) => {
                                const relatedImageUrl = relatedBook.imageId
                                    ? `${baseUrl}/api/v1/file/img/${relatedBook.imageId}`
                                    : relatedBook.image?.id
                                        ? `${baseUrl}/api/v1/file/img/${relatedBook.image.id}`
                                        : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";

                                return (
                                    <div
                                        key={relatedBook.id}
                                        onClick={() => navigate(`/badiiy/${relatedBook.id}`)}
                                        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
                                    >
                                        <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                                            <img
                                                src={relatedImageUrl}
                                                alt={relatedBook.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
                                                }}
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                {relatedBook.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-2">
                                                {relatedBook.author || "Muallif ko'rsatilmagan"}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Metadata Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>
                        Kitob ID: {book.id} •
                        {book.createdAt && ` Qo'shilgan: ${formatDate(book.createdAt)}`}
                    </p>
                </div>
            </div>

            <style jsx>{`
                .animate-slide-in {
                    animation: slideIn 0.3s ease-out;
                }
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
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>

            <Footer />
        </div>
    );
};

export default OneBook;