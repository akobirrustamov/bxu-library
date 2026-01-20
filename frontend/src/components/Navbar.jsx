import React from "react";
import logo from "../assets/logo.png";
import bxu from "../assets/bxu.png";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50">
      {/*<div className="bg-gray-900 text-white py-2 hidden lg:block">*/}
      {/*  <div className="container mx-auto px-4 flex justify-between items-center">*/}
      {/*    <div className="flex items-center">*/}
      {/*      <img*/}
      {/*        src={logo}*/}
      {/*        alt="Logo"*/}
      {/*        className="w-8 h-8 rounded-full border-2 border-blue-500 mr-2"*/}
      {/*      />*/}
      {/*      <span>Buxoro Xalqaro Universiteti elektron kutubxonasi</span>*/}
      {/*    </div>*/}
      {/*    <div className="flex items-center gap-3">*/}
      {/*      <a*/}
      {/*        href="https://www.facebook.com/buxpxti.uz"*/}
      {/*        className="hover:text-blue-400"*/}
      {/*      >*/}
      {/*        <i className="fab fa-facebook-f" />*/}
      {/*      </a>*/}
      {/*      <a*/}
      {/*        href="https://www.instagram.com/buxpxti.uz"*/}
      {/*        className="hover:text-pink-400"*/}
      {/*      >*/}
      {/*        <i className="fab fa-instagram" />*/}
      {/*      </a>*/}
      {/*      <a*/}
      {/*        href="https://www.youtube.com/@buxpxti"*/}
      {/*        className="hover:text-red-500"*/}
      {/*      >*/}
      {/*        <i className="fab fa-youtube" />*/}
      {/*      </a>*/}
      {/*      <a href="https://t.me/BuxPXTI_uz" className="hover:text-sky-400">*/}
      {/*        <i className="fab fa-telegram" />*/}
      {/*      </a>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}

      <div className="bg-white shadow">
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center py-3">
            <a href="/">
              <img src={bxu} alt="BXU" className="h-12" />
            </a>
            <div className="hidden lg:flex space-x-6">
              <a href="/" className="hover:text-blue-600">
                Bosh sahifa
              </a>
              <a href="#table-books" className="hover:text-blue-600">
                Fan dasturlari
              </a>

              <a href="#badiiy" className="hover:text-blue-600">
                Badiiy adabiyotlar
              </a>
              <a href="#audio" className="hover:text-blue-600">
                Audio adabiyotlar
              </a>
            </div>
            <button className="lg:hidden">
              <i className="fas fa-bars text-xl text-blue-600"></i>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
