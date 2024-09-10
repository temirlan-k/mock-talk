import React, { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const companies = ["Google", "Apple", "Spotify"]
const sections = ["Behavioral", "Algorithmic", "Technical"]
const stacks = ["MERN", "MEAN", "Python/Django", "Java/Spring"]
const levels = ["Easy", "Medium", "Hard"]

export function InterviewSettingsModal() {
    const [company, setCompany] = useState("")
    const [section, setSection] = useState("")
    const [stack, setStack] = useState("")
    const [level, setLevel] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleStartInterview = async () => {
        if (!company || !section || !stack || !level) {
            alert("Пожалуйста, выберите все настройки")
            return
        }

        setIsLoading(true)

        try {
            const response = await axios.post('https://plankton-app-osvji.ondigitalocean.app/initialize-session/', {
                company_name: company,
                interview_type: section,
                stack: stack,
                interview_level: level
            })

            const { session_id } = response.data

            // Перенаправляем на страницу интервью с session_id в качестве query параметра
            router.push({
                pathname: '/talk',
                query: { session_id }
            })
        } catch (error) {
            console.error('Error initializing session:', error)
            alert('Произошла ошибка при инициализации сессии. Попробуйте еще раз.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full md:w-auto bg-black hover:bg-gray-800 text-white text-lg py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105">
                    Начать тренировку
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Настройки интервью</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Select onValueChange={setCompany}>
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите компанию" />
                        </SelectTrigger>
                        <SelectContent>
                            {companies.map((c) => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select onValueChange={setSection}>
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите раздел" />
                        </SelectTrigger>
                        <SelectContent>
                            {sections.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select onValueChange={setStack}>
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите стек" />
                        </SelectTrigger>
                        <SelectContent>
                            {stacks.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select onValueChange={setLevel}>
                        <SelectTrigger>
                            <SelectValue placeholder="Выберите уровень" />
                        </SelectTrigger>
                        <SelectContent>
                            {levels.map((l) => (
                                <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    onClick={handleStartInterview}
                    disabled={isLoading}
                    className="w-full"
                >
                    {isLoading ? 'Загрузка...' : 'Начать интервью'}
                </Button>
            </DialogContent>
        </Dialog>
    )
}