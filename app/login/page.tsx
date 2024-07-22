// pages/login.tsx
'use client';   
import React from "react";
import LoginForm from "../LoginForm/LoginForm";
import Header from "../Header/Header";

const LoginPage = () => {
    return (
        <div className="min-h-screen flex flex-col">
        <Header />
        <main className="min-h-screen flex items-center justify-center bg-white">
            <LoginForm />
            </main>
        </div>
    );
};

export default LoginPage;
