'use client'
import Link from "next/link"
import { useState, useEffect } from 'react';
import { Button } from "@/app/Landing/ui/button"
import { Label } from "@/app/Landing/ui/label"
import { Input } from "@/app/Landing/ui/input"
import { Textarea } from "@/app/Landing/ui/textarea"
import Header from "../Header/Header"
import styles from './Landing.module.css'
import { initGA, logPageView } from '../analytics';
import RegistrationForm from "../RegisterForm/RegisterForm";
import { FaCheckCircle } from 'react-icons/fa';
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import BoltIcon from '@mui/icons-material/Bolt';
import { FaMicrophone, FaCode, FaRobot, FaClipboardCheck } from 'react-icons/fa';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,    
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

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
            name: "Madiyar Kenzhebayev",
            role: "CEO at taskify.ai",
            content: "Крутое приложение для молодых специалистов, которые хотят улучшить свои навыки прохождения собеседований.",
        },
        {
            id: 2,
            image:"https://media.licdn.com/dms/image/D4E35AQGfYUWM0IufSg/profile-framedphoto-shrink_800_800/0/1669468627222?e=1722427200&v=beta&t=Ues9ClLfvUPTaLLzWU_zrHY6pSn28j5ja5wU_f7edZg",
            name: "Meirzhan Amangeldiev",
            role: "Fullstack Developer at FinanceX",
            content: "Отличный инструмент для подготовки к интервью.Благодаря MockTalk.ai я получил работу мечты!",
        },
        {
            id: 3,
            image: "https://media.licdn.com/dms/image/D4D03AQFZr5IQ3knJPg/profile-displayphoto-shrink_200_200/0/1705678517119?e=1727913600&v=beta&t=ojWmwDPkALrr1eNSuB34N-F9JT2GtIOmyTDQEn3kUxQ",
            name: "Aiqyn Ibrayev",
            role: "Software Developer at kenes.ai",
            content: "Рекомендую всем, кто хочет улучшить свои навыки прохождения собеседований.",
        },
        {
            id: 4,
            image: "https://media.licdn.com/dms/image/D4E03AQEzV9H0edAJwA/profile-displayphoto-shrink_100_100/0/1718303354517?e=1727913600&v=beta&t=L8YUw-XndtRmvjAO4EOdpx5XgbwfvXY-_4RwiUoS-l8",
            name: "Meyirman Sarsenbay",
            role: "Frontend Developer", 
            content: "Отличное приложение для подготовки к собеседованиям. Спасибо MockTalk.ai!",
        },
        {
            id: 5,
            image: "https://media.licdn.com/dms/image/D4D35AQHU_t0BqTzFNw/profile-framedphoto-shrink_200_200/0/1722079046440?e=1722808800&v=beta&t=hjgu_7c18OnMxc1xh4eh7cAijm5Xtd-mf4Bum5-jrkg",
            name: "Dinmukhammed Arystambek ",
            role: "CEO at iHunter.ai",
            content: "Отличное приложение для подготовки к собеседованиям. Спасибо MockTalk.ai!"
        },
        {
            id: 6,
            image: "https://media.licdn.com/dms/image/D4D35AQFYkvtAdyWJfQ/profile-framedphoto-shrink_200_200/0/1719587524903?e=1722589200&v=beta&t=-Cv7d5KMV4ljfQlc0q__LWRfA-_tMuGOACK3-gKzXmI",
            name: "Yernur Melsov",
            role: "Software Developer",
            content: "Я за неделю подготовился к собеседованию и успешно прошел его. Thanks MockTalk.ai!"
        },
        {
            id: 7,
            image: "https://media.licdn.com/dms/image/D4D35AQG3sEvbyqVaLA/profile-framedphoto-shrink_800_800/0/1705678614397?e=1722430800&v=beta&t=25kCzuWeBjer9S6Ayi_mPDGF4p-C7kY6n5BCP2zc3wA",
            name: "Mukan Idrisov",
            role: "Frontend Developer at SDU Technopark",
            content:"Очень удобный и приятный интерфейс ,пользуюсь этим  веб приложением для проверки своих знаний,обратная связь отличная."
        },
        {
            id: 8,
            image: "https://media.licdn.com/dms/image/D4D35AQGeQfpZLXPK6g/profile-framedphoto-shrink_100_100/0/1708842741960?e=1722808800&v=beta&t=aXGm95G4MHEYaJPRdfFMWlMCqdvyU2NQI0bvBVvR6as",
            name: "Adilet Zhandyrbai",
            role: "Work&Travel Worker",
            content: "Отлично приложение, поддерживает не только IT собеседования, но и подготовку к Travel VISA интревью!"
        }
    ];
    useEffect(() => {
        initGA('YOUR-GA4-TRACKING-ID');
        logPageView(); 
    }, []);

    const [position, setPosition] = useState("");
    const [experience, setExperience] = useState("");

    // Load settings from localStorage
    useEffect(() => {
        const savedPosition = localStorage.getItem('position');
        const savedExperience = localStorage.getItem('grade');

        if (savedPosition) setPosition(savedPosition);
        if (savedExperience) setExperience(savedExperience);
    }, []);

    // Save settings to localStorage
    const handleSaveSettings = () => {
        localStorage.setItem('position', position);
        localStorage.setItem('grade', experience);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 text-gray-900">
            <Header />
            <main className="flex-1 py-12 bg-white">

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
MockTalk - ваш путь к успешному интервью!                            </p>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="w-full md:w-auto bg-black hover:bg-gray-800 text-white text-lg py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105">
                                        Начать тренировку
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] mx-auto">
                                    <DialogHeader>
                                        <VisuallyHidden>
                                            <DialogTitle>Настройки тренировки</DialogTitle>
                                        </VisuallyHidden>
                                        <DialogDescription>
                                            Выберите позицию и уровень опыта.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="specialization" className="text-right">
                                                Позиция
                                            </Label>
                                            <Select value={position} onValueChange={setPosition}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Выберите" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60 overflow-y-auto">
                                                    <SelectGroup>
                                                        <SelectItem value="frontend">Frontend</SelectItem>
                                                        <SelectItem value="backend">Backend</SelectItem>
                                                        <SelectItem value="fullstack">Fullstack</SelectItem>
                                                        <SelectItem value="devops">DevOps</SelectItem>
                                                        <SelectItem value="android-developer">Android Developer</SelectItem>
                                                        <SelectItem value="ios-developer">IOS Developer</SelectItem>
                                                        <SelectItem value="mobile-crossplarform dev">Mobile Cross Platform Developer</SelectItem>
                                                        <SelectItem value="machine-learning">Machine Learning</SelectItem>
                                                        <SelectItem value="data-analytics">Data analytics</SelectItem>
                                                        <SelectItem value="data-science">Data Science</SelectItem>
                                                        <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                                                        <SelectItem value="data-structures-and-algorithms">DSA</SelectItem>
                                                        <SelectItem value="visa-interview">VISA Interview </SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="experience" className="text-right">
                                                Уровень опыта
                                            </Label>
                                            <Select value={experience} onValueChange={setExperience}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Выберите" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-60 overflow-y-auto">
                                                    <SelectGroup>
                                                        <SelectItem value="intern">Intern</SelectItem>
                                                        <SelectItem value="junior">Junior</SelectItem>
                                                        <SelectItem value="mid">Mid</SelectItem>
                                                        <SelectItem value="senior">Senior</SelectItem>
                                                        <SelectItem value="lead">Lead</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex justify-center">
                                        <DialogFooter>
                                            <Link href='/talk'>
                                                <Button type="submit" onClick={handleSaveSettings}>Начать</Button>
                                            </Link>
                                        </DialogFooter>
                                    </div>
                                </DialogContent>
                            </Dialog>
                            
                            <div className="mt-8 space-y-4">
                                <div className="flex items-center">
                                    <BoltIcon className="text-sky-500 mr-2" />
                                    <p className="text-gray-700">Персонализированные вопросы адаптированы под вашу специализацию и уровень опыта.</p>
                                </div>
                                <div className="flex items-center">
                                    <BoltIcon className="text-sky-500 mr-2" />
                                    <p className="text-gray-700">Мгновенная обратная связь и советы по улучшению ваших ответов сразу после тренировки.</p>
                                </div>
                                <div className="flex items-center">
                                    <BoltIcon className="text-sky-500 mr-2" />
                                    <p className="text-gray-700">Подробный анализ вашего прогресса для отслеживания производительности.</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative md:w-1/2">
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent opacity-20 rounded-lg"></div>
                            <iframe
                                className="w-full aspect-video rounded-lg shadow-2xl"
                                src="https://www.youtube.com/embed/UTd3gwsbyw4?autoplay=1&playlist=UTd3gwsbyw4&mute=0"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                                    >
                            </iframe>
                        </div>

                    </div>
                </section>

                <section>
                    <div className="">


                    </div>

                </section>


                <section className="">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold text-center mb-12">Уникальные возможности MockTalk.ai</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: <FaRobot className="text-5xl text-sky-500 mb-4" />,
                                    title: "ИИ Аватар",
                                    description: "Проходите собеседование с реалистичным ИИ аватаром, имитирующим настоящего интервьюера."
                                },
                                {
                                    icon: <FaMicrophone className="text-5xl text-sky-500 mb-4" />,
                                    title: "Общение через микрофон",
                                    description: "Взаимодействуйте с ИИ аватаром в реальном времени, используя свой микрофон."
                                },
                                {
                                    icon: <FaCode className="text-5xl text-sky-500 mb-4" />,
                                    title: "Встроенный компилятор кода",
                                    description: "Демонстрируйте свои навыки программирования с поддержкой множества языков, включая SQL и PowerShell.( Работает на Desktop )"
                                },
                                {
                                    icon: <FaClipboardCheck className="text-5xl text-sky-500 mb-4" />,
                                    title: "Детальный фидбэк",
                                    description: "Получайте детальную обратную связь и рекомендации после каждого интервью."
                                }
                            ].map((feature, index) => (
                                <div key={index} className="bg-white p-6 rounded-lg shadow-lg transform transition duration-500 hover:scale-105">
                                    <div className="flex justify-center">{feature.icon}</div>
                                    <h3 className="text-xl font-semibold text-center mb-2">{feature.title}</h3>
                                    <p className="text-gray-600 text-center">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


                <section className="container mx-auto py-8 mb-24">
                    <div className="bg-gradient-to-r from-white via-gray-100 to-white p-8 rounded-lg shadow-xl transform hover:scale-105 transition-transform duration-500 ease-in-out">
                        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Как проходит интервью сессия?</h2>
                        <div className="space-y-6">
                            {interviewQuestions.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-6 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg hover:bg-gray-50"
                                >
                                    <div className="flex items-center mb-2">
                                        <div className="mr-3 text-3xl text-indigo-500">
                                            {item.icon}
                                        </div>
                                        <h4 className="text-xl font-semibold text-gray-900">{item.question}</h4>
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

                        <div className="">
                            {/* Carousel Navigation Buttons */}
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 hidden md:block">
                                <CarouselPrevious />
                            </div>
                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 hidden md:block">
                                <CarouselNext />
                            </div>

                            {/* Carousel Content */}
                       </div>

                    </Carousel>
                </section>


                
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
