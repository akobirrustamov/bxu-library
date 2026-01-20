import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import BooksGrid from "../components/BooksGrid";
import BadiiyBooks from "../components/BadiiyBooks";
import AudioBooks from "../components/AudioBooks";
import BooksTable from "../components/BooksTable";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";
import ApiCall from "../config"
function Home() {
    const [educationType, setEducationType] = useState("");
    const [faculties, setFaculties] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [books, setBooks] = useState([]);
    const [badiiyBooks, setBadiiyBooks] = useState([]);
    const [audioBooks, setAudioBooks] = useState([]);
    const [allBooks, setAllBooks] = useState([]);
    const [showLogin, setShowLogin] = useState(false);
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    const handleEducationTypeChange = (e) => setEducationType(e.target.value);
    const handleFacultyChange = (e) => console.log("Faculty:", e.target.value);
    const handleSubjectChange = (e) => console.log("Subject:", e.target.value);

    const handleDownload = (book) => {
        const token = localStorage.getItem("student_token");
        if (!token) {
            setShowLogin(true);
            return;
        }
        alert("Yuklab olish: " + book.name);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        localStorage.setItem("student_token", "demo_token");
        setShowLogin(false);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <Navbar />
            <Hero
                educationType={educationType}
                faculties={faculties}
                subjects={subjects}
                handleEducationTypeChange={handleEducationTypeChange}
                handleFacultyChange={handleFacultyChange}
                handleSubjectChange={handleSubjectChange}
            />
            <BooksGrid books={books} handleDownload={handleDownload} />
            <BadiiyBooks books={badiiyBooks} handleDownload={handleDownload} />
            <AudioBooks books={audioBooks} handleDownload={handleDownload} />
            <BooksTable books={allBooks} handleDownload={handleDownload} />
            <Footer />
            <LoginModal
                show={showLogin}
                onClose={() => setShowLogin(false)}
                onSubmit={handleLogin}
                login={login}
                setLogin={setLogin}
                password={password}
                setPassword={setPassword}
            />
        </div>
    );
}

export default Home;
