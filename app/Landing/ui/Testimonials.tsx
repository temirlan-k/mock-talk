'use client'

import React from 'react'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../../../components/ui/carousel"
import { Card, CardContent } from "../../../components/ui/card"

const testimonials = [
    {
        id: 1,
        name: "Алексей Петров",
        role: "Разработчик",
        content: "MockTalk.ai помог мне подготовиться к собеседованию и получить работу мечты!",
    },
    {
        id: 2,
        name: "Мария Иванова",
        role: "Дизайнер",
        content: "Отличный инструмент для практики. Теперь я чувствую себя уверенно на любом интервью.",
    },
    {
        id: 3,
        name: "Сергей Сидоров",
        role: "Менеджер проектов",
        content: "Рекомендую всем, кто хочет улучшить свои навыки прохождения собеседований.",
    },
]

export function TestimonialCarousel() {
    return (
        <Carousel
            opts={{
                align: "start",
            }}
            className="w-full max-w-sm"
        >
            <CarouselContent>
                {testimonials.map((testimonial) => (
                    <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                            <Card>
                                <CardContent className="flex aspect-square items-center justify-center p-6">
                                    <div className="text-center">
                                        <p className="text-lg font-semibold mb-2">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground mb-4">{testimonial.role}</p>
                                        <p className="text-sm">{testimonial.content}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    )
}