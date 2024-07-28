'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

const BASE_URL = "https://backend-mt-production.up.railway.app"

export default function ProfilePage() {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [profile, setProfile] = useState({
        email: '',

    })
    const [feedbacks, setFeedbacks] = useState([])

    const fetchProfileAndFeedbacks = async () => {
        const token = localStorage.getItem("userToken")
        if (token) {
            try {
                setIsLoading(true)
                // Fetch profile
                const profileResponse = await axios.get(`${BASE_URL}/users/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                console.log("Profile response data:", profileResponse.data)
                setProfile({
                    email: profileResponse.data.email || '',
                })

                // Fetch feedbacks
                const feedbacksResponse = await axios.get(`${BASE_URL}/feedbacks/`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                console.log("Fetched feedbacks:", feedbacksResponse.data)
                setFeedbacks(feedbacksResponse.data)
            } catch (error) {
                console.error("Error fetching data:", error)
            } finally {
                setIsLoading(false)
            }
        } else {
            console.error("User token is missing.")
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchProfileAndFeedbacks()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setProfile(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const token = localStorage.getItem("userToken")
        if (token) {
            try {
                await axios.put(`${BASE_URL}/users/me`, profile, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                setIsEditing(false)
            } catch (error) {
                console.error("Error updating profile:", error)
            }
        } else {
            console.error("User token is missing.")
        }
    }

    const handleGoHome = () => {
        router.push('/')
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">Профиль</h1>
                <Button onClick={handleGoHome}>Домой</Button>
            </div>
            <Tabs defaultValue="profile" className="max-w-4xl mx-auto">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile">Профиль</TabsTrigger>
                    <TabsTrigger value="feedbacks">AI Отчет</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <Card>
                        <CardHeader className="flex flex-col items-center space-y-4">

                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={profile.email}
                                        onChange={handleInputChange}
                                        readOnly={!isEditing}
                                    />
                                </div>

                                {isEditing && (
                                    <div className="flex justify-end">
                                        <Button type="submit">Save Changes</Button>
                                    </div>
                                )}

                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="feedbacks">
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <div>
                                <p className="text-muted-foreground">Персонализированные анализы интервью сессии</p>
                            </div>
                            <Button variant="outline" onClick={fetchProfileAndFeedbacks}>
                                Refresh
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center items-center h-[400px]">
                                    <p>Loading...</p>
                                </div>
                            ) : feedbacks.length > 0 ? (
                                <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                                    {feedbacks.map((feedback: any, index: number) => (
                                        <div key={feedback._id} className="mb-6 p-6 bg-secondary rounded-lg shadow-md">
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="text-lg font-semibold">Feedback #{feedbacks.length - index}</h3>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(feedback.timestamp * 1000).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-base leading-relaxed">{feedback.feedback}</p>
                                        </div>
                                    ))}
                                </ScrollArea>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-xl font-semibold mb-2">No feedbacks available yet</p>
                                    <p className="text-muted-foreground">Complete an interview to receive AI feedback</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
