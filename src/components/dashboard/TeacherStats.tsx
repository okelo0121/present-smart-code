import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";

interface TeacherStatsProps {
    totalStudents: number;
    studentsPresent: number;
    attendanceRate: number;
}

export const TeacherStats = ({ totalStudents, studentsPresent, attendanceRate }: TeacherStatsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-card">
                <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-education-primary/10 rounded-lg">
                            <Users className="w-6 h-6 text-education-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Students</p>
                            <p className="text-2xl font-bold">{totalStudents}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-card">
                <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-education-success/10 rounded-lg">
                            <UserCheck className="w-6 h-6 text-education-success" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Present Today</p>
                            <p className="text-2xl font-bold">{studentsPresent}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-card">
                <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-destructive/10 rounded-lg">
                            <UserX className="w-6 h-6 text-destructive" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Absent Today</p>
                            <p className="text-2xl font-bold">{totalStudents - studentsPresent}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-card">
                <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-education-warning/10 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-education-warning" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Attendance Rate</p>
                            <p className="text-2xl font-bold">{attendanceRate}%</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
