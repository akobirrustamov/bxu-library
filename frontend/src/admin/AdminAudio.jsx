import React, { useEffect, useState, useRef } from "react";
import Sidebar from "./Sidebar";
import ApiCall, { baseUrl } from "../config";
import {
    FiMusic,
    FiPlus,
    FiEdit,
    FiTrash,
    FiDownload,
    FiHeadphones,
    FiUser,
    FiDatabase,
    FiPlay,
    FiEdit2,
    FiTrash2,
    FiCalendar,
    FiPause,
    FiClock,
    FiX,
    FiImage,
    FiVolume2,
    FiVolumeX
} from "react-icons/fi";
import bookImg from "../assets/newbook.jpg";

const AdminAudio = () => {
    const [audios, setAudios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentAudio, setCurrentAudio] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    const audioRef = useRef(null);
    const progressRef = useRef(null);

    const [openModal, setOpenModal] = useState(false);
    const [editId, setEditId] = useState(null);

    const [uploadProgress, setUploadProgress] = useState({
        audio: 0,
        image: 0
    });

    const [form, setForm] = useState({
        name: "",
        author: "",
        publisher: "",
        genre: "",
        description: "",
        audioFile: null,
        imageFile: null
    });

    /* =========================
       INITIALIZE AUDIO PLAYER
    ========================= */
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            audioRef.current.muted = isMuted;
        }
    }, [volume, isMuted]);

    /* =========================
       FETCH AUDIOS
    ========================= */
    useEffect(() => {
        fetchAudios();
    }, []);

    const fetchAudios = async () => {
        setLoading(true);
        try {
            const res = await ApiCall("/api/v1/book/audio", "GET", null, {
                page: 0,
                size: 100
            });
            if (!res?.error) {
                const audiosWithMetadata = await Promise.all(
                    (res.data?.content || []).map(async (audio) => {
                        if (audio.audio?.id) {
                            try {
                                const metadata = await getAudioMetadata(audio.audio.id);
                                return { ...audio, ...metadata };
                            } catch (error) {
                                console.error("Error fetching audio metadata:", error);
                                return audio;
                            }
                        }
                        return audio;
                    })
                );
                setAudios(audiosWithMetadata);
            }
        } catch (error) {
            console.error("Error fetching audios:", error);
        } finally {
            setLoading(false);
        }
    };

    /* =========================
       GET AUDIO METADATA
    ========================= */
    const getAudioMetadata = async (audioId) => {
        return new Promise((resolve, reject) => {
            const token = localStorage.getItem("authToken");
            const audioUrl = `${baseUrl}/api/v1/file/getFile/${audioId}`;
            const audio = new Audio();

            audio.preload = "metadata";
            audio.onloadedmetadata = () => {
                resolve({
                    duration: Math.floor(audio.duration),
                    size: getFileSizeFromHeaders(audio)
                });
            };

            audio.onerror = () => {
                reject(new Error("Failed to load audio metadata"));
            };

            audio.src = audioUrl;
            if (token) {
                audio.crossOrigin = "anonymous";
                audio.setAttribute("headers", `Authorization: Bearer ${token}`);
            }
        });
    };

    const getFileSizeFromHeaders = (audioElement) => {
        // In a real app, you'd get this from the server response headers
        // For now, return a placeholder or fetch it properly
        return 0;
    };

    /* =========================
       AUDIO PLAYER CONTROLS
    ========================= */
    const playAudio = (audio) => {
        if (!audio.audio?.id) return;

        const token = localStorage.getItem("authToken");
        const audioUrl = `${baseUrl}/api/v1/file/getFile/${audio.audio.id}`;

        // Create new audio element if needed
        if (!audioRef.current || currentAudio?.id !== audio.id) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }

            const newAudio = new Audio(audioUrl);
            if (token) {
                newAudio.crossOrigin = "anonymous";
                newAudio.setAttribute("headers", `Authorization: Bearer ${token}`);
            }

            newAudio.volume = volume;
            newAudio.muted = isMuted;

            newAudio.onloadedmetadata = () => {
                setDuration(Math.floor(newAudio.duration));
            };

            newAudio.ontimeupdate = () => {
                if (newAudio.duration) {
                    const current = Math.floor(newAudio.currentTime);
                    const prog = (current / newAudio.duration) * 100;
                    setCurrentTime(current);
                    setProgress(prog);
                }
            };

            newAudio.onended = () => {
                setIsPlaying(false);
                setProgress(0);
                setCurrentTime(0);
            };

            audioRef.current = newAudio;
            setCurrentAudio(audio);
        }

        if (isPlaying && currentAudio?.id === audio.id) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(error => {
                console.error("Error playing audio:", error);
                alert("Audio ni ijro etishda xatolik. Tokenni tekshiring.");
            });
        }
    };

    const pauseAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleProgressClick = (e) => {
        if (!audioRef.current || !duration) return;

        const progressBar = progressRef.current;
        const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
        const progressBarWidth = progressBar.clientWidth;
        const percentage = (clickPosition / progressBarWidth) * 100;

        const newTime = (percentage / 100) * duration;
        audioRef.current.currentTime = newTime;
        setProgress(percentage);
        setCurrentTime(Math.floor(newTime));
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
        }
    };

    /* =========================
       FORMAT FUNCTIONS
    ========================= */
    const formatDuration = (seconds) => {
        if (!seconds || isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatTime = (seconds) => {
        return formatDuration(seconds);
    };

    /* =========================
       FILE UPLOAD
    ========================= */
    const uploadFile = async (file, prefix, type) => {
        const formData = new FormData();
        formData.append("photo", file);
        formData.append("prefix", prefix);

        setUploadProgress(prev => ({ ...prev, [type]: 0 }));

        const interval = setInterval(() => {
            setUploadProgress(prev => ({
                ...prev,
                [type]: Math.min(prev[type] + 10, 90)
            }));
        }, 200);

        try {
            const res = await ApiCall(
                "/api/v1/file/upload",
                "POST",
                formData,
                null,
                true
            );

            clearInterval(interval);
            setUploadProgress(prev => ({ ...prev, [type]: 100 }));

            setTimeout(() => {
                setUploadProgress(prev => ({ ...prev, [type]: 0 }));
            }, 800);

            return res.data;
        } catch (e) {
            clearInterval(interval);
            setUploadProgress(prev => ({ ...prev, [type]: 0 }));
            throw e;
        }
    };

    /* =========================
       SAVE (POST / PUT)
    ========================= */
    const handleSave = async () => {
        if (!form.name || !form.author) {
            alert("Nomi va muallif majburiy");
            return;
        }

        let audioId = form.audioId;
        let imageId = form.imageId;

        try {
            if (form.audioFile) {
                audioId = await uploadFile(form.audioFile, "/audio", "audio");
            }

            if (form.imageFile) {
                imageId = await uploadFile(form.imageFile, "/audio-image", "image");
            }

            const payload = {
                name: form.name,
                author: form.author,
                publisher: form.publisher,
                genre: form.genre,
                description: form.description,
                audioId,
                imageId
            };

            let res;
            if (editId) {
                res = await ApiCall(`/api/v1/audio/${editId}`, "PUT", payload);
            } else {
                res = await ApiCall("/api/v1/audio", "POST", payload);
            }

            if (res?.error) {
                alert("Saqlashda xatolik");
                return;
            }

            setOpenModal(false);
            resetForm();
            fetchAudios();
        } catch (e) {
            alert("Upload xatoligi");
        }
    };

    /* =========================
       DELETE
    ========================= */
    const handleDelete = async (id, name) => {
        if (!window.confirm(`${name} audioni o'chirmoqchimisiz?`)) return;
        await ApiCall(`/api/v1/audio/${id}`, "DELETE");
        fetchAudios();
    };

    /* =========================
       DOWNLOAD
    ========================= */
    const handleDownload = async (file, name) => {
        try {
            if (!file) return alert("Fayl yo'q");

            const token = localStorage.getItem("authToken");
            const res = await fetch(
                `${baseUrl}/api/v1/file/getFile/${file}`,
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
            a.download = (name || "audio") + ".mp3";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Show success message
            const toast = document.createElement("div");
            toast.className = "fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-in";
            toast.textContent = "✅ Audio yuklab olindi!";
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);

        } catch (error) {
            console.error("Download error:", error);
            alert("Yuklab bo'lmadi: " + error.message);
        }
    };

    const resetForm = () => {
        setForm({
            name: "",
            author: "",
            publisher: "",
            genre: "",
            description: "",
            audioFile: null,
            imageFile: null,
            audioId: null,
            imageId: null
        });
        setEditId(null);
    };

    /* =========================
       RENDER
    ========================= */
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <Sidebar />

            <main className="lg:ml-72 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <FiMusic className="text-blue-600" /> Audio Kitoblar
                        </h1>
                        <p className="text-gray-600 mt-2">Barcha audio kitoblar va ma'ruzalar</p>
                    </div>

                    <button
                        onClick={() => setOpenModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg"
                    >
                        <FiPlus /> Yangi Audio
                    </button>
                </div>



                {/* Audio Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {audios.map((audio) => {
                            const isCurrentAudio = currentAudio?.id === audio.id;
                            const audioDuration = audio.duration || duration;
                            const audioSize = audio.size || 0;
                            const audioProgress = isCurrentAudio ? progress : 0;
                            const audioCurrentTime = isCurrentAudio ? currentTime : 0;
                            const image = audio.image ? (
                                <img
                                    src={`${baseUrl}/api/v1/file/img/${audio.image.id}`}
                                    alt={audio.name}
                                    className="w-16 h-16 object-cover rounded-2xl shadow"
                                />
                            ) : (
                                <FiHeadphones className="text-white text-2xl" />
                            );

                            return (
                                <div
                                    key={audio.id}
                                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
                                >
                                    {/* Audio Header */}
                                    <div className="relative p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">

                                            {image}
                                        </div>

                                        {/* Badges */}
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            {audio.audio?.id && (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Audio
                        </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Audio Content */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                            {audio.name}
                                        </h3>

                                        {audio.author && (
                                            <div className="flex items-center gap-2 text-gray-700 mb-3">
                                                <FiUser className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium">{audio.author}</span>
                                            </div>
                                        )}

                                        {audio.description && (
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                                {audio.description}
                                            </p>
                                        )}

                                        {/* Audio Info */}
                                        <div className="flex items-center justify-between mb-6 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <FiClock className="w-4 h-4" />
                                                <span>{formatDuration(audioDuration)}</span>
                                            </div>
                                            {audioSize > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <FiDatabase className="w-4 h-4" />
                                                    <span>{formatFileSize(audioSize)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Audio Player */}
                                        <div className="mb-6">
                                            <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-gray-500">
                          {formatTime(audioCurrentTime)} / {formatDuration(audioDuration)}
                        </span>
                                            </div>

                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                                                    style={{ width: `${audioProgress}%` }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-center gap-4">
                                                <button
                                                    onClick={() => playAudio(audio)}
                                                    className={`p-3 rounded-full ${
                                                        isCurrentAudio && isPlaying
                                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {isCurrentAudio && isPlaying ? <FiPause /> : <FiPlay />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-4 border-t border-gray-100">
                                            {audio.audio?.id ? (
                                                <button
                                                    onClick={() => handleDownload(audio.audio.id, audio.name)}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-green-700 transition"
                                                >
                                                    <FiDownload />
                                                    Yuklab olish
                                                </button>
                                            ) : (
                                                <div className="flex-1 text-center px-4 py-3 bg-gray-100 text-gray-500 rounded-xl text-sm">
                                                    Audio mavjud emas
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditId(audio.id);
                                                        setForm({
                                                            ...audio,
                                                            audioId: audio.audio?.id,
                                                            imageId: audio.image?.id
                                                        });
                                                        setOpenModal(true);
                                                    }}
                                                    className="p-3 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-100 transition"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(audio.id, audio.name)}
                                                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Modal */}
            {openModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-start p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">

                        {/* Header */}
                        <div className="sticky top-0 bg-white z-10 border-b px-6 py-4 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {editId ? "Audioni tahrirlash" : "Yangi audio qo‘shish"}
                            </h2>
                            <button
                                onClick={() => {
                                    setOpenModal(false);
                                    resetForm();
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <FiX />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4 overflow-y-auto">

                            {/* Audio nomi */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Audio nomi
                                </label>
                                <input
                                    type="text"
                                    placeholder="Audio nomini kiriting"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={form.name || ""}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                />
                            </div>

                            {/* Muallif */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Muallif
                                </label>
                                <input
                                    type="text"
                                    placeholder="Muallifning ismi va familiyasi"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={form.author || ""}
                                    onChange={e => setForm({ ...form, author: e.target.value })}
                                />
                            </div>

                            {/* Nashriyot */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nashriyot
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nashriyot nomini kiriting"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={form.publisher || ""}
                                    onChange={e => setForm({ ...form, publisher: e.target.value })}
                                />
                            </div>

                            {/* Janr */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Janr
                                </label>
                                <input
                                    type="text"
                                    placeholder="Masalan: Audio dars, podkast, ma’ruza"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={form.genre || ""}
                                    onChange={e => setForm({ ...form, genre: e.target.value })}
                                />
                            </div>

                            {/* Audio fayl */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Audio fayl <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={e => setForm({ ...form, audioFile: e.target.files[0] })}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {uploadProgress.audio > 0 && (
                                    <div className="mt-2">
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                                                style={{ width: `${uploadProgress.audio}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Rasm */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Muqova rasmi (ixtiyoriy)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setForm({ ...form, imageFile: e.target.files[0] })}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                />
                                {uploadProgress.image > 0 && (
                                    <div className="mt-2">
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
                                                style={{ width: `${uploadProgress.image}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setOpenModal(false);
                                        resetForm();
                                    }}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!form.name || !form.author}
                                    className={`
              px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold 
              rounded-xl transition
              ${(!form.name || !form.author)
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:from-blue-700 hover:to-indigo-700'}
            `}
                                >
                                    {editId ? "Saqlash" : "Qo‘shish"}
                                </button>
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
    );
};

export default AdminAudio;