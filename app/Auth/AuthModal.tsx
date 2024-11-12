import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";


const BASE_LOCAL_URL = 'https://atlantys.kz/test';
const BASE_DEV_URL = 'https://atlantys.kz/test';


// Define the props type
interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthSuccess: (token: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [registerData, setRegisterData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (!isOpen) {
            setLoginData({ email: "", password: "" });
            setRegisterData({ email: "", password: "" });
            setErrors({});
        }
    }, [isOpen]);

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginData({ ...loginData, [e.target.id]: e.target.value });
    };

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRegisterData({ ...registerData, [e.target.id]: e.target.value });
        setErrors({ ...errors, [e.target.id]: "" });
    };

    const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        try {
            const response = await axios.post("https://atlantys.kz/test/token", loginData, {
                headers: { 'Content-Type': 'application/json' }
            });
            const token = response.data.token;
            localStorage.setItem("userToken", token);
            toast({ title: "Успешный вход", description: "Добро пожаловать!" });
            onClose();
            onAuthSuccess(token);
            router.push('/');
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                setErrors({
                    email: "Неверный email или пароль.",
                    password: "Неверный email или пароль."
                });
            } else {
                toast({
                    title: "Ошибка входа",
                    description: "Произошла ошибка. Попробуйте снова позже.",
                    variant: "destructive"
                });
            }
            console.error("Login error:", error);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        try {
            const response = await axios.post("https://atlantys.kz/test/register", registerData, {
                headers: { 'Content-Type': 'application/json' }
            });
            const token = response.data.token;
            localStorage.setItem("userToken", token);
            toast({ title: "Регистрация успешна", description: "Вы успешно зарегистрированы." });
            onClose();
            onAuthSuccess(token);
            router.push('/');
        } catch (error: any) {
            if (error.response) {
                const { status, data } = error.response;
                if (status === 400) {
                    if (data.detail === "User already registered") {
                        toast({
                            title: "Ошибка регистрации",
                            description: "Пользователь с таким email уже зарегистрирован.",
                            variant: "destructive"
                        });
                        setErrors({ ...errors, email: "Пользователь с таким email уже зарегистрирован." });
                    } else {
                        toast({
                            title: "Ошибка регистрации",
                            description: "Не удалось зарегистрироваться.",
                            variant: "destructive"
                        });
                    }
                } else if (status === 422) {
                    setErrors(data.errors || {});
                } else {
                    toast({
                        title: "Ошибка регистрации",
                        description: "Произошла ошибка. Попробуйте снова позже.",
                        variant: "destructive"
                    });
                }
            } else {
                toast({
                    title: "Ошибка регистрации",
                    description: "Произошла ошибка. Попробуйте снова позже.",
                    variant: "destructive"
                });
            }
            console.error("Ошибка при регистрации:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] px-4 py-6 sm:px-6 sm:py-8 bg-white rounded-lg shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        {isLogin ? "Вход в систему" : "Регистрация"}
                    </DialogTitle>
                </DialogHeader>
                {isLogin ? (
                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@example.com"
                                value={loginData.email}
                                onChange={handleLoginChange}
                                required
                                className={`p-2 border rounded-md focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'}`}
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Пароль</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={loginData.password}
                                onChange={handleLoginChange}
                                required
                                className={`p-2 border rounded-md focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'}`}
                            />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                        </div>
                        <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-md">
                            Войти
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                placeholder="porta@email.com"
                                type="email"
                                value={registerData.email}
                                onChange={handleRegisterChange}
                                className={`p-2 border rounded-md focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'}`}
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        </div>
                        <div>
                            <Label htmlFor="password">Пароль</Label>
                            <Input
                                id="password"
                                placeholder="••••••••"
                                type="password"
                                value={registerData.password}
                                onChange={handleRegisterChange}
                                className={`p-2 border rounded-md focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'}`}
                            />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-md"
                        >
                            Зарегистрироваться
                        </Button>
                    </form>
                )}
                <div className="text-center mt-4">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-500 hover:underline"
                    >
                        {isLogin ? "Нет аккаунта? Регистрация" : "Есть аккаунт? Войти"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
