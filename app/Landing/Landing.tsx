'use client'
import Link from "next/link"
import { useEffect } from 'react';
import { Button } from "@/app/Landing/ui/button"
import { Label } from "@/app/Landing/ui/label"
import { Input } from "@/app/Landing/ui/input"
import { Textarea } from "@/app/Landing/ui/textarea"
import Header from "../Header/Header"
import styles from './Landing.module.css'
import { initGA, logPageView } from '../analytics';
import RegistrationForm from "../RegisterForm/RegisterForm";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../../components/ui/carousel"
import { Card, CardContent } from "../../components/ui/card"


export function Landing() {

    const testimonials = [
        {
            id: 1,
            name: "Aiqyn Ibrayev",
            role: "Software Engineer",
            content: "MockTalk.ai помог мне подготовиться к собеседованию и получить работу мечты!",
        },
        {
            id: 2,
            name: "Islam Tungishbay",
            role: "UI/UX Designer",
            content: "Отличный инструмент для практики. Теперь я чувствую себя уверенно на любом интервью.",
        },
        {
            id: 3,
            name: "Yernur Melsov",
            role: "Software Developer",
            content: "Рекомендую всем, кто хочет улучшить свои навыки прохождения собеседований.",
        },
        {
            id: 4,
            name: "Madiyar Kenzhebayev",
            role: "CEO & Founder at taskify",
            content: "Рекомендую всем, кто хочет улучшить свои навыки прохождения собеседований.",
        }
    ];
    useEffect(() => {
        initGA('YOUR-GA4-TRACKING-ID');
        logPageView();
    }, []);


    return (
        <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
            <Header />
            <main className="flex-1 py-12">
                <section className="container mx-auto px-4 mb-24">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="space-y-6 md:w-1/2">
                            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                                Добро пожаловать в{" "}
                                <span className="text-5xl md:text-6xl font-extrabold inline-block transform hover:scale-105 transition-transform duration-200 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900">
                                    MockTalk.ai
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                                Подготовьтесь к следующему собеседованию с нашим помощником на базе ИИ. Получите персонализированную обратную связь и советы, чтобы успешно пройти интервью.
                            </p>
                            <Link href="/talk" passHref>
                                <Button className="w-full md:w-auto bg-black hover:bg-gray-800 text-white text-lg py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105">
                                    Начать тренировку
                                </Button>
                            </Link>
                        </div>
                        <div className="relative md:w-1/2">
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent opacity-20 rounded-lg"></div>
                            <iframe
                                className="w-full aspect-video rounded-lg shadow-2xl"
                                src="https://www.youtube.com/embed/UTd3gwsbyw4?autoplay=1&loop=1&playlist=UTd3gwsbyw4"
                                frameBorder="0"
                                allow="autoplay; encrypted-media"
                                allowFullScreen>
                            </iframe>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 mb-24">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-bold mb-6">Сессия интервью</h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold">Практика интервью</h3>
                                <Button size="icon" className="bg-black hover:bg-gray-800 text-white rounded-full transition-all duration-300 transform hover:scale-110">
                                    <PlayIcon className="w-6 h-6" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { question: "Расскажите о себе.", description: "Предоставьте краткий обзор вашего опыта и квалификаций." },
                                    { question: "Почему вы заинтересованы в этой должности?", description: "Объясните ваши мотивы и соответствие требованиям должности." },
                                    { question: "Какие у вас сильные стороны?", description: "Выделите ключевые навыки и как они соответствуют требованиям должности." }
                                ].map((item, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-medium mb-2">{item.question}</h4>
                                        <p className="text-gray-700">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 mb-24">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-bold mb-6">Панель производительности</h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold">Ваш прогресс</h3>
                                <Button size="icon" className="bg-black hover:bg-gray-800 text-white rounded-full transition-all duration-300 transform hover:rotate-180">
                                    <RefreshCwIcon className="w-6 h-6" />
                                </Button>
                            </div>
                            <div className="space-y-6">
                                {[
                                    { label: "Точность ответов", value: 75 },
                                    { label: "Управление временем", value: 85 },
                                    { label: "Общий балл", value: 90 }
                                ].map((item, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between mb-2">
                                            <h4 className="text-lg font-medium">{item.label}</h4>
                                            <span className="font-bold">{item.value}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-black h-3 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${item.value}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 mb-24">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-bold mb-6">Ресурсы и советы</h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold">Полезные ресурсы</h3>
                                <Button size="icon" className="bg-black hover:bg-gray-800 text-white rounded-full transition-all duration-300 transform hover:rotate-90">
                                    <PlusIcon className="w-6 h-6" />
                                </Button>
                            </div>
                            <div className="space-y-6">
                                {[
                                    { title: "Типичные вопросы на интервью", description: "Просмотрите список часто задаваемых вопросов на интервью.", link: "Посмотреть вопросы" },
                                    { title: "Руководство по подготовке к интервью", description: "Получите советы и стратегии для успешного прохождения интервью.", link: "Читать руководство" },
                                    { title: "Советы от экспертов", description: "Узнайте от отраслевых экспертов, как выделиться на интервью.", link: "Смотреть видео" }
                                ].map((item, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="text-lg font-medium mb-2">{item.title}</h4>
                                        <p className="text-gray-700 mb-2">{item.description}</p>
                                        <Link href="#" className="text-black font-medium hover:underline transition-all duration-300" prefetch={false}>
                                            {item.link} →
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 mb-24">
                    <h2 className="text-3xl font-bold mb-6 text-center">Отзывы пользователей</h2>
                    <Carousel
                        opts={{
                            align: "center",
                        }}
                        className="w-full max-w-xl mx-auto"
                    >
                        <CarouselContent>
                            {testimonials.map((testimonial) => (
                                <CarouselItem key={testimonial.id}>
                                    <Card className="border-none shadow-lg">
                                        <CardContent className="flex flex-col items-center text-center p-6">
                                            <div className="flex justify-center items-center mb-4">
                                                <div className="w-16 h-16 bg-gray-200 rounded-full mb-2"></div>
                                            </div>
                                            <h3 className="text-xl font-semibold">{testimonial.name}</h3>
                                            <p className="text-sm text-gray-600">{testimonial.role}</p>
                                            <p className="text-gray-700 mt-4">{testimonial.content}</p>
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <div className="flex justify-center mt-4">
                            <CarouselPrevious className="hidden md:block" />
                            <CarouselNext className="hidden md:block" />
                        </div>
                    </Carousel>
                </section>


                {/* <section className="container mx-auto px-4 mb-24">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-bold mb-6">Стать частью MockTalk.ai</h2>
                        <RegistrationForm />
                    </div>
                </section> */}
            </main>

            <footer className="bg-gray-900 text-white py-8">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center gap-3 mb-4 md:mb-0">
                        <BotIcon className="w-8 h-8" />
                        <span className="text-xl font-bold">MockTalk</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                        {["Конфиденциальность", "Условия", "Контакты"].map((item, index) => (
                            <Link key={index} href="#" className="hover:text-gray-300 transition-colors duration-300" prefetch={false}>
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Landing;
// SVG компоненты остаются без изменений

function BotIcon(props:any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 8V4H8" />
            <path d="M16 8V4h-4" />
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" />
        </svg>
    );
}

function PlayIcon(props:any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
    );
}

function RefreshCwIcon(props:any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0114.77-4.74L23 10M1 14l4.72 5.74A9 9 0 0020.49 15" />
        </svg>
    );
}

function PlusIcon(props:any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}
