import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiCall from "../config";
import Sidebar from "./Sidebar";
import { FaUniversity } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function AdminFacultyDetails() {
    const { facultyId } = useParams();
    const navigate = useNavigate();

    const [facultyName, setFacultyName] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        ApiCall(`/api/v1/statistic/faculty/${facultyId}/subjects`, "GET")
            .then(res => {
                if (!res?.error) {
                    setFacultyName(res.data.facultyName);
                    setSubjects(res.data.subjects || []);
                }
            })
            .catch(err => {
                console.error("Error loading faculty details:", err);
            })
            .finally(() => setLoading(false));
    }, [facultyId]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
            {/* Animated background blobs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <Sidebar />

            <main className="lg:ml-72 p-4 md:p-6 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
                            <FaUniversity size={22} />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            {facultyName || "Fakultet"}
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        Fakultet fanlari bo‘yicha elektron kitoblar va kutubxona statistikasi
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Subjects Grid */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.length === 0 && (
                            <div className="col-span-full text-center text-gray-500 py-10">
                                Bu fakultetga fanlar biriktirilmagan
                            </div>
                        )}

                        {subjects.map((sub) => (
                            <div
                                key={sub.subjectId}
                                onClick={() => navigate(`/admin/subject/${sub.subjectId}`)}
                                className="
                                    bg-white/95 backdrop-blur-sm rounded-2xl p-5
                                    shadow-lg hover:shadow-xl transition-all duration-300
                                    border border-white/20
                                    transform hover:-translate-y-1
                                    cursor-pointer
                                "
                                                        >

                            {/* Subject name */}
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    {sub.subjectName}
                                </h2>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                                        <p className="text-sm text-gray-500 mb-1">
                                            Elektron kitoblar
                                        </p>
                                        <p className="text-2xl font-bold text-blue-700">
                                            {sub.booksCount}
                                        </p>
                                    </div>

                                    <div className="bg-green-50 rounded-xl p-3 text-center">
                                        <p className="text-sm text-gray-500 mb-1">
                                            Kutubxonada mavjud
                                        </p>
                                        <p className="text-2xl font-bold text-green-700">
                                            {sub.libraryCountTotal}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Animations */}
            <style jsx>{`
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
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}
