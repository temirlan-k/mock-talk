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
import LogoutIcon from '@mui/icons-material/Logout';

import PersonIcon from '@mui/icons-material/Person';


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
        <header className="bg-white text-black shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-3">
                        <img src="https://svgshare.com/i/18Ms.svg" width={40} height={40} alt="MockTalk.ai Logo" className="w-10 h-10" />
                        <span className="text-xl font-bold">MockTalk.ai</span>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-6">
                        {userEmail ? (
                            <div className="flex items-center space-x-4">
                                <Link href="/profile">
                                    <Button variant="outline" className="flex items-center">
                                        <PersonIcon className="mr-2" />
                                        {userEmail}
                                    </Button>
                                </Link>
                                <Button variant="ghost" onClick={handleLogout} className="text-red-600 hover:text-red-800 hover:bg-red-100">
                                    <LogoutIcon className="mr-2 h-4 w-4" />
                                    Выйти
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setIsLoginModalOpen(true)}>Вход</Button>
                                <Button onClick={() => setIsRegisterModalOpen(true)}>Регистрация</Button>
                            </>
                        )}
                    </nav>

                    <div className="md:hidden flex items-center">
                        {userEmail && (
                            <Link href="/profile" className="mr-4">
                                <Button variant="outline" size="sm" className="flex items-center">
                                    <PersonIcon className="mr-1 h-4 w-4" />
                                    Профиль
                                </Button>
                            </Link>
                        )}
                        <button
                            onClick={toggleMenu}
                            className="text-black focus:outline-none"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <nav className="md:hidden bg-gray-100 py-4">
                    <ul className="flex flex-col items-stretch space-y-4 px-4">
                        {userEmail ? (
                            <>
                                <li>
                                    <Button variant="outline" className="w-full justify-start">
                                        <PersonIcon className="mr-2 h-4 w-4" />
                                        {userEmail}
                                    </Button>
                                </li>
                                <li>
                                    <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-800 hover:bg-red-100" onClick={handleLogout}>
                                        <LogoutIcon className="mr-2 h-4 w-4" />
                                        Выйти
                                    </Button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li><Button className="w-full" onClick={() => { setIsLoginModalOpen(true); setIsMenuOpen(false); }}>Вход</Button></li>
                                <li><Button className="w-full" variant="outline" onClick={() => { setIsRegisterModalOpen(true); setIsMenuOpen(false); }}>Регистрация</Button></li>
                            </>
                        )}
                    </ul>
                </nav>
            )}

            <LoginForm
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLoginSuccess={handleLoginSuccess}
            />
            <RegisterForm
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
            />
        </header>
    );
};

export default Header;