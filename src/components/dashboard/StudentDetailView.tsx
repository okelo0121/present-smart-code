import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, User, Calendar, Clock, CheckCircle, Mail, GraduationCap } from "lucide-react";
import { getAuthToken } from "@/hooks/useAuth";

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '') + '/api';
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

interface StudentDetailViewProps {
    studentId: string;
    onBack: () => void;
}

export const StudentDetailView = ({ studentId, onBack }: StudentDetailViewProps) => {
    const [student, setStudent] = useState<any>(null);
    const [records, setRecords] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const token = getAuthToken();
                const response = await fetch(`${API_URL}/attendance/student/${studentId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setStudent(data.student);
                    setRecords(data.records);
                    setStats(data.stats);
                }
            } catch (error) {
                console.error("Failed to load student details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [studentId]);

    if (loading) return <div className="p-8 text-center">Loading details...</div>;
    if (!student) return <div className="p-8 text-center text-destructive">Student not found</div>;

    const avatarUrl = student.avatar ? `${BASE_URL}/${student.avatar}` : null;

    return (
        <div className="space-y-6">
            <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
                Back to List
            </Button>

            {/* Profile Header */}
            <Card className="bg-gradient-card">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-education-primary/10 flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-education-primary" />
                            )}
                        </div>
                        <div className="text-center md:text-left space-y-2 flex-1">
                            <h2 className="text-3xl font-bold">{student.name}</h2>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {student.email}
                                </span>
                                <span className="flex items-center gap-1">
                                    <GraduationCap className="w-4 h-4" />
                                    {student.class || 'No Class'} | {student.department}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-background/50 rounded-xl min-w-[150px]">
                            <span className="text-3xl font-bold text-education-success">{stats.totalPresent}</span>
                            <span className="text-sm text-muted-foreground uppercase tracking-wide">Classes Attended</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detailed History */}
            <Card className="bg-gradient-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-education-primary" />
                        Attendance History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {records.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {records.map((record: any) => {
                                        const date = new Date(record.submittedAt);
                                        return (
                                            <TableRow key={record._id}>
                                                <TableCell className="font-medium">
                                                    {date.toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3 h-3 text-muted-foreground" />
                                                        {date.toLocaleTimeString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {record.codeId ? (
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            Code: {record.codeId.code}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Manual Entry
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-education-success/10 text-education-success hover:bg-education-success/20 border-0">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Present
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            No attendance records found for this student.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
