import React, { useEffect, useRef, useState } from "react";
import library1 from "../assets/library1.jpg";
import library2 from "../assets/library2.jpg";
import library3 from "../assets/library3.jpg";
import bookImg from "../assets/newbook.jpg"
import { FiSearch, FiChevronDown,FiEye,FiUser,FiFileText,FiFile, FiChevronUp, FiCheck, FiBookOpen, FiBook, FiUsers, FiDownload } from "react-icons/fi";
import ApiCall from "../config";

import { baseUrl } from "../config";
import {Link} from "react-router-dom";

/* =========================
   IMPROVED SEARCHABLE SELECT
========================= */
const SearchableSelect = ({
                              label,
                              value,
                              options,
                              onChange,
                              disabled,
                              placeholder = "Tanlang...",
                              searchPlaceholder = "Qidirish...",
                          }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOption, setSelectedOption] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (value && options.length > 0) {
            const found = options.find(opt => opt.id === value);
            setSelectedOption(found || null);
        } else {
            setSelectedOption(null);
        }
    }, [value, options]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(option => {
        const name = option.name || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleSelect = (option) => {
        onChange(option.id);
        setSelectedOption(option);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <label className="block text-gray-700 text-sm font-semibold mb-2 px-1">
                {label}
            </label>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full h-12 px-4 rounded-xl border border-gray-300 bg-white flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:border-blue-400 hover:shadow-sm ${
                    isOpen ? "ring-2 ring-blue-500 border-blue-500 shadow-md" : ""
                } ${disabled ? "bg-gray-50" : "bg-white"}`}
            >
        <span className={`truncate ${selectedOption ? "text-gray-900 font-medium" : "text-gray-500"}`}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
                {isOpen ? (
                    <FiChevronUp className="text-gray-500 flex-shrink-0 ml-2" />
                ) : (
                    <FiChevronDown className={`text-gray-500 flex-shrink-0 ml-2 ${disabled ? "opacity-50" : ""}`} />
                )}
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 max-h-64 overflow-hidden animate-fadeIn">
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && filteredOptions.length > 0) {
                                        handleSelect(filteredOptions[0]);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-48 scrollbar-thin">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = selectedOption?.id === option.id;
                                const optionName = option.name;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all duration-200 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                                            isSelected ? "bg-blue-50 text-blue-700" : "text-gray-900"
                                        }`}
                                    >
                                        <span className="truncate font-medium">{optionName}</span>
                                        {isSelected && <FiCheck className="text-blue-600 flex-shrink-0 ml-2" />}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-4 py-6 text-center text-gray-500">
                                <FiSearch className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">Natija topilmadi</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

/* =========================
   HERO COMPONENT WITH BOTH FUNCTIONALITY & DESIGN
========================= */
const Hero = () => {
    const [educationTypes, setEducationTypes] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [books, setBooks] = useState([]);

    const [educationId, setEducationId] = useState("");
    const [facultyId, setFacultyId] = useState("");
    const [subjectId, setSubjectId] = useState("");
    const [loading, setLoading] = useState(false);

    /* =========================
       GET EDUCATION TYPES
    ========================= */
    useEffect(() => {
        ApiCall("/api/v1/type", "GET").then((res) => {
            if (!res?.error) {
                setEducationTypes(res.data.map((e) => ({
                    id: e.id,
                    name: e.name,
                })));
            }
        });
    }, []);

    /* =========================
       GET FACULTIES
    ========================= */
    useEffect(() => {
        if (!educationId) {
            setFaculties([]);
            setSubjects([]);
            setBooks([]);
            return;
        }

        setLoading(true);
        setFacultyId("");
        setSubjectId("");
        setSubjects([]);
        setBooks([]);

        ApiCall(`/api/v1/faculty/by-education/${educationId}`, "GET")
            .then((res) => {
                if (!res?.error) {
                    setFaculties(res.data.map((f) => ({
                        id: f.id,
                        name: f.name,
                    })));
                }
            })
            .finally(() => setLoading(false));
    }, [educationId]);

    /* =========================
       GET SUBJECTS
    ========================= */
    useEffect(() => {
        if (!facultyId) {
            setSubjects([]);
            setBooks([]);
            return;
        }

        setLoading(true);
        setSubjectId("");
        setBooks([]);

        ApiCall(`/api/v1/faculty-subject/by-faculty/${facultyId}`, "GET")
            .then((res) => {
                if (!res?.error) {
                    setSubjects(res.data.map((s) => ({
                        id: s.subjectId,
                        name: s.subjectName,
                    })));
                }
            })
            .finally(() => setLoading(false));
    }, [facultyId]);

    /* =========================
       GET BOOKS
    ========================= */
    useEffect(() => {
        if (!subjectId) {
            setBooks([]);
            return;
        }

        setLoading(true);
        ApiCall(`/api/v1/books/by-subject/${subjectId}`, "GET")
            .then((res) => {
                if (!res?.error) setBooks(res.data);
            })
            .finally(() => setLoading(false));
    }, [subjectId]);
    const handleDownload = async (file, name) => {
        try {
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
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Left side - Main content */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                            {/* Header with responsive font sizes */}
                            <div className="mb-6 sm:mb-8">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-3 sm:mb-4">
                                    Buxoro Xalqaro Universiteti <span className="text-blue-600">elektron kutubxonasi</span>
                                </h1>
                                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                                    Ushbu sahifa Buxoro Xalqaro Universiteti talabalari uchun ta'lim olish jarayonlarida mavjud fanlar bo'yicha barcha elektron kitoblarni olish uchun qo'shimcha imkoniyatlar yaratish uchun xizmat qiladi.
                                </p>
                            </div>

                            {/* Divider with gradient */}
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-6 sm:my-8"></div>

                            {/* Searchable selects section */}
                            <div className=" grid-cols-1 md:grid-cols-3 gap-4 hidden">
                                <SearchableSelect
                                    label="Ta'lim turini tanlang"
                                    value={educationId}
                                    options={educationTypes}
                                    onChange={setEducationId}
                                    placeholder="Masalan: Bakalavr"
                                    searchPlaceholder="Ta'lim turini qidirish..."
                                />

                                <SearchableSelect
                                    label="Yo'nalishingizni tanlang"
                                    value={facultyId}
                                    options={faculties}
                                    onChange={setFacultyId}
                                    disabled={!educationId}
                                    placeholder="Masalan: Kompyuter injiniringi"
                                    searchPlaceholder="Yo'nalishni qidirish..."
                                />

                                <SearchableSelect
                                    label="Fanni tanlang"
                                    value={subjectId}
                                    options={subjects}
                                    onChange={setSubjectId}
                                    disabled={!facultyId}
                                    placeholder="Masalan: Dasturlash asoslari"
                                    searchPlaceholder="Fanni qidirish..."
                                />
                            </div>

                            {/* Loading indicator */}
                            {loading && (
                                <div className="mt-4 flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            )}

                            {/* Books section */}
                            {books.length > 0 && (
                                <div className="mt-12">
                                    {/* Section Header */}
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-2">
                                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow">
                                                    <FiBookOpen className="text-white text-xl" />
                                                </div>
                                                <span>Topilgan kitoblar</span>
                                            </h2>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-gray-500">
                                                    Jami: <span className="font-bold text-blue-600">{books.length} ta</span>
                                                </span>
                                                <div className="h-8 w-px bg-gray-200"></div>
                                                <button
                                                    onClick={() => {/* Add sort functionality */}}
                                                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                                >
                                                    Saralash
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-gray-600">Qidiruv natijasiga ko'ra topilgan kitoblar</p>
                                    </div>

                                    {/* Books Grid */}
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                                        {books.map((book) => {
                                            const imageUrl = book.imageId
                                                ? `${baseUrl}/api/v1/file/img/${book.imageId}`
                                                : "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";

                                            const hasPdf = !!book.pdfId;

                                            return (
                                                <div
                                                    key={book.id}
                                                    className="
                                                        group bg-white rounded-2xl border border-gray-100 shadow-sm
                                                        hover:shadow-2xl transition-all duration-500
                                                        flex flex-col overflow-hidden hover:-translate-y-2
                                                        relative
                                                    "
                                                >
                                                    {/* Premium Badge */}
                                                    {book.isPremium && (
                                                        <div className="absolute top-3 right-3 z-10">
                                <span className="
                                    px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500
                                    text-xs font-bold text-white rounded-full
                                    shadow-lg
                                ">
                                    Premium
                                </span>
                                                        </div>
                                                    )}

                                                    {/* Book Cover with Gradient Overlay */}
                                                    <div className="relative h-72 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                                        <img
                                                            src={imageUrl}
                                                            alt={book.name}
                                                            className="
                                    w-full h-full object-cover
                                    group-hover:scale-110 transition-transform duration-700
                                "
                                                            loading="lazy"
                                                        />

                                                        {/* Gradient Overlay */}
                                                        <div className="
                                absolute inset-0 bg-gradient-to-t
                                from-black/70 via-black/20 to-transparent
                                opacity-0 group-hover:opacity-100 transition-opacity duration-500
                            " />

                                                        {/* Quick Actions Overlay */}
                                                        <div className="
                                absolute inset-0 flex items-center justify-center
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300
                            ">
                                                            <div className="flex gap-3">
                                                                {hasPdf && (
                                                                    <button
                                                                        onClick={() => handleDownload(book.pdfId, book.name)}
                                                                        className="
                                                p-3 bg-gradient-to-r from-green-500 to-green-600
                                                text-white rounded-full shadow-lg
                                                hover:scale-110 transition-transform duration-200
                                                hover:shadow-xl
                                            "
                                                                        title="Yuklab olish"
                                                                    >
                                                                        <FiDownload className="text-lg" />
                                                                    </button>
                                                                )}
                                                                <button

                                                                    className="
                                            p-3 bg-white/90 backdrop-blur-sm
                                            text-gray-800 rounded-full shadow-lg
                                            hover:scale-110 transition-transform duration-200
                                            hover:shadow-xl
                                        "
                                                                    title="Ko'rib chiqish"
                                                                >
                                                                    <Link to={"/book/"+book.id}>
                                                                        <FiEye className="text-lg" />

                                                                    </Link>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Subject Badge */}
                                                        {book.subject?.name && (
                                                            <div className="absolute bottom-3 left-3">
                                    <span className="
                                        px-3 py-1.5 bg-white/90 backdrop-blur-sm
                                        text-xs font-semibold text-gray-800
                                        rounded-full shadow-sm
                                    ">
                                        {book.subject.name}
                                    </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Book Content */}
                                                    <div className="p-5 flex flex-col flex-1">
                                                        {/* Title and Author */}
                                                        <div className="mb-4">
                                                            <h3 className="
                                    font-bold text-gray-900 text-lg
                                    line-clamp-2 mb-2 leading-tight
                                    group-hover:text-blue-600 transition-colors
                                ">
                                                                {book.name}
                                                            </h3>

                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <FiUser className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm font-medium">
                                        {book.author || "Muallif ko'rsatilmagan"}
                                    </span>
                                                            </div>
                                                        </div>



                                                        {/* Metadata */}
                                                        <div className="flex items-center justify-between text-xs text-gray-400 mb-5">
                                                            {book.pages && (
                                                                <div className="flex items-center gap-1">
                                                                    <FiFileText className="w-3 h-3" />
                                                                    <span>{book.pages} sahifa</span>
                                                                </div>
                                                            )}
                                                            {book.publisher && (
                                                                <div className="flex items-center gap-1">
                                                                    <FiBook className="w-3 h-3" />
                                                                    <span>{book.publisher}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Action Button */}
                                                        <div className="mt-auto">
                                                            {hasPdf ? (
                                                                <button
                                                                    onClick={() => handleDownload(book.pdfId, book.name)}
                                                                    className="
                                            w-full bg-gradient-to-r from-blue-500 to-blue-600
                                            text-white font-semibold py-3 rounded-xl
                                            hover:from-blue-600 hover:to-blue-700
                                            transition-all duration-300
                                            flex items-center justify-center gap-2
                                            shadow-md hover:shadow-lg
                                            group-hover:shadow-xl
                                            hover:scale-[1.02] transform
                                        "
                                                                >
                                                                    <span>Yuklab olish</span>
                                                                    <FiDownload className="
                                            transition-transform duration-300
                                            group-hover:translate-y-1
                                        " />
                                                                </button>
                                                            ) : (
                                                                <div className="
                                        w-full text-center text-sm text-gray-400 py-3
                                        border-2 border-dashed border-gray-200 rounded-xl
                                        hover:border-gray-300 transition-colors
                                        flex items-center justify-center gap-2
                                    ">
                                                                    <FiFile className="text-gray-400" />
                                                                    <span>PDF mavjud emas</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Bottom Gradient Accent */}
                                                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Load More Button (Optional) */}

                                </div>
                            )}



                            {/* No books message */}
                            {subjectId && !loading && books.length === 0 && (
                                <div className="mt-8 text-center py-8">
                                    <FiBook className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-gray-900">Kitoblar topilmadi</h3>
                                    <p className="text-gray-600 mt-1">Tanlgan fan bo'yicha hozircha kitoblar mavjud emas</p>
                                </div>
                            )}
                        </div>

                        {/* Information Center Section */}
                        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <FiBook className="text-blue-600 text-xl" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                    AXBOROT-RESURS MARKAZI
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 bg-white/50 rounded-xl backdrop-blur-sm">
                                    <div className="bg-blue-100 p-2 rounded-lg mt-1">
                                        <span className="text-blue-600 font-bold text-sm">•</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
                                            ALISHER NAVOIY NOMIDAGI O'ZBEKISTON MILLIY KUTUBXONASI FILIALI
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Universitetimizda milliy kutubxona filialining zamonaviy resurs markazi
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-white/50 rounded-xl backdrop-blur-sm">
                                    <div className="bg-blue-100 p-2 rounded-lg mt-1">
                                        <span className="text-blue-600 font-bold text-sm">•</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-700">
                                            Elektron kutubxonada oliy ta'lim o'quv adabiyotlari va ilmiy maqolalari jamlangan
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>




                    </div>

                    {/* Right side - Library images */}
                    <div className="lg:w-1/3">
                        {/* Main library image with overlay */}
                        <div className="group relative h-56 sm:h-64 md:h-72 rounded-2xl shadow-xl overflow-hidden mb-4 sm:mb-6">
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                style={{ backgroundImage: `url(${library1})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <h3 className="text-lg sm:text-xl font-bold mb-2">Zamonaviy Kutubxona</h3>
                                    <p className="text-sm sm:text-base opacity-90">Buxoro Xalqaro Universitetining elektron resurs markazi</p>
                                </div>
                            </div>
                        </div>

                        {/* Second library card */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6 group hover:shadow-xl transition-shadow duration-300">
                            <div className="relative overflow-hidden">
                                <img
                                    src={library2}
                                    alt="Ilmiy adabiyotlar"
                                    className="w-full h-48 sm:h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <FiBook className="text-blue-600 inline mr-1" />
                                    <span className="text-sm font-medium text-gray-800">1000+</span>
                                </div>
                            </div>
                            <div className="p-4 sm:p-5">
                                <h4 className="font-semibold text-gray-800 text-lg mb-2 flex items-center gap-2">
                                    <FiBook className="text-blue-500" />
                                    Ilmiy adabiyotlar to'plami
                                </h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    Har xil fanlar bo'yicha elektron kitoblar va ilmiy maqolalar
                                </p>
                                <div className="flex items-center text-sm text-gray-500">
                                    <FiUsers className="mr-1" />
                                    <span>Talabalar uchun ochiq kirish</span>
                                </div>
                            </div>
                        </div>



                    </div>


                </div>
                {/* Third library card */}

                <div className="group relative mt-4 h-96 sm:h-96 md:h-96 rounded-2xl shadow-xl overflow-hidden mb-4 sm:mb-6">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url(${library3})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <h3 className="text-lg sm:text-xl font-bold mb-2"> O'quv jarayoni</h3>
                            <p className="text-sm sm:text-base opacity-90"> Talabalar uchun qulay o'qish joylari va zamonaviy interaktiv resurslar</p>
                            <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                24/7 Ochiq kirish
                            </div>
                        </div>
                    </div>
                </div>


            </div>

            {/* Custom CSS */}
            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

            <style jsx>{`
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
    );
};

export default Hero;