// LoginForm.tsx
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

// Define the type for the props
interface LoginFormProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const router = useRouter();
    const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({}); // Clear previous errors

        try {
            const response = await axios.post("https://plankton-app-osvji.ondigitalocean.app/token", formData, {
                headers: { 'Content-Type': 'application/json' }
            });
            localStorage.setItem("userToken", response.data.token);
            toast({ title: "Успешный вход", description: "Добро пожаловать!" });
            onClose();
            onLoginSuccess(); // Notify Header to update user state
            router.push('/'); // Redirect to another page if needed
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                // Handle specific error status code
                setErrors({
                    email: "Неверный email или пароль.",
                    password: "Неверный email или пароль."
                });
            } else {
                // Handle other errors
                toast({
                    title: "Ошибка входа",
                    description: "Произошла ошибка. Попробуйте снова позже.",
                    variant: "destructive"
                });
            }
            console.error("Login error:", error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] px-4 py-6 sm:px-6 sm:py-8 bg-white rounded-lg shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">Вход в систему</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="example@example.com"
                            value={formData.email}
                            onChange={handleChange}
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
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className={`p-2 border rounded-md focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'}`}
                        />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>
                    <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-md">
                        Войти
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default LoginForm;
