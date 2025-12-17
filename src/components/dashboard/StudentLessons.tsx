import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, FileText, Download, Loader2, Video, Link as LinkIcon } from "lucide-react";
import { getAuthToken } from "@/hooks/useAuth";

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '') + '/api';

interface Material {
    type: 'pdf' | 'link' | 'video' | 'other';
    title: string;
    url: string;
}

interface Lesson {
    _id: string;
    topic: string;
    description: string;
    class: string;
    materials: Material[];
    createdAt: string;
}

export const StudentLessons = () => {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const token = getAuthToken();
                const response = await fetch(`${API_URL}/lessons`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setLessons(data);
                }
            } catch (error) {
                console.error("Failed to fetch lessons", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, []);

    const getMaterialIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
            case 'video': return <Video className="w-4 h-4 text-blue-500" />;
            case 'link': return <LinkIcon className="w-4 h-4 text-green-500" />;
            default: return <Download className="w-4 h-4 text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-education-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Classes & Lessons</h2>
                <Badge variant="outline" className="text-education-primary">
                    {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}
                </Badge>
            </div>

            {lessons.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                        <p>No lessons posted yet.</p>
                        <p className="text-sm">Check back later for updates from your teacher.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {lessons.map((lesson) => (
                        <Card key={lesson._id} className="bg-gradient-card hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-education-primary" />
                                            {lesson.topic}
                                        </CardTitle>
                                        <div className="flex items-center text-sm text-muted-foreground gap-4">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(lesson.createdAt).toLocaleDateString()}
                                            </span>
                                            <Badge variant="secondary" className="text-xs">
                                                {lesson.class}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground whitespace-pre-wrap">{lesson.description}</p>

                                {lesson.materials && lesson.materials.length > 0 && (
                                    <div className="pt-4 border-t border-border/50">
                                        <h4 className="text-sm font-medium mb-3">Materials</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {lesson.materials.map((material, idx) => (
                                                <a
                                                    key={idx}
                                                    href={material.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background/50 hover:bg-education-primary/5 transition-colors group"
                                                >
                                                    <div className="p-2 bg-background rounded-md shadow-sm group-hover:scale-105 transition-transform">
                                                        {getMaterialIcon(material.type)}
                                                    </div>
                                                    <span className="text-sm font-medium truncate flex-1">
                                                        {material.title}
                                                    </span>
                                                    <Download className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
