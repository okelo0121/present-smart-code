import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken } from "@/hooks/useAuth";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL.replace(/\/$/, '')}/api`;

interface PostLessonProps {
    department: string;
    studentsByClass: Record<string, number>;
}

export const PostLesson = ({ department, studentsByClass }: PostLessonProps) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const lessonData = {
            class: formData.get('class'),
            topic: formData.get('topic'),
            description: formData.get('description'),
        };

        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await fetch(`${API_URL}/lessons`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(lessonData)
            });

            if (!response.ok) throw new Error('Failed to post lesson');

            const data = await response.json();
            toast({
                title: "Lesson Posted!",
                description: `Notification sent to ${data.recipientCount} students.`,
            });
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error('Error posting lesson:', error);
            toast({
                title: "Error",
                description: "Failed to post lesson.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Post Lesson & Notify</h2>
                <Badge variant="outline" className="text-education-info border-education-info">
                    {department || 'Department'}
                </Badge>
            </div>

            <Card className="bg-gradient-card">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Mail className="w-5 h-5 text-education-primary" />
                        <span>New Lesson Details</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Class</label>
                            <select name="class" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                <option value="">Select a class</option>
                                {Object.keys(studentsByClass).map(cls => (
                                    <option key={cls} value={cls}>{cls}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Topic</label>
                            <input name="topic" required placeholder="e.g., Introduction to React" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description / Message</label>
                            <textarea name="description" required placeholder="Brief description of the lesson..." className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                        </div>

                        <Button type="submit" className="w-full bg-gradient-primary" disabled={isSubmitting}>
                            <Mail className="w-4 h-4 mr-2" />
                            {isSubmitting ? "Posting..." : "Post & Notify"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
