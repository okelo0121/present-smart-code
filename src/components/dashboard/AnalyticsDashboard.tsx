import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserX, TrendingUp, Users, Activity } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { useEffect, useState } from "react";
import { getAuthToken } from "@/hooks/useAuth";

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '') + '/api';

export const AnalyticsDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = getAuthToken();
                const response = await fetch(`${API_URL}/attendance/analytics`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading analytics...</div>;
    if (!stats) return <div className="p-8 text-center text-muted-foreground">Failed to load data</div>;

    const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981'];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Attendance Analytics</h2>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Students
                        </CardTitle>
                        <Users className="w-4 h-4 text-education-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalStudents}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Average Attendance
                        </CardTitle>
                        <TrendingUp className="w-4 h-4 text-education-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.averageAttendance}%</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            At Risk Students
                        </CardTitle>
                        <UserX className="w-4 h-4 text-education-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.lowAttendanceStudents.length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Trend Chart */}
                <Card className="bg-gradient-card">
                    <CardHeader>
                        <CardTitle>Attendance Trends (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.weeklyTrend}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                />
                                <Line type="monotone" dataKey="attendance" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Class Performance Chart */}
                <Card className="bg-gradient-card">
                    <CardHeader>
                        <CardTitle>Class Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.classPerformance}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="attendance" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                    {stats.classPerformance.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Low Attendance List */}
            <Card className="bg-gradient-card">
                <CardHeader>
                    <CardTitle className="text-education-warning flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Students at Risk (Low Attendance)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.lowAttendanceStudents.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">Great! No students are at risk.</p>
                        ) : (
                            stats.lowAttendanceStudents.map((student: any) => (
                                <div key={student.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-education-warning/10 flex items-center justify-center">
                                            <span className="font-bold text-education-warning">{student.attendance}%</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{student.name}</p>
                                            <p className="text-sm text-muted-foreground">{student.email}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="border-education-warning text-education-warning">
                                        At Risk
                                    </Badge>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
