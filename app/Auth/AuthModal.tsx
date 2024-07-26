import React, { useState } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import FileInput from "../RegisterForm/FileInputUi";

// Define the props type
interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthSuccess: (token: string) => void; // Ensure this is defined as expected
}

// Define the errors type
type ErrorsType = {
    email?: string;
    password?: string;
    name?: string;
    jobTitle?: string;
    experience?: string;
    cv?: string;
};

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [registerData, setRegisterData] = useState({
        name: "",
        email: "",
        password: "",
        jobTitle: "",
        experience: ""
    });
    const [cv, setCv] = useState<File | null>(null);
    const [errors, setErrors] = useState<ErrorsType>({});
    const router = useRouter();
    const { toast } = useToast();

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginData({ ...loginData, [e.target.id]: e.target.value });
    };

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRegisterData({ ...registerData, [e.target.id]: e.target.value });
        setErrors({ ...errors, [e.target.id]: "" });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setCv(e.target.files[0]);
            setErrors({ ...errors, cv: "" });
        }
    };

    const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});

        try {
            const response = await axios.post("http://localhost:8002/token", loginData, {
                headers: { 'Content-Type': 'application/json' }
            });
            const token = response.data.token;
            localStorage.setItem("userToken", token);
            toast({ title: "Успешный вход", description: "Добро пожаловать!" });
            onClose();
            onAuthSuccess(token); 
            router.push('/talk');
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
        const formData = new FormData();
        Object.entries(registerData).forEach(([key, value]) => {
            formData.append(key, value);
        });
        if (cv) {
            formData.append("cv", cv);
        }

        try {
            const response = await axios.post("http://localhost:8002/register", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const token = response.data.token;
            localStorage.setItem("userToken", token);
            toast({ title: "Регистрация успешна", description: "Вы успешно зарегистрированы." });
            onClose();
            onAuthSuccess(token); // Pass the token here
            router.push('/');
        } catch (error: any) {
            setErrors({});
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
                            <Label htmlFor="name">Имя</Label>
                            <Input
                                placeholder="Portakalata Portakalatov"
                                id="name"
                                type="text"
                                value={registerData.name}
                                onChange={handleRegisterChange}
                                required
                                className={`border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                placeholder="porta@email.com"
                                type="email"
                                value={registerData.email}
                                onChange={handleRegisterChange}
                                required
                                className={`border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        </div>
                        <div>
                            <Label htmlFor="password">Пароль</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={registerData.password}
                                onChange={handleRegisterChange}
                                required
                                className={`border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                        </div>
                        <div>
                            <Label htmlFor="jobTitle">Должность</Label>
                            <Input
                                id="jobTitle"
                                type="text"
                                placeholder="Frontend Developer"
                                value={registerData.jobTitle}
                                onChange={handleRegisterChange}
                                required
                                className={`border rounded-md ${errors.jobTitle ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.jobTitle && <p className="text-red-500 text-sm">{errors.jobTitle}</p>}
                        </div>
                        <div>
                            <Label htmlFor="experience">Опыт</Label>
                            <Input
                                id="experience"
                                type="text"
                                placeholder="2 года"
                                value={registerData.experience}
                                onChange={handleRegisterChange}
                                required
                                className={`border rounded-md ${errors.experience ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.experience && <p className="text-red-500 text-sm">{errors.experience}</p>}
                        </div>
                        <div>
                            <Label htmlFor="cv">Резюме (pdf)</Label>
                                <FileInput
                                    id="cv"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className={`border rounded-md ${errors.cv ? 'border-red-500' : 'border-gray-300'}`}
                                />

                            {errors.cv && <p className="text-red-500 text-sm">{errors.cv}</p>}
                        </div>
                        <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-md">
                            Зарегистрироваться
                        </Button>
                    </form>
                )}
                <div className="flex justify-center mt-4">
                    <Button onClick={() => setIsLogin(!isLogin)} variant="link">
                        {isLogin ? "Нет аккаунта? Зарегистрируйтесь" : "Есть аккаунт? Войдите"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
