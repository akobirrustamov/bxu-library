import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ApiCall from "../config";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from "react-icons/fi";

const AdminShelves = () => {
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newShelfName, setNewShelfName] = useState("");
  const [editShelfId, setEditShelfId] = useState(null);
  const [editShelfName, setEditShelfName] = useState("");
  const [error, setError] = useState("");
  const [shelfDetailModalOpen, setShelfDetailModalOpen] = useState(false);
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [shelfDetail, setShelfDetail] = useState([]);
  const [shelfDetailLoading, setShelfDetailLoading] = useState(false);
  const [shelfDetailError, setShelfDetailError] = useState("");

  const normalizeShelfName = (value) => {
    if (!value) return null;
    const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
    return /^[A-Z]\d+$/.test(normalized) ? normalized : null;
  };

  const loadShelves = async () => {
    setLoading(true);
    try {
      const res = await ApiCall("/api/v1/books/shelves", "GET");
      if (!res?.error) {
        setShelves(res.data || []);
      }
    } catch (err) {
      console.error("Error loading shelves:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShelves();
  }, []);

  const resetForm = () => {
    setNewShelfName("");
    setEditShelfId(null);
    setEditShelfName("");
    setError("");
  };

  const handleCreateShelf = async () => {
    const normalized = normalizeShelfName(newShelfName);
    if (!normalized) {
      setError("Polka nomi A1, B2 kabi bo'lishi kerak.");
      return;
    }

    try {
      const res = await ApiCall("/api/v1/books/shelves", "POST", { name: normalized });
      if (res?.error) {
        setError(res.data || "Polka yaratishda xato yuz berdi.");
        return;
      }
      setShelves((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      resetForm();
    } catch (err) {
      console.error("Error creating shelf:", err);
      setError("Polka yaratishda xato yuz berdi.");
    }
  };

  const openShelfDetailModal = async (shelf) => {
    setSelectedShelf(shelf);
    setShelfDetail([]);
    setShelfDetailError("");
    setShelfDetailLoading(true);

    try {
      const params = shelf.id ? { shelfId: shelf.id } : { shelfName: shelf.name };
      const res = await ApiCall("/api/v1/books/shelf-report", "GET", null, params);
      if (!res?.error) {
        setShelfDetail(res.data || []);
      } else {
        setShelfDetailError(res.data || "Shelf detail loading error");
      }
    } catch (err) {
      console.error("Error loading shelf detail:", err);
      setShelfDetailError("Shelf detail loading error");
    } finally {
      setShelfDetailLoading(false);
      setShelfDetailModalOpen(true);
    }
  };

  const handleEditShelf = (shelf) => {
    setEditShelfId(shelf.id);
    setEditShelfName(shelf.name);
    setError("");
  };

  const handleSaveShelf = async () => {
    if (!editShelfId) return;
    const normalized = normalizeShelfName(editShelfName);
    if (!normalized) {
      setError("Polka nomi A1, B2 kabi bo'lishi kerak.");
      return;
    }

    try {
      const res = await ApiCall(`/api/v1/books/shelves/${editShelfId}`, "PUT", { name: normalized });
      if (res?.error) {
        setError(res.data || "Polkani yangilashda xato yuz berdi.");
        return;
      }
      setShelves((prev) => [
        ...prev.filter((item) => item.id !== editShelfId),
        res.data,
      ].sort((a, b) => a.name.localeCompare(b.name)));
      resetForm();
    } catch (err) {
      console.error("Error updating shelf:", err);
      setError("Polkani yangilashda xato yuz berdi.");
    }
  };

  const handleDeleteShelf = async (id, name) => {
    if (!window.confirm(`${name} polkasini o'chirishni xohlaysizmi?`)) return;
    try {
      const res = await ApiCall(`/api/v1/books/shelves/${id}`, "DELETE");
      if (res?.error) {
        setError(res.data || "Polkani o'chirishda xato yuz berdi.");
        return;
      }
      setShelves((prev) => prev.filter((item) => item.id !== id));
      if (editShelfId === id) resetForm();
    } catch (err) {
      console.error("Error deleting shelf:", err);
      setError("Polkani o'chirishda xato yuz berdi.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar />
      <div className="lg:ml-72">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Javonlar boshqaruvi</h1>
              <p className="text-gray-600 mt-2">Bu yerda javonlarni yaratish, tahrirlash va o'chirish mumkin.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Javonlar ro'yxati</h2>
                  <p className="text-sm text-gray-500 mt-1">Umumiy {shelves.length} javon</p>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>
              ) : shelves.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Hozircha javonlar mavjud emas.</div>
              ) : (
                <div className="space-y-3">
                  {shelves.map((shelf) => (
                    <div key={shelf.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-3xl border border-gray-200 bg-gray-50 p-4">
                      <div>
                        <button
                          type="button"
                          onClick={() => openShelfDetailModal(shelf)}
                          className="text-left text-lg font-semibold text-gray-900 hover:text-blue-600 transition"
                        >
                          {shelf.name}
                        </button>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                          <span>ID: {shelf.id ?? "-"}</span>
                          <span>Kitoblar: {shelf.count ?? 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditShelf(shelf)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600 transition"
                        >
                          <FiEdit2 /> Tahrirlash
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteShelf(shelf.id, shelf.name)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
                        >
                          <FiTrash2 /> O'chirish
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{editShelfId ? "Javonni tahrirlash" : "Yangi javon"}</h2>
                {editShelfId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <FiX /> Bekor
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Javon nomi</label>
                  <input
                    value={editShelfId ? editShelfName : newShelfName}
                    onChange={(e) => editShelfId ? setEditShelfName(e.target.value) : setNewShelfName(e.target.value)}
                    placeholder="Masalan: A1"
                    className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {error && <div className="text-sm text-red-600">{error}</div>}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={editShelfId ? handleSaveShelf : handleCreateShelf}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  >
                    <FiSave /> {editShelfId ? "Saqlash" : "Yaratish"}
                  </button>
                  {editShelfId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                    >
                      <FiX /> Bekor
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500">
            <p>
              Javonlar sahifasi barcha javonlar boshqaruvini o'z ichiga oladi. Bu sahifada javonlar yaratiladi, nomi tahrirlanadi va kerak bo'lganda o'chiriladi.
            </p>
          </div>

          {shelfDetailModalOpen && selectedShelf && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedShelf.name} javoni</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {shelfDetailLoading
                        ? "Yuklanmoqda..."
                        : `${shelfDetail.length} turdagi kitob va jami ${shelfDetail.reduce((sum, item) => sum + item.count, 0)} nusxa`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShelfDetailModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Yopish"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-4 p-6">
                  {shelfDetailLoading ? (
                    <div className="text-center py-10 text-gray-500">Yuklanmoqda...</div>
                  ) : shelfDetailError ? (
                    <div className="text-red-600 text-sm">{shelfDetailError}</div>
                  ) : shelfDetail.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">Bu polkada mavjud kitoblar topilmadi.</div>
                  ) : (
                    <div className="space-y-3">
                      {shelfDetail.map((item, index) => (
                        <div key={`${item.title}-${index}`} className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="font-semibold text-gray-900">{item.title}</div>
                              <div className="text-sm text-gray-500">Kitob nomi</div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                              <div className="text-sm text-gray-500">Nusxa</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end border-t border-gray-200 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setShelfDetailModalOpen(false)}
                    className="rounded-2xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Yopish
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminShelves;
