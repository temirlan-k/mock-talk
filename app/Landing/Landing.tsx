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
import { FaCheckCircle } from 'react-icons/fa';
import BoltIcon from '@mui/icons-material/Bolt';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../../components/ui/carousel"
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { Card, CardContent } from "../../components/ui/card"
import { FaQuestionCircle } from 'react-icons/fa';


export function Landing() {

    const interviewQuestions = [
        { question: "Расскажите о себе.", description: "Предоставьте краткий обзор вашего опыта и квалификаций.", icon: <FaQuestionCircle className="text-black-600" /> },
        { question: "Почему вы заинтересованы в этой должности?", description: "Объясните ваши мотивы и соответствие требованиям должности.", icon: <FaQuestionCircle className="text-black-600" /> },
        { question: "Какие у вас сильные стороны?", description: "Выделите ключевые навыки и как они соответствуют требованиям должности.", icon: <FaQuestionCircle className="text-black-600" /> }
    ];

    const features = [
        { feature: "Персонализированные тренировки", description: "Получите вопросы и сценарии интервью, адаптированные к вашей специальности и уровню опыта.", icon: <FaCheckCircle className="text-black-500" /> },
        { feature: "Анализ ответов на основе ИИ", description: "Наш ИИ анализирует ваши ответы и предоставляет обратную связь в реальном времени.", icon: <FaCheckCircle className="text-black-500" /> },
        { feature: "Видео-интервью с аватаром", description: "Практикуйте свои навыки прохождения интервью с нашим виртуальным аватаром.", icon: <FaCheckCircle className="text-black-500" /> }
    ];


    const testimonials = [
        {
            id: 1,
            image: "https://media.licdn.com/dms/image/D4E35AQEKGBZuNOewhw/profile-framedphoto-shrink_200_200/0/1721727900715?e=1722427200&v=beta&t=5VkLhp2c0WjvrKfjcgj-vJZ4iU-PXxYAwFCKtGWq3sU",
            name: "Aiqyn Ibrayev",
            role: "Software Engineer",
            content: "MockTalk.ai помог мне подготовиться к собеседованию и получить работу мечты!",
        },
        {
            id: 2,
            image:"https://media.licdn.com/dms/image/D4E35AQGfYUWM0IufSg/profile-framedphoto-shrink_800_800/0/1669468627222?e=1722427200&v=beta&t=Ues9ClLfvUPTaLLzWU_zrHY6pSn28j5ja5wU_f7edZg",
            name: "Islam Tungishbay",
            role: "UI/UX Designer",
            content: "Отличный инструмент для практики. Теперь я чувствую себя уверенно на любом интервью.",
        },
        {
            id: 3,
            image:"https://media.licdn.com/dms/image/D4D35AQG3sEvbyqVaLA/profile-framedphoto-shrink_800_800/0/1705678614397?e=1722430800&v=beta&t=25kCzuWeBjer9S6Ayi_mPDGF4p-C7kY6n5BCP2zc3wA",
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
                            <p className="text-lg pb-4 md:text-xl text-gray-700 leading-relaxed">
                                Подготовьтесь к следующему собеседованию с нашим помощником на базе ИИ. Получите персонализированную обратную связь и советы, чтобы успешно пройти интервью.
                            </p>
                            <Link href="/talk" passHref>
                                <Button className="w-full md:w-auto bg-black hover:bg-gray-800 text-white text-lg py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105">
                                    Начать тренировку
                                </Button>
                            </Link>
                            <div className="mt-8 space-y-4">
                                <div className="flex items-center">
                                    <BoltIcon className="text-gray-700 mr-2" />
                                    <p className="text-gray-700">Персонализированные вопросы адаптированы под вашу специализацию и уровень опыта.</p>
                                </div>
                                <div className="flex items-center">
                                    <BoltIcon className="text-gray-700 mr-2" />
                                    <p className="text-gray-700">Мгновенная обратная связь и советы по улучшению ваших ответов сразу после тренировки.</p>
                                </div>
                                <div className="flex items-center">
                                    <BoltIcon className="text-gray-700 mr-2" />
                                    <p className="text-gray-700">Подробный анализ вашего прогресса для отслеживания производительности.</p>
                                </div>
                            </div>
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

                <section className="container mx-auto px-4 py-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Наши преимущества</h2>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="p-6 bg-white rounded-lg shadow-md text-center flex-1">
                            <h3 className="text-2xl font-semibold mb-2">Персонализированные советы</h3>
                            <p className="text-gray-600">Получайте индивидуальные рекомендации и обратную связь, чтобы улучшить свои ответы на реальных интервью.</p>
                        </div>
                        <div className="p-6 bg-white rounded-lg shadow-md text-center flex-1">
                            <h3 className="text-2xl font-semibold mb-2">Встроенный код раннер</h3>
                            <p className="text-gray-600">Запускайте и тестируйте свой код в реальном времени с помощью нашего встроенного код раннера.</p>
                        </div>
                        <div className="p-6 bg-white rounded-lg shadow-md text-center flex-1">
                            <h3 className="text-2xl font-semibold mb-2">Умное распознавание речи</h3>
                            <p className="text-gray-600">Используйте новейшие технологии распознавания речи для мгновенного анализа ваших ответов.</p>
                        </div>
                    </div>
                </section>


                <section className="container mx-auto px-4 mb-24">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Как проходит интервью сессия?</h2>
                        <div className="space-y-6">
                            {interviewQuestions.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-100 p-6 rounded-lg shadow-md hover:bg-gray-200 transition duration-300 ease-in-out transform hover:-translate-y-1"
                                >
                                    <div className="flex items-center mb-2">
                                        <div className="mr-3 text-2xl">
                                            {item.icon}
                                        </div>
                                        <h4 className="text-xl font-semibold text-gray-800">{item.question}</h4>
                                    </div>
                                    <p className="text-gray-700">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 mb-24">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-bold mb-6 text-center text-black-600">Особенности MockTalk.ai</h2>
                        <div className="space-y-6">
                            {features.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-50 p-6 rounded-lg shadow-md hover:bg-blue-50 transition duration-300 ease-in-out transform hover:-translate-y-1"
                                >
                                    <div className="flex items-center mb-2">
                                        <div className="mr-3 text-2xl">
                                            {item.icon}
                                        </div>
                                        <h4 className="text-xl font-semibold">{item.feature}</h4>
                                    </div>
                                    <p className="text-gray-700">{item.description}</p>
                                </div>
                            ))}
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
                                                <img className="w-16 h-16 bg-gray-200 rounded-full mb-2" src={testimonial?.image} alt="" />
                                            </div>
                                            <h3 className="text-xl font-semibold">{testimonial.name}</h3>
                                            <p className="text-sm text-gray-600">{testimonial.role}</p>
                                            <p className="text-gray-700 mt-4">{testimonial.content}</p>
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:block" >
                            <FaChevronLeft className="hidden md:block" />
                        </CarouselPrevious>
                        <CarouselNext className="hidden md:block">
                            <FaChevronRight className="hidden md:block" />
                        </CarouselNext>

                        
                    </Carousel>
                </section>


                {/* <section className="container mx-auto px-4 mb-24">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-3xl font-bold mb-6">Стать частью MockTalk.ai</h2>
                        <RegistrationForm />
                    </div>
                </section> */}
            </main>

            <footer className="bg-black text-white py-8">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center gap-3 mb-4 md:mb-0">
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text p-2 rounded-full shadow-neon">
                            MockTalk.ai
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                        {[  "Условия", "Контакты"].map((item, index) => (
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
