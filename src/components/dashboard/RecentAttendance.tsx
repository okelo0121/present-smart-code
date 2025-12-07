import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken } from "@/hooks/useAuth";
import { AttendanceStats } from "@/types";

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL.replace(/\/$/, '')}/api`;

interface RecentAttendanceProps {
    attendanceData: AttendanceStats[];
}

export const RecentAttendance = ({ attendanceData }: RecentAttendanceProps) => {
    const { toast } = useToast();

    const handleExport = async () => {
        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await fetch(`${API_URL}/attendance/export`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to export CSV');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: "Export Successful",
                description: "Attendance data has been downloaded.",
            });
        } catch (error) {
            console.error('Export error:', error);
            toast({
                title: "Export Failed",
                description: "Could not download attendance data.",
                variant: "destructive",
            });
        }
    };

    return (
        <Card className="bg-gradient-card">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-education-primary" />
                        <span>Recent Attendance Reports</span>
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                    >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {attendanceData.length > 0 ? (
                        attendanceData.map((day, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <p className="font-medium">{day.date}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {day.present} present, {day.absent} absent
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="text-right">
                                        <p className="font-medium">{day.rate}%</p>
                                        <Progress value={day.rate} className="w-20" />
                                    </div>
                                    <Badge
                                        variant={day.rate >= 90 ? "default" : day.rate >= 80 ? "secondary" : "destructive"}
                                        className={
                                            day.rate >= 90
                                                ? "bg-education-success"
                                                : day.rate >= 80
                                                    ? "bg-education-warning"
                                                    : ""
                                        }
                                    >
                                        {day.rate >= 90 ? "Excellent" : day.rate >= 80 ? "Good" : "Needs Attention"}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-4">
                            No attendance reports available yet.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
