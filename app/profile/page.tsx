'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const BASE_URL = "https://atlantys.kz/test"

export default function ProfilePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [feedbacks, setFeedbacks] = useState([])

    const fetchFeedbacks = async () => {
        const token = localStorage.getItem("userToken")
        if (token) {
            try {
                setIsLoading(true)
                const feedbacksResponse = await axios.get(`${BASE_URL}/feedbacks/`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                console.log("Fetched feedbacks:", feedbacksResponse.data)
                setFeedbacks(feedbacksResponse.data)
            } catch (error) {
                console.error("Error fetching feedbacks:", error)
            } finally {
                setIsLoading(false)
            }
        } else {
            console.error("User token is missing.")
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchFeedbacks()
    }, [])

    const handleGoHome = () => {
        router.push('/')
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">AI Feedbacks</h1>
                <Button onClick={handleGoHome}>Домой</Button>
            </div>
            <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <div>
                        <CardTitle className="text-2xl">Персонализированные анализы</CardTitle>
                        <p className="text-muted-foreground mt-1">Результаты ваших интервью сессий</p>
                    </div>
                    <Button variant="outline" onClick={fetchFeedbacks} className="w-full sm:w-auto">
                        Обновить
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-[400px]">
                            <p>Загрузка...</p>
                        </div>
                    ) : feedbacks.length > 0 ? (
                        <ScrollArea className="h-[70vh] w-full pr-4">
                            <div className="space-y-6">
                                {feedbacks.map((feedback: any, index) => (
                                    <Card key={feedback._id}>
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle>Отчет #{feedbacks.length - index}</CardTitle>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(feedback.timestamp * 1000).toLocaleString()}
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Accordion type="single" collapsible className="w-full">
                                                <AccordionItem value="feedback">
                                                    <AccordionTrigger>Анализ интервью</AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="pl-4 border-l-2 border-primary">
                                                            {feedback.feedback.split('\n\n').map((section: any, sectionIndex: any) => (
                                                                <div key={sectionIndex} className="mb-4">
                                                                    <p className="whitespace-pre-wrap">{section}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                                <AccordionItem value="history">
                                                    <AccordionTrigger>История диалога</AccordionTrigger>
                                                    <AccordionContent>
                                                        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                                                            <div className="space-y-4">
                                                                {feedback.history && feedback.history.map((entry: any, entryIndex: any) => (
                                                                    <div key={entryIndex} className={`flex ${entry.role === 'Human' ? 'justify-end' : 'justify-start'}`}>
                                                                        <div className={`max-w-[70%] p-3 rounded-lg ${entry.role === 'Human' ? 'bg-blue-100 text-right' : 'bg-green-100'}`}>
                                                                            <p className="text-sm font-semibold mb-1">{entry.role === 'Human' ? 'Вы' : 'AI'}</p>
                                                                            <p>{entry.content}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </ScrollArea>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-xl font-semibold mb-2">Отчеты пока недоступны</p>
                            <p className="text-muted-foreground">Пройдите интервью, чтобы получить AI-отчет</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}