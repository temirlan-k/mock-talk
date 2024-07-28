import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LoginForm from '../LoginForm/LoginForm';
import RegisterForm from '../RegisterForm/RegisterForm';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const router = useRouter();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem("userToken");
        setUserEmail(null); // Reset user email
        router.refresh(); // Refresh the page or route
    };

    const fetchUser = async () => {
        const token = localStorage.getItem("userToken");
        if (token) {
            try {
                const response = await axios.get("https://backend-mt-production.up.railway.app/users/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log("User data fetched:", response.data);
                setUserEmail(response.data.email);
            } catch (error) {
                console.error("Ошибка при получении информации о пользователе:", error);
                setUserEmail(null);
            }
        } else {
            setUserEmail(null);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    // Update user information after successful login
    const handleLoginSuccess = async () => {
        console.log("Login successful, fetching user data...");
        await fetchUser();
    };

    return (
        <header className="bg-white text-black shadow-md">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-3">
                        <img src="https://svgshare.com/i/18Ms.svg" width={40} height={40} alt="MockTalk.ai Logo" className="w-10 h-10" />
                        <span className="text-xl font-bold">MockTalk.ai</span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-6">
                        {userEmail ? (
                            <>
                                <Link href="/profile" className="text-black hover:text-grey transition-colors">
                                    <Button>{userEmail}</Button>
                                </Link>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="flex items-center">
                                            <ChevronDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={handleLogout}>
                                            Выйти
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Button onClick={() => setIsLoginModalOpen(true)}>Вход</Button>
                                <Button onClick={() => setIsRegisterModalOpen(true)}>Регистрация</Button>
                            </>
                        )}
                    </nav>

                    <button
                        onClick={toggleMenu}
                        className="md:hidden text-black focus:outline-none"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <nav className="md:hidden">
                    <ul className="flex flex-col items-center space-y-4 py-4">
                        {userEmail ? (
                            <>
                                <li>
                                    <Link href="/profile" className="text-gray-600 hover:text-black transition-colors">
                                        {userEmail}
                                    </Link>
                                </li>
                                <li>
                                    <Button variant="ghost" className="text-gray-600 hover:text-black transition-colors" onClick={handleLogout}>
                                        Выйти
                                    </Button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li><Button onClick={() => setIsLoginModalOpen(true)}>Вход</Button></li>
                                <li><Button onClick={() => setIsRegisterModalOpen(true)}>Регистрация</Button></li>
                            </>
                        )}
                    </ul>
                </nav>
            )}

            <LoginForm
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLoginSuccess={handleLoginSuccess} // Pass the onLoginSuccess prop here
            />
            <RegisterForm
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
            />
        </header>
    );
};

export default Header;
