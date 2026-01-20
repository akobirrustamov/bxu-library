import React, { useEffect, useState, useRef } from "react";
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


  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 4;



  /* =========================
     INITIALIZE AUDIO PLAYER
  ========================= */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);
  useEffect(() => {
    fetchAudios(page);
  }, [page]);

  /* =========================
     FETCH AUDIOS
  ========================= */
  useEffect(() => {
    fetchAudios();
  }, []);

  const fetchAudios = async (pageNumber = 0) => {
    setLoading(true);
    try {
      const res = await ApiCall("/api/v1/book/audio", "GET", null, {
        page: pageNumber,
        size: PAGE_SIZE
      });

      if (!res?.error) {
        const audiosWithMetadata = await Promise.all(
            (res.data?.content || []).map(async (audio) => {
              if (audio.audio?.id) {
                try {
                  const metadata = await getAudioMetadata(audio.audio.id);
                  return { ...audio, ...metadata };
                } catch {
                  return audio;
                }
              }
              return audio;
            })
        );

        setAudios(audiosWithMetadata);
        setTotalPages(res.data.totalPages || 0);
      }
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


  /* =========================
     RENDER
  ========================= */
  return (
      <div id={"audio"} className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">


          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start gap-8">
              {/* Main Title Section */}
              <div className="flex-1">
                <div className="flex items-center gap-6 mb-6">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-xl">
                    <FiMusic className="text-white text-3xl" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      Audio Kutubxona
                    </h1>
                    <p className="text-gray-600 text-lg">
                      Kitoblarni tinglang, vaqtingizni samarali bering
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <p className="text-gray-700 mb-4">
                    Audio kitoblar - zamonaviy ta'lim va madaniyatning ajralmas qismi.
                    Bizning kutubxonada siz turli janr va mualliflarning audio asarlarini
                    yuqori sifatda tinglashingiz mumkin.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                      <span className="mr-2">🎧</span> Mashhur Audio
                    </button>
                    <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                      <span className="mr-2">🎙️</span> Yangi Qo'shilgan
                    </button>
                    <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                      <span className="mr-2">🏆</span> Eng Yaxshilar
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
                  <div className="text-3xl font-bold text-blue-700 mb-2">850+</div>
                  <div className="text-blue-600 font-medium">Audio Kitob</div>
                  <div className="text-blue-500 text-sm mt-1">Har hafta yangilab boriladi</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-2xl border border-purple-200">
                  <div className="text-3xl font-bold text-purple-700 mb-2">2.4K+</div>
                  <div className="text-purple-600 font-medium">Tinglash Soati</div>
                  <div className="text-purple-500 text-sm mt-1">Jami davomiylik</div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-2xl border border-indigo-200">
                  <div className="text-3xl font-bold text-indigo-700 mb-2">98%</div>
                  <div className="text-indigo-600 font-medium">Yuqori Sifat</div>
                  <div className="text-indigo-500 text-sm mt-1">Professional audio</div>
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-5 rounded-2xl border border-cyan-200">
                  <div className="text-3xl font-bold text-cyan-700 mb-2">24/7</div>
                  <div className="text-cyan-600 font-medium">Doimiy</div>
                  <div className="text-cyan-500 text-sm mt-1">Har qanday vaqtda</div>
                </div>
              </div>
            </div>
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
                          className="w-40 h-40 object-cover rounded-2xl shadow"
                      />
                  ) : (
                      <FiHeadphones className="text-blue-600 w-40 h-40 text-2xl" />
                  );

                  return (
                      <div
                          key={audio.id}
                          className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
                      >
                        {/* Audio Header */}
                        <div className="relative  bg-gradient-to-r from-blue-50 to-purple-50">
                          <div className=" mx-auto mb-2 rounded-2xl flex items-center justify-center ">

                            {image}
                          </div>

                          {/* Badges */}
                          <div className="absolute top-1 right-3 flex gap-2">
                            {audio.audio?.id && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Audio
                        </span>
                            )}
                          </div>
                        </div>

                        {/* Audio Content */}
                        <div className="p-4">
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
                          <div className="mb-2">
                            <div className="flex items-center justify-between ">
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


                          </div>
                        </div>
                      </div>
                  );
                })}
              </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                  Oldingi
                </button>

                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={`px-4 py-2 rounded-lg border ${
                            page === i
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white hover:bg-gray-100"
                        }`}
                    >
                      {i + 1}
                    </button>
                ))}

                <button
                    disabled={page === totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                  Keyingi
                </button>
              </div>
          )}

        </div>



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