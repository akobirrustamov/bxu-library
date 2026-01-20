import React, { useState, useEffect, useRef } from "react";
import library1 from "../assets/library1.jpg";
import library2 from "../assets/library2.jpg";
import library3 from "../assets/library3.jpg";
import { FiSearch, FiChevronDown, FiChevronUp, FiCheck, FiBookOpen, FiBook, FiUsers } from "react-icons/fi";
import ApiCall from "../config"
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
            const found = options.find(opt => opt.id === value || opt.value === value);
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
        const name = option.name || option.label || option.subject?.name || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleSelect = (option) => {
        onChange(option.id || option.value || option.subject?.id);
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
          {selectedOption ? (selectedOption.name || selectedOption.label || selectedOption.subject?.name) : placeholder}
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
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = selectedOption?.id === option.id ||
                                    selectedOption?.value === option.value ||
                                    selectedOption?.subject?.id === option.subject?.id;
                                const optionName = option.name || option.label || option.subject?.name;

                                return (
                                    <button
                                        key={option.id || option.value || option.subject?.id}
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

const Hero = ({
                  educationType,
                  faculties,
                  subjects,
                  handleEducationTypeChange,
                  handleFacultyChange,
                  handleSubjectChange,
              }) => {
    const educationOptions = [
        { id: "1", name: "Bakalavr" },
        { id: "2", name: "Magistr" }
    ];

    const facultyOptions = faculties.map(f => ({
        id: f.id,
        name: f.name
    }));

    const subjectOptions = subjects.map(s => ({
        id: s.subject.id,
        name: s.subject.name
    }));

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
                            <div className="space-y-4 sm:space-y-6">
                                <SearchableSelect
                                    label="Ta'lim turini tanlang"
                                    value={educationType}
                                    options={educationOptions}
                                    onChange={handleEducationTypeChange}
                                    placeholder="Masalan: Bakalavr"
                                    searchPlaceholder="Ta'lim turini qidirish..."
                                />

                                <SearchableSelect
                                    label="Yo'nalishingizni tanlang"
                                    value=""
                                    options={facultyOptions}
                                    onChange={handleFacultyChange}
                                    disabled={!educationType}
                                    placeholder="Masalan: Kompyuter injiniringi"
                                    searchPlaceholder="Yo'nalishni qidirish..."
                                />

                                <SearchableSelect
                                    label="Fanni tanlang"
                                    value=""
                                    options={subjectOptions}
                                    onChange={handleSubjectChange}
                                    disabled={!educationType || faculties.length === 0}
                                    placeholder="Masalan: Dasturlash asoslari"
                                    searchPlaceholder="Fanni qidirish..."
                                />
                            </div>

                            {/* Action button */}
                            <div className="mt-8">
                                <button
                                    className={`w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 ${(!educationType || faculties.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={!educationType || faculties.length === 0}
                                >
                                    <FiBookOpen className="text-lg" />
                                    Kitoblarni ko'rish
                                </button>
                            </div>
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

                        {/* Third library card */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                            <div className="relative overflow-hidden">
                                <img
                                    src={library3}
                                    alt="O'quv jarayoni"
                                    className="w-full h-48 sm:h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-4 sm:p-5">
                                <h4 className="font-semibold text-gray-800 text-lg mb-2 flex items-center gap-2">
                                    <FiUsers className="text-green-500" />
                                    O'quv jarayoni
                                </h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    Talabalar uchun qulay o'qish joylari va zamonaviy interaktiv resurslar
                                </p>
                                <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                    24/7 Ochiq kirish
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add custom animations to tailwind config */}
            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .scrollbar-thin {
          scrollbar-width: thin;
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
      `}</style>
        </div>
    );
};

export default Hero;