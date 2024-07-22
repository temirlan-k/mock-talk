'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false)
    const [profile, setProfile] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        jobTitle: 'Software Engineer',
        experience: '5 years',
        bio: 'Passionate about building scalable web applications and solving complex problems.'
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setProfile(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Here you would typically send the updated profile to your backend
        console.log('Updated profile:', profile)
        setIsEditing(false)
    }

    return (
        <div className="container mx-auto p-4">
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src="/avatar-placeholder.png" alt="Profile picture" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <CardTitle>{profile.name}</CardTitle>
                    </div>
                    <Button onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={profile.name}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                            />
                        </div>
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
                        <div className="space-y-2">
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input
                                id="jobTitle"
                                name="jobTitle"
                                value={profile.jobTitle}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="experience">Experience</Label>
                            <Input
                                id="experience"
                                name="experience"
                                value={profile.experience}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                value={profile.bio}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                rows={4}
                            />
                        </div>
                        {isEditing && (
                            <Button type="submit" className="w-full">Save Changes</Button>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}