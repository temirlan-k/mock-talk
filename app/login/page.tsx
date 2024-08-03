// pages/login.tsx
'use client';
import React, { useState } from "react";
import LoginForm from "../LoginForm/LoginForm";
import Header from "../Header/Header";

const LoginPage = () => {
    const [isLoginFormOpen, setIsLoginFormOpen] = useState(true);

    const handleLoginSuccess = () => {
        console.log("Login successful!");
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="min-h-screen flex items-center justify-center bg-white">
                <LoginForm
                    isOpen={isLoginFormOpen}
                    onClose={() => setIsLoginFormOpen(false)}
                    onLoginSuccess={handleLoginSuccess}
                />
            </main>
        </div>
    );
};

export default LoginPage;
