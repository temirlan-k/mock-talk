import React, { useState } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import FileInput from "../RegisterForm/FileInputUi";

// Define the types for the props
interface RegisterFormProps {
    isOpen: boolean;
    onClose: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        jobTitle: "",
        experience: ""
    });
    const [cv, setCv] = useState<File | null>(null);
    const [errors, setErrors] = useState({
        name: "",
        email: "",
        password: "",
        jobTitle: "",
        experience: "",
        cv: ""
    });
    const router = useRouter();
    const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        setErrors({ ...errors, [e.target.id]: "" }); // Clear error for changed field
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setCv(e.target.files[0]);
            setErrors({ ...errors, cv: "" }); // Clear error for file input
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formDataWithFile = new FormData();
        formDataWithFile.append("name", formData.name);
        formDataWithFile.append("email", formData.email);
        formDataWithFile.append("job_title", formData.jobTitle);
        formDataWithFile.append("experience", formData.experience);
        formDataWithFile.append("password", formData.password);
        if (cv) {
            formDataWithFile.append("cv", cv);
        }

        try {
            const response = await axios.post("http://localhost:8002/register", formDataWithFile, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            localStorage.setItem("userToken", response.data.token); // Save token
            toast({ title: "Регистрация успешна", description: "Вы успешно зарегистрированы." });
            onClose();
            router.push('/'); // Stay on landing page
        } catch (error: any) {
            // Reset errors
            setErrors({
                name: "",
                email: "",
                password: "",
                jobTitle: "",
                experience: "",
                cv: ""
            });

            // Check for response errors
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
                    // Handle validation errors if any
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
                        <Label htmlFor="name" >Имя</Label>
                        <Input
                            placeholder="Portakalata Portakalatov"
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
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
                    <div>
                        <Label htmlFor="jobTitle">Должность</Label>
                        <Input
                            placeholder="Frontend Developer"
                            id="jobTitle"
                            type="text"
                            value={formData.jobTitle}
                            onChange={handleChange}
                            required
                            className={`border rounded-md ${errors.jobTitle ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.jobTitle && <p className="text-red-500 text-sm">{errors.jobTitle}</p>}
                    </div>
                    <div>
                        <Label htmlFor="experience">Опыт</Label>
                        <Input
                            placeholder="5 месяцев"
                            id="experience"
                            type="text"
                            value={formData.experience}
                            onChange={handleChange}
                            required
                            className={`border rounded-md ${errors.experience ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.experience && <p className="text-red-500 text-sm">{errors.experience}</p>}
                    </div>
                    <div>
                        <Label htmlFor="cv">CV</Label>
                        <FileInput id="cv" onChange={handleFileChange} />
                        {errors.cv && <p className="text-red-500 text-sm">{errors.cv}</p>}
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
