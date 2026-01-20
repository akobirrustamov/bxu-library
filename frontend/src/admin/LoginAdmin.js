import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogIn, FiEye, FiEyeOff, FiLock, FiUser, FiBook, FiChevronRight } from "react-icons/fi";
import { FaUniversity, FaGraduationCap } from "react-icons/fa";
import ApiCall from "../config/index";

const LoginStudent = () => {
  const [adminData, setAdminData] = useState({
    phone: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleAdminChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdminData({
      ...adminData,
      [name]: type === "checkbox" ? checked : value
    });
    setError(""); // Clear error on input change
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validation
    if (!adminData.phone.trim() || !adminData.password.trim()) {
      setError("Iltimos, barcha maydonlarni to'ldiring");
      setIsLoading(false);
      return;
    }

    try {
      const response = await ApiCall(
          "/api/v1/auth/login",
          "POST",
          adminData,
          null,
          false
      );

      // Clear previous tokens
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      if (response.data.refresh_token) {
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);
      } else {
        localStorage.setItem("access_token", response.data.access_token);
      }

      // Navigating based on user roles
      const roles = response.data.roles || [];

      if (roles[0]?.name === "ROLE_ADMIN" && response.error === false) {
        navigate("/admin/dashboard");
      } else if (roles[0]?.name === "ROLE_INTERNATIONAL" && response.error === false) {
        navigate("/international/admin/news");
      } else {
        setError("Foydalanuvchi huquqlari aniqlanmadi");
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError("Login yoki parol noto'g'ri");
      } else if (error.response?.status === 404) {
        setError("Serverga ulanishda muammo");
      } else {
        setError("Tizimda xatolik yuz berdi");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className={`
            transition-all duration-1000 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}>
              {/* Header Section */}
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                    <FaUniversity className="text-white text-3xl" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Buxoro Xalqaro Universiteti
                    </h1>
                    <p className="text-gray-600 mt-2 text-lg">Elektron Kutubxona Tizimi</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                  <FiBook className="text-blue-600" />
                  <span className="text-blue-700 font-medium">Admin Panel</span>
                  <FiChevronRight className="text-blue-500" />
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Side - Information */}
                <div className={`
                transition-all duration-1000 delay-200
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
              `}>
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                          <FaGraduationCap className="text-blue-600 text-2xl" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Zamonaviy Boshqaruv</h3>
                          <p className="text-gray-600 mt-1">Kutubxona resurslarini samarali boshqaring</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                          <FiBook className="text-green-600 text-2xl" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">1000+ Elektron Kitob</h3>
                          <p className="text-gray-600 mt-1">Har xil fanlar bo'yicha elektron resurslar</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                          <FiUser className="text-purple-600 text-2xl" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Xavfsiz Kirish</h3>
                          <p className="text-gray-600 mt-1">Maxfiy ma'lumotlaringiz himoyalangan</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-10 grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-gradient-to-b from-blue-50 to-white rounded-2xl">
                        <div className="text-3xl font-bold text-blue-600">24/7</div>
                        <div className="text-sm text-gray-600">Ish vaqti</div>
                      </div>
                      <div className="p-4 bg-gradient-to-b from-green-50 to-white rounded-2xl">
                        <div className="text-3xl font-bold text-green-600">1000+</div>
                        <div className="text-sm text-gray-600">Kitoblar</div>
                      </div>
                      <div className="p-4 bg-gradient-to-b from-purple-50 to-white rounded-2xl">
                        <div className="text-3xl font-bold text-purple-600">5000+</div>
                        <div className="text-sm text-gray-600">Foydalanuvchi</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Login Form */}
                <div className={`
                transition-all duration-1000 delay-400
                ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
              `}>
                  <div className="relative">
                    {/* Form Container */}
                    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/30">
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
                          <FiLogIn className="text-white text-2xl" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Admin Paneliga Kirish</h2>
                        <p className="text-gray-600 mt-2">Super admin hisobingiz bilan tizimga kiring</p>
                      </div>

                      {error && (
                          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <div className="flex items-center gap-2 text-red-700">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium">{error}</span>
                            </div>
                          </div>
                      )}

                      <form onSubmit={handleAdminSubmit} className="space-y-6">
                        {/* Phone/Username Input */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FiUser className="text-blue-600" />
                            Admin login
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                                type="text"
                                name="phone"
                                value={adminData.phone}
                                onChange={handleAdminChange}
                                placeholder="Foydalanuvchi nomi"
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 outline-none"
                                disabled={isLoading}
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FiLock className="text-blue-600" />
                            Parol
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={adminData.password}
                                onChange={handleAdminChange}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 outline-none"
                                disabled={isLoading}
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                              {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={adminData.rememberMe}
                                onChange={handleAdminChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                disabled={isLoading}
                            />
                            <span className="text-sm text-gray-600">Eslab qolish</span>
                          </label>
                          <button
                              type="button"
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition"
                              onClick={() => {/* Add forgot password logic */}}
                          >
                            Parolni unutdingizmi?
                          </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`
                          w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 
                          text-white font-semibold rounded-xl shadow-lg
                          hover:shadow-xl transform hover:-translate-y-0.5
                          transition-all duration-300 flex items-center justify-center gap-3
                          ${isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:from-blue-700 hover:to-indigo-700'}
                        `}
                        >
                          {isLoading ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Kirilmoqda...
                              </>
                          ) : (
                              <>
                                <FiLogIn className="text-xl" />
                                Tizimga Kirish
                              </>
                          )}
                        </button>
                      </form>

                      {/* Footer Note */}
                      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500">
                          © {new Date().getFullYear()} BXU Kutubxona Tizimi. Barcha huquqlar himoyalangan.
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Versiya 2.1.0 • HTTPS qo'llab-quvvatlanadi
                        </p>
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -z-10 -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full opacity-20 blur-xl"></div>
                    <div className="absolute -z-10 -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-indigo-500 to-purple-300 rounded-full opacity-20 blur-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Animations */}
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
};

export default LoginStudent;