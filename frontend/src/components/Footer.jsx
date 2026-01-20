import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 text-center md:text-left">
        <p>
          📍 Manzil: Buxoro shahri Sitorayi Mohi-Xosa MFY G'ijduvon ko'chasi
          250-uy
        </p>
        <p>📞 Telefon: +998 55 309-99-99</p>
        <div className="flex gap-4 justify-center md:justify-start mt-3">
          <a href="https://www.facebook.com/buxpxti.uz">
            <i className="fab fa-facebook-f" />
          </a>
          <a href="https://www.instagram.com/buxpxti.uz">
            <i className="fab fa-instagram" />
          </a>
          <a href="https://www.youtube.com/@buxpxti">
            <i className="fab fa-youtube" />
          </a>
          <a href="https://t.me/BuxPXTI_uz">
            <i className="fab fa-telegram" />
          </a>
        </div>
      </div>
      <div className="bg-gray-800 text-center py-4 mt-4">© BXU</div>
    </footer>
  );
};

export default Footer;
