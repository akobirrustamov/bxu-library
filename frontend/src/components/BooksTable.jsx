import React, { useEffect, useState, useMemo } from "react";
import {
  FiBook,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiX,
  FiFileText,
  FiChevronRight,
  FiClock,
  FiUser,
  FiBookOpen,
  FiBookmark,
  FiStar,
  FiShare2,
  FiGrid,
  FiList,
  FiChevronLeft,
  FiChevronDown,
  FiChevronUp
} from "react-icons/fi";
import ApiCall, { baseUrl } from "../config";
import bookImg from "../assets/newbook.jpg";
import {Link} from "react-router-dom";

const PublicBooksCatalog = () => {
  const [books, setBooks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectSearch, setSubjectSearch] = useState("");
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // You can change this number

  useEffect(() => {
    loadBooks();
    loadSubjects();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const res = await ApiCall("/api/v1/book/all", "GET");
      if (!res?.error) setBooks(res.data);
    } catch (error) {
      console.error("Error loading books:", error);
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

  // Filter books based on search term and selected subject
  const filteredBooks = useMemo(() => {
    let filtered = books;

    if (searchTerm) {
      filtered = filtered.filter(book =>
          (book.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              book.publisher?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedSubject) {
      filtered = filtered.filter(book =>
          book.subject?.id === selectedSubject
      );
    }

    return filtered;
  }, [books, searchTerm, selectedSubject]);

  // Filter subjects for searchable dropdown
  const filteredSubjects = useMemo(() => {
    if (!subjectSearch) return subjects;

    return subjects.filter(subject =>
        subject.name?.toLowerCase().includes(subjectSearch.toLowerCase())
    );
  }, [subjects, subjectSearch]);

  // Get selected subject name
  const selectedSubjectName = useMemo(() => {
    if (!selectedSubject) return "";
    const subject = subjects.find(s => s.id === selectedSubject);
    return subject ? subject.name : "";
  }, [selectedSubject, subjects]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  const handleDownload = async (fileId, bookName) => {
    try {
      if (!fileId) return alert("Fayl mavjud emas");

      const token = localStorage.getItem("authToken");
      const res = await fetch(
          `${baseUrl}/api/v1/file/getFile/${fileId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/octet-stream"
            }
          }
      );

      if (!res.ok) {
        throw new Error(`Download failed: ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (bookName || "book") + ".pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show success message
      const toast = document.createElement("div");
      toast.className = "fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-in";
      toast.textContent = "✅ Kitob yuklab olindi!";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      console.error("Download error:", error);
      alert("Yuklab bo'lmadi: " + error.message);
    }
  };

  const getStats = () => {
    const totalBooks = books.length;
    const totalSubjects = new Set(books.map(b => b.subject?.id).filter(Boolean)).size;
    const recentBooks = books.filter(b => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return b.createdAt && new Date(b.createdAt) > weekAgo;
    }).length;

    return { totalBooks, totalSubjects, recentBooks };
  };

  const stats = getStats();

  // Handle pagination page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle previous page
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSubject]);

  return (
      <div id={"table-books"} className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

          {/* Hero Banner */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-500/10 to-blue-500/10 rounded-full -translate-x-1/3 translate-y-1/3"></div>

              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 blur-lg opacity-70 rounded-2xl"></div>
                        <div className="relative p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl">
                          <FiBookOpen className="text-white text-4xl" />
                        </div>
                      </div>
                      <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                          Elektron Kutubxona
                        </h1>
                        <p className="text-blue-100 text-lg md:text-xl max-w-2xl">
                          O'qishni sevuvchilar uchun turli fan va mavzulardagi elektron kitoblar to'plami
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                        📚 {stats.totalBooks} ta Kitob
                      </div>
                      <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                        🎓 {stats.totalSubjects} ta Fan
                      </div>
                      <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                        📈 Har hafta yangilanadi
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                      <div className="text-3xl font-bold text-white">{stats.totalBooks}</div>
                      <div className="text-white/80 text-sm mt-2">Kitob</div>
                    </div>
                    <div className="text-center p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                      <div className="text-3xl font-bold text-white">{stats.totalSubjects}</div>
                      <div className="text-white/80 text-sm mt-2">Fan</div>
                    </div>
                    <div className="text-center p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                      <div className="text-3xl font-bold text-white">{stats.recentBooks}</div>
                      <div className="text-white/80 text-sm mt-2">Yangi</div>
                    </div>
                    <div className="text-center p-5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                      <div className="text-3xl font-bold text-white">24/7</div>
                      <div className="text-white/80 text-sm mt-2">Mavjud</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                      type="text"
                      placeholder="Kitob nomi, muallif yoki nashriyot bo'yicha qidirish..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-14 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                  {/* Searchable Subject Select */}
                  <div className="relative flex-1 min-w-[250px]">
                    <div
                        onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                        className={`w-full pl-14 pr-12 py-4 bg-gray-50 border ${showSubjectDropdown ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200'} rounded-xl cursor-pointer flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-3">
                        <FiFilter className="text-gray-400 text-xl" />
                        <span className={selectedSubject ? "text-gray-900" : "text-gray-400"}>
                        {selectedSubject ? selectedSubjectName : "Barcha fanlar"}
                      </span>
                      </div>
                      {showSubjectDropdown ? (
                          <FiChevronUp className="text-gray-400" />
                      ) : (
                          <FiChevronDown className="text-gray-400" />
                      )}
                    </div>

                    {/* Dropdown Menu */}
                    {showSubjectDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                          {/* Search input inside dropdown */}
                          <div className="p-2 border-b border-gray-100">
                            <div className="relative">
                              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                              <input
                                  type="text"
                                  placeholder="Fan bo'yicha qidirish..."
                                  value={subjectSearch}
                                  onChange={(e) => setSubjectSearch(e.target.value)}
                                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                  onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>

                          {/* Options */}
                          <div className="py-1">
                            <div
                                onClick={() => {
                                  setSelectedSubject("");
                                  setShowSubjectDropdown(false);
                                  setSubjectSearch("");
                                }}
                                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!selectedSubject ? 'bg-blue-50 text-blue-600' : ''}`}
                            >
                              Barcha fanlar
                            </div>

                            {filteredSubjects.length > 0 ? (
                                filteredSubjects.map((subject) => (
                                    <div
                                        key={subject.id}
                                        onClick={() => {
                                          setSelectedSubject(subject.id);
                                          setShowSubjectDropdown(false);
                                          setSubjectSearch("");
                                        }}
                                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${selectedSubject === subject.id ? 'bg-blue-50 text-blue-600' : ''}`}
                                    >
                                      {subject.name}
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-gray-400 text-center text-sm">
                                  Fan topilmadi
                                </div>
                            )}
                          </div>
                        </div>
                    )}

                    {/* Close dropdown when clicking outside */}
                    {showSubjectDropdown && (
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowSubjectDropdown(false)}
                        />
                    )}
                  </div>

                  {/* View Toggle */}
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-3 rounded-lg transition-all ${viewMode === "grid" ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                    >
                      <FiGrid className="text-gray-700" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-3 rounded-lg transition-all ${viewMode === "list" ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                    >
                      <FiList className="text-gray-700" />
                    </button>
                  </div>

                  {/* Clear Filters */}
                  {(searchTerm || selectedSubject) && (
                      <button
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedSubject("");
                            setSubjectSearch("");
                          }}
                          className="px-6 py-4 text-gray-600 hover:text-gray-900 transition flex items-center gap-2"
                      >
                        <FiX />
                        Tozalash
                      </button>
                  )}
                </div>
              </div>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchTerm ? `"${searchTerm}" bo'yicha natijalar` : "Barcha kitoblar"}
                </h2>
                <p className="text-gray-600 mt-2">
                  {filteredBooks.length} ta kitob topildi {selectedSubject && subjects.find(s => s.id === selectedSubject)?.name && `(${subjects.find(s => s.id === selectedSubject)?.name} fanida)`}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                  {books.length > 0 && (
                      <span className="inline-flex items-center gap-2">
                    <FiClock />
                    Oxirgi yangilangan: {new Date(Math.max(...books.map(b => new Date(b.updatedAt || b.createdAt).getTime()))).toLocaleDateString()}
                  </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
                  Sahifa: {currentPage} / {totalPages}
                </div>
              </div>
            </div>
          </div>

          {/* Books Display */}
          {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiBook className="text-blue-600 text-2xl" />
                  </div>
                </div>
              </div>
          ) : viewMode === "grid" ? (
              /* Grid View */
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentBooks.map((book) => {
                    const imageUrl = book?.image?.id
                        ? `${baseUrl}/api/v1/file/img/${ book?.image?.id}`
                        : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";

                    const hasPdf = !!book.pdf?.id;

                    return (
                        <div
                            key={book.id}
                            className="group bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden hover:-translate-y-2"
                        >
                          {/* Book Cover */}
                          <div className="relative h-60 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                            <img
                                src={imageUrl}
                                alt={book.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                loading="lazy"
                            />

                            {/* Subject Badge */}
                            {book.subject?.name && (
                                <div className="absolute top-3 left-3">
                          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-800 rounded-full shadow-sm">
                            {book.subject.name}
                          </span>
                                </div>
                            )}

                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                                <button
                                    className="flex-1 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-800 font-medium rounded-lg hover:bg-white transition-colors"
                                >
                                  <Link to={"/book/"+book.id}>
                                    <FiEye className="inline mr-2" />
                                    Ko'rish
                                  </Link>

                                </button>
                                {hasPdf && (
                                    <button
                                        onClick={() => handleDownload(book.pdf?.id, book.name)}
                                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                        title="Yuklab olish"
                                    >
                                      <FiDownload />
                                    </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Book Info */}
                          <div className="p-5 flex flex-col flex-1">
                            <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
                              {book.name}
                            </h3>

                            <div className="mb-4">
                              <div className="flex items-center gap-2 text-gray-600 mb-2">
                                <FiUser className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium">
                            {book.author || "Muallif ko'rsatilmagan"}
                          </span>
                              </div>

                              {book.publisher && (
                                  <div className="text-sm text-gray-500">
                                    Nashriyot: {book.publisher}
                                  </div>
                              )}
                            </div>



                            {/* Action Button */}
                            <div className="mt-auto pt-4 border-t border-gray-100">
                              {hasPdf ? (
                                  <button
                                      onClick={() => handleDownload(book.pdf?.id, book.name)}
                                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                                  >
                                    <FiDownload />
                                    Yuklab olish
                                  </button>
                              ) : (
                                  <div className="w-full text-center text-sm text-gray-400 py-3 border-2 border-dashed border-gray-200 rounded-xl">
                                    PDF mavjud emas
                                  </div>
                              )}
                            </div>
                          </div>
                        </div>
                    );
                  })}
                </div>

                {/* Pagination for Grid View */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <nav className="flex items-center gap-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                          <FiChevronLeft className="text-xl" />
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // Show page numbers around current page
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }

                          return (
                              <button
                                  key={pageNumber}
                                  onClick={() => paginate(pageNumber)}
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                      currentPage === pageNumber
                                          ? 'bg-blue-600 text-white'
                                          : 'text-gray-700 hover:bg-gray-100'
                                  }`}
                              >
                                {pageNumber}
                              </button>
                          );
                        })}

                        {totalPages > 5 && currentPage < totalPages - 2 && (
                            <>
                              <span className="px-2 text-gray-400">...</span>
                              <button
                                  onClick={() => paginate(totalPages)}
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                      currentPage === totalPages
                                          ? 'bg-blue-600 text-white'
                                          : 'text-gray-700 hover:bg-gray-100'
                                  }`}
                              >
                                {totalPages}
                              </button>
                            </>
                        )}

                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                          <FiChevronRight className="text-xl" />
                        </button>
                      </nav>
                    </div>
                )}
              </>
          ) : (
              /* List View */
              <>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                      <tr>
                        <th className="py-4 px-3 text-left text-gray-700 font-semibold">Kitob</th>
                        <th className="py-4 px-3 text-left text-gray-700 font-semibold">Muallif</th>
                        <th className="py-4 px-3 text-left text-gray-700 font-semibold">Fan</th>
                        <th className="py-4 px-3 text-left text-gray-700 font-semibold">Amallar</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                      {currentBooks.map((book) => (
                          <tr key={book.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                  <img
                                      src={book?.image?.id ? `${baseUrl}/api/v1/file/img/${book?.image?.id}` : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"}
                                      alt={book.name}
                                      className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {book.name}
                                  </div>
                                  {book.description && (
                                      <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                        {book.description}
                                      </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <div className="font-medium text-gray-900">
                                <div className="flex items-center gap-2">
                                  <FiUser className="text-gray-400" />
                                  {book.author || "Noma'lum"}
                                </div>
                                {book.publisher && (
                                    <div className="text-sm text-gray-500 mt-1">
                                      {book.publisher}
                                    </div>
                                )}
                              </div>
                            </td>
                            <td className="py-2 px-3">
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-blue-100 text-blue-800 font-medium">
                            {book.subject?.name || "Fan tanlanmagan"}
                          </span>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                <button
                                    className="p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-colors"
                                    title="Ko'rish"
                                >
                                  <Link to={"/book/"+book.id}>
                                    <FiEye />

                                  </Link>
                                </button>
                                {book.pdf?.id && (
                                    <button
                                        onClick={() => handleDownload(book.pdf?.id, book.name)}
                                        className="p-3 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-xl transition-colors"
                                        title="Yuklab olish"
                                    >
                                      <FiDownload />
                                    </button>
                                )}
                              </div>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination for List View */}
                  {totalPages > 1 && (
                      <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-600">
                          Ko'rsatilmoqda: {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBooks.length)} dan {filteredBooks.length} ta
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                              onClick={handlePrevPage}
                              disabled={currentPage === 1}
                              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                  currentPage === 1
                                      ? 'text-gray-400 cursor-not-allowed'
                                      : 'text-gray-700 hover:bg-gray-100'
                              }`}
                          >
                            <FiChevronLeft />
                            Oldingi
                          </button>

                          <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNumber;
                              if (totalPages <= 5) {
                                pageNumber = i + 1;
                              } else if (currentPage <= 3) {
                                pageNumber = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNumber = totalPages - 4 + i;
                              } else {
                                pageNumber = currentPage - 2 + i;
                              }

                              return (
                                  <button
                                      key={pageNumber}
                                      onClick={() => paginate(pageNumber)}
                                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                          currentPage === pageNumber
                                              ? 'bg-blue-600 text-white'
                                              : 'text-gray-700 hover:bg-gray-100'
                                      }`}
                                  >
                                    {pageNumber}
                                  </button>
                              );
                            })}
                          </div>

                          <button
                              onClick={handleNextPage}
                              disabled={currentPage === totalPages}
                              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                                  currentPage === totalPages
                                      ? 'text-gray-400 cursor-not-allowed'
                                      : 'text-gray-700 hover:bg-gray-100'
                              }`}
                          >
                            Keyingi
                            <FiChevronRight />
                          </button>
                        </div>
                      </div>
                  )}
                </div>
              </>
          )}

          {/* No Results */}
          {!loading && filteredBooks.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6">
                  <FiBook className="w-20 h-20 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Kitoblar topilmadi
                </h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto mb-8">
                  {searchTerm || selectedSubject
                      ? `"${searchTerm}" qidiruvi bo'yicha hech narsa topilmadi`
                      : "Hozircha kutubxonada kitoblar mavjud emas"}
                </p>
                {(searchTerm || selectedSubject) && (
                    <button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedSubject("");
                          setSubjectSearch("");
                        }}
                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
                    >
                      Barcha kitoblarni ko'rish
                    </button>
                )}
              </div>
          )}

          {/* Footer Stats */}
          {filteredBooks.length > 0 && (
              <div className="mt-12">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Kutubxonamiz haqida ma'lumot
                      </h3>
                      <p className="text-gray-600">
                        Bizning kutubxona doimiy ravishda yangi kitoblar bilan boyitilmoqda
                      </p>
                    </div>
                    <div className="flex gap-8">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{stats.totalBooks}</div>
                        <div className="text-gray-600">Jami kitob</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">{stats.totalSubjects}</div>
                        <div className="text-gray-600">Fan</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">0</div>
                        <div className="text-gray-600">Premium</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          )}

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
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
        </div>
      </div>
  );
};

export default PublicBooksCatalog;