import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiBook,
  FiUsers,
  FiBookOpen,
  FiLink,
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronRight,
  FiBarChart2,
  FiSettings,
  FiUser,
  FiHelpCircle, FiMusic
} from "react-icons/fi";

function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      path: "/",
      icon: <FiHome />,
      label: "Bosh Sahifa",
      adminPath: "/admin/dashboard"
    },
    {
      path: "/admin/books",
      icon: <FiBook />,
      label: "Kitoblar",
      adminPath: "/admin/books"
    },
    {
      path: "/admin/faculty",
      icon: <FiUsers />,
      label: "Yo'nalishlar",
      adminPath: "/admin/faculty"
    },
    {
      path: "/admin/subjects",
      icon: <FiBookOpen />,
      label: "Fanlar",
      adminPath: "/admin/subjects"
    },
    {
      path: "/admin/faculty-subjects",
      icon: <FiLink />,
      label: "Fanga Biriktirish",
      adminPath: "/admin/faculty-subjects"
    },
    {
      path: "/admin/faculty-subjects",
      icon: <FiBookOpen />,
      label: "Badiiy adabiyotlar",
      adminPath: "/admin/badiiy"
    },
    {
      path: "/admin/faculty-subjects",
      icon: <FiMusic />,
      label: "Audio Adabiyotlar",
      adminPath: "/admin/audio"
    },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
      <>
        {/* Mobile Menu Button */}
        <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
            <div
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
                onClick={() => setIsMobileMenuOpen(false)}
            />
        )}

        {/* Sidebar Container */}
        <aside
            className={`
          fixed top-0 left-0 h-screen z-40 transition-all duration-500 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          w-72
        `}
        >
          <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl">

            {/* Logo Section */}
            <div className="p-5 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FiBook className="text-white text-xl" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  </div>
                  {!isCollapsed && (
                      <div className="flex-1">
                        <h1 className="text-lg font-bold text-white">BXU Admin</h1>
                        <p className="text-xs text-gray-400">Kutubxona Tizimi</p>
                      </div>
                  )}
                </div>
                {!isCollapsed && (
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
                    >
                      <FiChevronRight className={`transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                )}
              </div>
            </div>

            {/* User Profile */}
            {/*<div className={`p-5 border-b border-gray-700 ${isCollapsed ? 'px-3' : ''}`}>*/}
            {/*  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>*/}
            {/*    <div className="relative">*/}
            {/*      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">*/}
            {/*        <span className="text-white font-semibold">A</span>*/}
            {/*      </div>*/}
            {/*      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>*/}
            {/*    </div>*/}
            {/*    {!isCollapsed && (*/}
            {/*        <div className="flex-1">*/}
            {/*          <h3 className="font-semibold text-white">Admin User</h3>*/}
            {/*          <p className="text-sm text-gray-400">Super Admin</p>*/}
            {/*        </div>*/}
            {/*    )}*/}
            {/*  </div>*/}
            {/*</div>*/}

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto p-4 scrollbar-hide">
              <ul className="space-y-1">
                {menuItems.map((item, index) => {
                  const active = isActive(item.adminPath);
                  return (
                      <li key={index}>
                        <Link
                            to={item.adminPath}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`
                        flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-4'} py-3 rounded-xl
                        transition-all duration-300 transform hover:scale-105
                        ${active
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }
                      `}
                        >
                          <div className={`relative ${active ? 'text-white' : 'text-gray-400'}`}>
                            {item.icon}
                            {active && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            )}
                          </div>
                          {!isCollapsed && (
                              <>
                                <span className="ml-3 font-medium">{item.label}</span>
                                {active && (
                                    <FiChevronRight className="ml-auto transform rotate-90" />
                                )}
                              </>
                          )}
                        </Link>
                      </li>
                  );
                })}
              </ul>

              {/* Statistics Section */}
              {/*{!isCollapsed && (*/}
              {/*    <div className="mt-8 p-4 bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">*/}
              {/*      <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">*/}
              {/*        <FiBarChart2 /> Statistika*/}
              {/*      </h4>*/}
              {/*      <div className="space-y-3">*/}
              {/*        <div>*/}
              {/*          <div className="flex justify-between mb-1">*/}
              {/*            <span className="text-xs text-gray-300">Kitoblar</span>*/}
              {/*            <span className="text-xs font-semibold text-blue-400">1.2k</span>*/}
              {/*          </div>*/}
              {/*          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">*/}
              {/*            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full w-3/4"></div>*/}
              {/*          </div>*/}
              {/*        </div>*/}
              {/*        <div>*/}
              {/*          <div className="flex justify-between mb-1">*/}
              {/*            <span className="text-xs text-gray-300">Foydalanuvchilar</span>*/}
              {/*            <span className="text-xs font-semibold text-green-400">892</span>*/}
              {/*          </div>*/}
              {/*          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">*/}
              {/*            <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full w-2/3"></div>*/}
              {/*          </div>*/}
              {/*        </div>*/}
              {/*      </div>*/}
              {/*    </div>*/}
              {/*)}*/}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-700">
              {!isCollapsed && (
                  <>
                    <Link
                        to="/admin/settings"
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition"
                    >
                      <FiSettings />
                      <span className="font-medium">Sozlamalar</span>
                    </Link>

                    <Link
                        to="/admin/help"
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-xl transition mt-2"
                    >
                      <FiHelpCircle />
                      <span className="font-medium">Yordam</span>
                    </Link>
                  </>
              )}

              {/* Logout Button */}
              <button
                  onClick={handleLogout}
                  className={`
                w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-center gap-3'}
                px-4 py-3 mt-4 bg-gradient-to-r from-red-600 to-red-700 text-white 
                rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300
                shadow-lg hover:shadow-xl transform hover:scale-105
              `}
              >
                <FiLogOut />
                {!isCollapsed && <span className="font-semibold">Chiqish</span>}
              </button>

              {!isCollapsed && (
                  <p className="text-xs text-center text-gray-500 mt-3 pt-3 border-t border-gray-800">
                    Version 2.1.0 • BXU Library
                  </p>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Spacer */}
        <div className={`lg:${isCollapsed ? 'ml-20' : 'ml-64'}`}></div>

        {/* Custom Styles */}
        <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Custom glow effect for active items */
        .active-glow {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        }
      `}</style>
      </>
  );
}

export default Sidebar;