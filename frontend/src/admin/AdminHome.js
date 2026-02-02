import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

import ApiCall, {baseUrl} from "../config";
import {
    FiBook,
    FiUsers,
    FiDownload,
    FiLink,
    FiBarChart2,
    FiBookOpen,
    FiTrendingUp,
    FiCalendar,
    FiFilter,
    FiChevronRight,
    FiActivity,
    FiEye,
    FiPlus,
    FiGrid,
    FiClock,
    FiUserPlus,
    FiFileText,
    FiDatabase,
    FiAward
} from "react-icons/fi";
import {FaGraduationCap, FaBookReader, FaUniversity, FaChartLine, FaFileAudio} from "react-icons/fa";
import {useNavigate} from "react-router-dom";
import {FaBookAtlas, FaBookBible} from "react-icons/fa6";

function AdminHome() {
    const [isVisible, setIsVisible] = useState(false);
    const [textIndex, setTextIndex] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const fullText = "Admin Paneliga xush kelibsiz!";
    const [eduFacultyStats, setEduFacultyStats] = useState([]);
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        booksCount: 0,
        facultiesCount: 0,
        subjectsCount: 0,
        facultySubjectsCount: 0,
        last7DaysBooks: 0,
        unassignedSubjects: 0,
        facultiesByEducationType: [],
        subjectsPerFaculty: [],
    });



    const [loading, setLoading] = useState(true);
    const [cardAnimations, setCardAnimations] = useState([false, false, false, false]);

    /* =========================
       ANIMATIONS
    ========================= */
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isVisible && textIndex < fullText.length) {
            const timer = setTimeout(() => {
                setDisplayText(fullText.substring(0, textIndex + 1));
                setTextIndex(textIndex + 1);
            }, 60);
            return () => clearTimeout(timer);
        }
    }, [isVisible, textIndex]);

    useEffect(() => {
        if (isVisible) {
            const timers = cardAnimations.map((_, index) => {
                return setTimeout(() => {
                    setCardAnimations(prev => {
                        const newAnimations = [...prev];
                        newAnimations[index] = true;
                        return newAnimations;
                    });
                }, index * 150);
            });

            return () => timers.forEach(timer => clearTimeout(timer));
        }
    }, [isVisible]);

    /* =========================
       FETCH STATISTICS
    ========================= */
    useEffect(() => {
        ApiCall("/api/v1/statistic", "GET")
            .then((res) => {
                if (!res?.error) {
                    setStats(res.data);
                    console.log(res.data)
                }
            })
            .catch((error) => {
                console.error("Error fetching statistics:", error);
            })
            .finally(() => {
                setTimeout(() => setLoading(false), 1000);
            });
    }, []);
    useEffect(() => {
        ApiCall("/api/v1/statistic/education-type-faculty-stats", "GET")
            .then(res => {
                if (!res?.error) {
                    setEduFacultyStats(res.data);
                }
            })
            .catch(err => {
                console.error("Error fetching education-type stats", err);
            });
    }, []);

    /* =========================
       COMPONENTS
    ========================= */
    const StatCard = ({ title, value, icon, color, trend, delay, suffix = "" }) => (
        <div className={`
      bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-500 transform
      ${cardAnimations[delay] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      hover:-translate-y-1 border border-white/20
      relative overflow-hidden group
    `}>
            {/* Background gradient */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${color}`}></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={`
            p-3 rounded-xl ${color} bg-opacity-10
            transform transition-transform duration-300 group-hover:scale-110
          `}>
                        <div className={`text-2xl ${color.replace('bg-', 'text-')}`}>
                            {icon}
                        </div>
                    </div>
                    <div className={`
            flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full
            animate-pulse
          `}>
                        <FiTrendingUp /> <span>+{trend}</span>
                    </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1 animate-count-up">
                    {Number(value).toLocaleString()}{suffix}
                </h3>
                <p className="text-gray-600">{title}</p>

                {/* Progress bar */}
                <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${color.replace('bg-', 'bg-')} rounded-full transition-all duration-1000`}
                        style={{ width: `${Math.min(Number(value) * 2, 100)}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );

    const ActivityItem = ({ activity, index }) => (
        <div className={`
      flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-all duration-300 transform hover:scale-[1.02]
      ${cardAnimations[0] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
      delay-${index * 100}
    `}>
            <div className={`
        w-10 h-10 rounded-full flex items-center justify-center
        bg-${activity.color}-100 text-${activity.color}-600
        transform transition-transform duration-300 hover:rotate-12
      `}>
                <FiActivity />
            </div>
            <div className="flex-1">
                <p className="text-gray-900">
                    <span className="font-semibold">{activity.user}</span>{" "}
                    <span className="font-semibold text-indigo-600">{activity.item}</span> ni {activity.action}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                    <FiClock className="w-3 h-3" />
                    {activity.time}
                </p>
            </div>
            <FiChevronRight className="text-gray-400 group-hover:text-gray-600 transition" />
        </div>
    );

    async function downloadHisobot() {
        setLoading(true);
        try {
            const response = await fetch(
                `${baseUrl}/api/v1/books/hisobot`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`, // agar auth bo‘lsa
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Excel yuklab bo‘lmadi");
            }

            const blob = await response.blob();

            // 🔽 Fayl yaratamiz
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "books_report.xlsx";
            document.body.appendChild(a);
            a.click();

            // tozalash
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Error downloading excel:", error);
            alert("Hisobotni yuklab bo‘lmadi");
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <Sidebar />

            <main className="lg:ml-72 p-4 md:p-6 relative z-10">
                {/* Animated Header */}
                <header className="mb-12">
                    <div className="relative overflow-hidden">
                        {/* Gradient background animation */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 animate-gradient"></div>

                        <div className={`
              relative transition-all duration-1000 ease-in-out
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}>
                            {/* Main text animation */}
                            <h1 className="
                min-h-[80px] md:min-h-[100px]
                flex justify-center items-center
                text-2xl md:text-4xl lg:text-5xl
                font-bold text-gray-900 mb-2
                px-4 text-center
              ">
                                {displayText}
                                <span className="
                  text-blue-600
                  animate-blink
                ">|</span>
                            </h1>

                            {/* Subtitle animation */}
                            <p className={`
                text-lg md:text-xl text-gray-600 text-center
                transition-all duration-1000 delay-800
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}>
                                Buxoro Xalqaro Universiteti Kutubxona Tizimi
                            </p>

                            {/* Decorative line animation */}
                            <div className={`
                h-1 w-0 mx-auto mt-6
                bg-gradient-to-r from-transparent via-blue-600 to-transparent
                transition-all duration-2000 delay-1000
                ${isVisible ? 'w-32 md:w-48 opacity-100' : 'opacity-0'}
              `}></div>
                        </div>
                    </div>
                </header>

                {/* Stats Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard
                        title="Jami Kitoblar"
                        value={stats.booksCount}
                        icon={<FiBook />}
                        color="bg-blue-500"
                        trend={stats.last7DaysBooks}
                        delay={0}
                    />

                    <StatCard
                        title="Biriktirilgan Fanlar"
                        value={stats.facultySubjectsCount}
                        icon={<FiBookOpen />}
                        color="bg-green-500"
                        trend={stats.subjectsPerFaculty?.length || 0}
                        delay={1}
                    />

                    <StatCard
                        title="Barcha Fanlar"
                        value={stats.subjectsCount}
                        icon={<FaGraduationCap />}
                        color="bg-purple-500"
                        trend={stats.unassignedSubjects}
                        delay={2}
                    />

                    <StatCard
                        title="Fakultetlar"
                        value={stats.facultiesCount}
                        icon={<FaUniversity />}
                        color="bg-orange-500"
                        trend={stats.facultiesByEducationType?.length || 0}
                        delay={3}
                    />
                    <StatCard
                        title="Kutubxonadagi kitoblar soni"
                        value={stats?.booksLibraryCount}
                        icon={<FaBookReader />}
                        color="bg-orange-500"
                        trend={stats.booksLibraryCount?.length || 0}
                        delay={3}
                    />
                    <StatCard
                        title="Badiiy kitoblar soni"
                        value={stats?.badiiyCount}
                        icon={<FaBookAtlas />}
                        color="bg-orange-500"
                        trend={stats.badiiyCount?.length || 0}
                        delay={3}
                    />

                    <StatCard
                        title="Audio kitoblar soni"
                        value={stats?.audioCount}
                        icon={<FaFileAudio />}
                        color="bg-orange-500"
                        trend={stats.audioCount?.length || 0}
                        delay={3}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">






                    <div className={` lg:col-span-3
                            bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6
                            transition-all duration-700 delay-400
                            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                            border border-white/20
                          `}>
                        <div className="flex items-center justify-between mb-6">



                            <div className="space-y-6">
                                {eduFacultyStats.map((edu, idx) => (
                                    <div key={idx}

                                         className="border rounded-xl p-4 bg-gray-50">
                                        {/* Education Type */}
                                        <h3 className="text-lg font-bold text-indigo-700 mb-4 flex items-center gap-2">
                                            <FaGraduationCap />
                                            {edu.educationTypeName}
                                        </h3>

                                        {/* Faculties */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {edu.faculties.map((fac) => (
                                                <div
                                                    key={fac.facultyId}
                                                    onClick={() => navigate(`/admin/faculty-statistic/${fac.facultyId}`)}
                                                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                                                >
                                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                        <FaUniversity className="text-blue-600" />
                                                        {fac.facultyName}
                                                    </h4>

                                                    <div className="grid grid-cols-3 gap-3 text-center">
                                                        <div className="bg-blue-50 rounded-lg p-2">
                                                            <p className="text-sm text-gray-500">Fanlar</p>
                                                            <p className="text-xl font-bold text-blue-700">
                                                                {fac.subjectsCount}
                                                            </p>
                                                        </div>

                                                        <div className="bg-green-50 rounded-lg p-2">
                                                            <p className="text-sm text-gray-500">Elektron Kitoblar</p>
                                                            <p className="text-xl font-bold text-green-700">
                                                                {fac.booksCount}
                                                            </p>
                                                        </div>

                                                        <div className="bg-purple-50 rounded-lg p-2">
                                                            <p className="text-sm text-gray-500">Kutubxonada mavjud</p>
                                                            <p className="text-xl font-bold text-purple-700">
                                                                {fac.libraryCountTotal}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>



                        </div>




                    </div>













                </div>




                {/* Quick Actions */}
                <div className={`mb-4
                                bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6
                                transition-all duration-700 delay-200
                                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                                border border-white/20
                              `}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                            <FiGrid className="text-white text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Tezkor Amallar</h2>
                            <p className="text-gray-600 text-sm mt-1">Tizimni tez boshqarish</p>
                        </div>
                    </div>


                    <div>
                        <button onClick={()=>downloadHisobot()} className={"p-4 bg-blue-700 rounded-2xl text-white"}>
                            Hisobot yuklab olish
                        </button>
                    </div>
                    <div className="grid grid-cols-1 my-4 md:grid-cols-4 gap-4">
                        {[
                            { icon: <FiBook />, label: "Yangi Kitob", desc: "Elektron kitob qo'shish", color: "blue", link: "/admin/books" },
                            { icon: <FiUsers />, label: "Yangi Fakultet", desc: "Fakultet yaratish", color: "green", link: "/admin/faculty" },
                            { icon: <FiFileText />, label: "Yangi Fan", desc: "Fan yaratish", color: "purple", link: "/admin/subjects" },
                            { icon: <FiLink />, label: "Fan Biriktirish", desc: "Fakultetga fan biriktirish", color: "orange", link: "/admin/faculty-subjects" },
                        ].map((action, index) => (
                            <a
                                key={index}
                                href={action.link}
                                className={`
                                            flex items-center gap-4 p-4 
                                            bg-${action.color}-50 hover:bg-${action.color}-100 
                                            text-${action.color}-700 rounded-xl transition-all duration-300
                                            transform hover:-translate-y-0.5 hover:shadow-lg
                                            ${cardAnimations[0] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
                                            delay-${index * 100}
                                            group
                                          `}
                            >
                                <div className={`
                                                p-3 bg-${action.color}-100 rounded-lg
                                                transform transition-transform duration-300 group-hover:scale-110
                                              `}>
                                    {action.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{action.label}</p>
                                    <p className="text-sm opacity-75">{action.desc}</p>
                                </div>
                                <FiChevronRight className="ml-auto opacity-0 group-hover:opacity-100 transition" />
                            </a>
                        ))}
                    </div>
                </div>




                {/* Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Education Type Distribution */}
                    <div className={`
            bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6
            transition-all duration-700 delay-600
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            border border-white/20
          `}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                                <FaChartLine className="text-white text-xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Ta'lim Turlari</h2>
                                <p className="text-gray-600 text-sm mt-1">Fakultetlar taqsimoti</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {stats.facultiesByEducationType?.map((type, index) => {
                                const name = type[0];   // "Bakalavr"
                                const count = type[1];  // 6

                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-700">
            {name}
          </span>
                                            <span className="text-sm font-semibold text-gray-900">
            {count} ta
          </span>
                                        </div>

                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${
                                                    index % 2 === 0
                                                        ? "bg-gradient-to-r from-blue-500 to-blue-600"
                                                        : "bg-gradient-to-r from-green-500 to-green-600"
                                                } rounded-full`}
                                                style={{
                                                    width: `${stats.facultiesCount
                                                        ? (count / stats.facultiesCount) * 100
                                                        : 0}%`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>

                    {/* Quick Stats */}
                    <div className={`
            bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-6
            transition-all duration-700 delay-800
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            border border-white/20
          `}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                                <FiDatabase className="text-white text-xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Tizim Ma'lumotlari</h2>
                                <p className="text-gray-600 text-sm mt-1">Umumiy statistikalar</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FiUserPlus className="text-blue-500" />
                                    <span className="text-sm font-medium text-gray-700">O'rtacha kitob/fan</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.facultiesCount > 0 ? (stats.booksCount / stats.facultiesCount).toFixed(1) : 0}
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FiAward className="text-green-500" />
                                    <span className="text-sm font-medium text-gray-700">Faollik</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.last7DaysBooks}
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FiEye className="text-purple-500" />
                                    <span className="text-sm font-medium text-gray-700">Biriktirish %</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.facultiesCount > 0 ? (stats.facultySubjectsCount / stats.subjectsCount).toFixed(1) : 0}%

                                    {/*{stats.subjectsCount > 0 ? ((stats.facultySubjectsCount / stats.subjectsCount) * 100).toFixed(0)}%*/}
                                </p>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FiClock className="text-orange-500" />
                                    <span className="text-sm font-medium text-gray-700">O'rtacha fanlar</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                {stats.facultiesCount > 0 ? (stats.facultySubjectsCount / stats.subjectsCount).toFixed(1) : 0}

                                {/*    {stats.facultiesCount > 0 ? (stats.facultySubjectsCount / stats.facultiesCount).toFixed(1)}*/}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="
            bg-white p-8 rounded-2xl shadow-2xl
            transform transition-all duration-300
            animate-bounce-in
          ">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-blue-400 opacity-75"></div>
                        </div>
                        <div className="text-center mt-4">
                            <p className="text-gray-700 font-medium">Ma'lumotlar yuklanmoqda...</p>
                            <p className="text-sm text-gray-500 mt-1">Iltimos kuting</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom CSS Animations */}
            <style jsx>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes count-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounce-in {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.05); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }

                .animate-blink {
                    animation: blink 1s infinite;
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 15s ease infinite;
                }
                .animate-count-up {
                    animation: count-up 1s ease-out;
                }
                .animate-bounce-in {
                    animation: bounce-in 0.5s ease-out;
                }

                /* Smooth transitions */
                * {
                    transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 300ms;
                }
            `}</style>
        </div>
    );
}

export default AdminHome;