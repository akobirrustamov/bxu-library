import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./admin/LoginAdmin";
import AdminHome from "./admin/AdminHome";
import AdminBooks from "./admin/Books";
import AdminSubject from "./admin/AdminSubject";
import AdminFaculty from "./admin/AdminFaculty";
import AdminFacultySubject from "./admin/AdminFacultySubject";
import AdminFacultyDetails from "./admin/AdminFacultyDetails"
import AdminBadiiy from "./admin/AdminBadiiy";
import AdminAudio from "./admin/AdminAudio";
import OneBook from "./pages/OneBook";
import OneBadiiy from "./pages/OneBadiiy";
import AdminSubjectBooks from "./admin/AdminSubjectBooks";

function App() {
    return (
        <Routes>
            {/* Asosiy sahifalar */}
            <Route path="/" element={<Home />} />
            <Route path="/book/:id" element={<OneBook />} />
            <Route path="/badiiy/:id" element={<OneBadiiy />} />

            {/* Admin sahifalari */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/dashboard" element={<AdminHome />} />
            <Route path="/admin/books" element={<AdminBooks />} />
            <Route path="/admin/faculty" element={<AdminFaculty />} />
            <Route path="/admin/subjects" element={<AdminSubject />} />

            <Route path="/admin/faculty-subjects" element={<AdminFacultySubject />} />
                <Route path="/admin/faculty-statistic/:facultyId" element={<AdminFacultyDetails />} />

                <Route path="/admin/subject/:subjectId" element={<AdminSubjectBooks />} />

                <Route path="/admin/badiiy" element={<AdminBadiiy />} />
            <Route path="/admin/audio" element={<AdminAudio />} />
            {/* Redirect */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

            {/* 404 sahifasi */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;