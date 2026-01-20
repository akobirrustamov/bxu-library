import React from "react";
import newbook from "../assets/newbook.jpg";

const BooksGrid = ({ books, handleDownload }) => {
  if (!books.length) return null;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <div
            key={book.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <img
              src={newbook}
              alt={book.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg">{book.name}</h3>
              <p className="text-sm text-gray-600">{book.author}</p>
              <p className="text-xs text-gray-500">{book.publisher}</p>
              <button
                onClick={() => handleDownload(book)}
                className="mt-2 text-blue-600 hover:underline text-sm"
              >
                <i className="fa fa-download mr-1"></i> Yuklab olish
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BooksGrid;
