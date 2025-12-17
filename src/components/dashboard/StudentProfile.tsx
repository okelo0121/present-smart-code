import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, GraduationCap, Calendar, Camera, Loader2, BookOpen } from "lucide-react";
// We can assume Student type has similar structure or adapt it
import { Student } from "@/types";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken, useAuth } from "@/hooks/useAuth";

interface StudentProfileProps {
    studentData: any; // Using any or specific Student type if flexible enough
    onProfileUpdate?: () => void;
}

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '') + '/api';
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export const StudentProfile = ({ studentData, onProfileUpdate }: StudentProfileProps) => {
    const { toast } = useToast();
    const { updateUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // Derived avatar
    const currentAvatar = avatarUrl || (
        typeof studentData?.userId === 'object' && studentData.userId.avatar
            ? `${BASE_URL}/${studentData.userId.avatar}`
            : null
    );

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: "Error",
                description: "Image size must be less than 2MB",
                variant: "destructive"
            });
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        setUploading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_URL}/users/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload avatar');

            const data = await response.json();

            setAvatarUrl(`${BASE_URL}/${data.avatar}`);
            updateUser({ avatar: data.avatar });
            if (onProfileUpdate) onProfileUpdate();

            toast({
                title: "Success",
                description: "Profile picture updated successfully",
            });
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: "Error",
                description: "Failed to upload profile picture",
                variant: "destructive"
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <Card className="bg-gradient-card">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-education-primary" />
                    <span>Student Information</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {studentData ? (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="relative group">
                                <div className="w-20 h-20 rounded-full bg-education-primary/10 flex items-center justify-center overflow-hidden border-2 border-education-primary/20">
                                    {currentAvatar ? (
                                        <img
                                            src={currentAvatar}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Users className="w-8 h-8 text-education-primary" />
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="absolute bottom-0 right-0 p-1.5 bg-education-primary text-white rounded-full hover:bg-education-primary/90 transition-colors shadow-lg"
                                >
                                    {uploading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Camera className="w-4 h-4" />
                                    )}
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/png, image/jpeg, image/webp"
                                    className="hidden"
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{studentData.name}</h3>
                                <p className="text-muted-foreground">Student</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Mail className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{studentData.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <GraduationCap className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Department</p>
                                        <Badge variant="outline" className="text-education-info border-education-info">
                                            {studentData.department || 'N/A'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Class</p>
                                        <p className="font-medium">{studentData.class || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Joined</p>
                                        <p className="font-medium">
                                            {studentData.createdAt ? new Date(studentData.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Loading profile information...</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
