import React, { useState } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface RegisterFormProps {
    isOpen: boolean;
    onClose: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState({
        email: "",
        password: ""
    });
    const router = useRouter();
    const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        setErrors({ ...errors, [e.target.id]: "" });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post("https://atlantys.kz/test/register", formData);
            localStorage.setItem("userToken", response.data.token);
            toast({ title: "Регистрация успешна", description: "Вы успешно зарегистрированы." });
            onClose();
            router.push('/');
        } catch (error: any) {
            setErrors({ email: "", password: "" });
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Регистрация</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            placeholder="porta@email.com"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
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
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className={`border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>
                    <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white">
                        Зарегистрироваться
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RegisterForm;