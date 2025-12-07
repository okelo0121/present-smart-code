import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QrCode, Clock, RefreshCw, Users, UserCheck, UserX } from "lucide-react";

interface CodeGeneratorProps {
    currentCode: string | null;
    timeLeft: number;
    studentsPresent: number;
    totalStudents: number;
    attendanceRate: number;
    onGenerateCode: () => void;
    formatTime: (seconds: number) => string;
}

export const CodeGenerator = ({
    currentCode,
    timeLeft,
    studentsPresent,
    totalStudents,
    attendanceRate,
    onGenerateCode,
    formatTime
}: CodeGeneratorProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code Generation Card */}
            <Card className="bg-gradient-card">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <QrCode className="w-5 h-5 text-education-primary" />
                        <span>Current Session</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {currentCode ? (
                        <div className="text-center space-y-4">
                            <div className="bg-gradient-primary text-white p-6 rounded-lg">
                                <p className="text-sm opacity-90">Attendance Code</p>
                                <p className="text-3xl font-bold tracking-wider">{currentCode}</p>
                            </div>
                            <div className="flex items-center justify-center space-x-2 text-education-warning">
                                <Clock className="w-4 h-4" />
                                <span className="font-medium">Time remaining: {formatTime(timeLeft)}</span>
                            </div>
                            <Progress value={(timeLeft / 120) * 100} className="w-full" />
                        </div>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="w-24 h-24 mx-auto bg-secondary rounded-full flex items-center justify-center">
                                <QrCode className="w-12 h-12 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground">No active attendance session</p>
                        </div>
                    )}

                    <Button
                        onClick={onGenerateCode}
                        disabled={!!currentCode}
                        className="w-full bg-gradient-primary hover:bg-education-primary-dark transition-smooth"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {currentCode ? "Session Active" : "Generate New Code"}
                    </Button>
                </CardContent>
            </Card>

            {/* Real-time Attendance */}
            <Card className="bg-gradient-card">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-education-secondary" />
                        <span>Live Attendance</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-education-success/10 rounded-lg border border-education-success/20">
                            <UserCheck className="w-6 h-6 mx-auto text-education-success mb-2" />
                            <p className="text-2xl font-bold text-education-success">{studentsPresent}</p>
                            <p className="text-sm text-muted-foreground">Present</p>
                        </div>
                        <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                            <UserX className="w-6 h-6 mx-auto text-destructive mb-2" />
                            <p className="text-2xl font-bold text-destructive">{totalStudents - studentsPresent}</p>
                            <p className="text-sm text-muted-foreground">Absent</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Attendance Rate</span>
                            <span className="font-medium">{attendanceRate}%</span>
                        </div>
                        <Progress value={attendanceRate} className="w-full" />
                    </div>

                    {currentCode && (
                        <div className="text-center text-sm text-muted-foreground">
                            Students are marking attendance in real-time
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
