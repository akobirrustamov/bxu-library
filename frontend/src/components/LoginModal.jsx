import React from "react";

const LoginModal = ({
  show,
  onClose,
  onSubmit,
  login,
  setLogin,
  password,
  setPassword,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 md:w-2/3 lg:w-1/2 max-w-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              Kitobni yuklab olish uchun HEMIS Student login parolini kiriting.
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              type="text"
              placeholder="Talaba ID"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              required
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Parol"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              required
            />
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg"
              >
                Kirish
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg"
              >
                Bekor qilish
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
