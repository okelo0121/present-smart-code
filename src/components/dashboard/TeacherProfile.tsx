import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, GraduationCap, Calendar } from "lucide-react";
import { Teacher } from "@/types";

interface TeacherProfileProps {
    teacherData: Teacher | null;
}

export const TeacherProfile = ({ teacherData }: TeacherProfileProps) => {
    return (
        <Card className="bg-gradient-card">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-education-primary" />
                    <span>Teacher Information</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {teacherData ? (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-full bg-education-primary/10 flex items-center justify-center">
                                <Users className="w-8 h-8 text-education-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{teacherData.name}</h3>
                                <p className="text-muted-foreground">Teacher</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Mail className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{teacherData.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <GraduationCap className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Department</p>
                                        <Badge variant="outline" className="text-education-info border-education-info">
                                            {teacherData.department}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Joined</p>
                                        <p className="font-medium">
                                            {new Date(teacherData.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
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
