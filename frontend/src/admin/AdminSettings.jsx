import React, { useState } from "react";
import { FiLock, FiEye, FiEyeOff, FiShield, FiCheck, FiAlertCircle } from "react-icons/fi";
import Sidebar from "./Sidebar";
import ApiCall from "../config/index";

function AdminSettings() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage(null);
  };

  const toggleShow = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      setMessage({ type: "error", text: "Barcha maydonlarni to'ldiring" });
      return;
    }
    if (form.newPassword.length < 6) {
      setMessage({ type: "error", text: "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak" });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: "Yangi parollar mos kelmaydi" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await ApiCall("/api/v1/auth/change-password", "PUT", {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });

      if (res && !res.error) {
        setMessage({ type: "success", text: "Parol muvaffaqiyatli o'zgartirildi" });
        setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const errText =
          typeof res?.data === "string"
            ? res.data
            : "Eski parol noto'g'ri yoki xatolik yuz berdi";
        setMessage({ type: "error", text: errText });
      }
    } catch {
      setMessage({ type: "error", text: "Server bilan bog'lanishda xatolik" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6">
        <div className="max-w-xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FiShield className="text-blue-600" />
              Sozlamalar
            </h1>
            <p className="text-gray-500 mt-1">Hisob xavfsizligini boshqaring</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FiLock className="text-blue-600" />
              Parolni o'zgartirish
            </h2>

            {message && (
              <div
                className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                  message.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {message.type === "success" ? (
                  <FiCheck className="flex-shrink-0" />
                ) : (
                  <FiAlertCircle className="flex-shrink-0" />
                )}
                <span className="font-medium">{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Joriy parol */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FiLock className="text-blue-600" />
                  Joriy parol
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.old ? "text" : "password"}
                    name="oldPassword"
                    value={form.oldPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow("old")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPasswords.old ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* Yangi parol */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FiLock className="text-blue-600" />
                  Yangi parol
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow("new")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* Tasdiqlash */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FiLock className="text-blue-600" />
                  Yangi parolni tasdiqlang
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow("confirm")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 ${
                  isLoading ? "opacity-75 cursor-not-allowed" : "hover:from-blue-700 hover:to-indigo-700"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  <>
                    <FiCheck />
                    Parolni saqlash
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminSettings;
