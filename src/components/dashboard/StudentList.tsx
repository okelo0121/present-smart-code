import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { GraduationCap, Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Student } from "@/types";
import { useState } from "react";

interface StudentListProps {
    students: Student[];
    presentStudentIds?: string[];
    onUpdateAttendance?: (studentId: string, status: 'present' | 'absent') => Promise<void>;
    onStudentClick?: (studentId: string) => void;
}

export const StudentList = ({ students, presentStudentIds = [], onUpdateAttendance, onStudentClick }: StudentListProps) => {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleUpdate = async (e: React.MouseEvent, studentId: string, status: 'present' | 'absent') => {
        e.stopPropagation(); // Prevent row click
        if (!onUpdateAttendance) return;
        setLoadingId(studentId);
        await onUpdateAttendance(studentId, status);
        setLoadingId(null);
    };

    return (
        <Card className="bg-gradient-card">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-education-primary" />
                    <span>Student List</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {students.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead className="text-right">Today's Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => {
                                const isPresent = presentStudentIds.includes(student._id);
                                return (
                                    <TableRow
                                        key={student._id}
                                        className={onStudentClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
                                        onClick={() => onStudentClick && onStudentClick(student._id)}
                                    >
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Mail className="w-4 h-4 text-muted-foreground" />
                                                <span>{student.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{student.class || 'Not assigned'}</Badge>
                                        </TableCell>
                                        <TableCell>{student.department || 'Not assigned'}</TableCell>
                                        <TableCell className="text-right">
                                            {onUpdateAttendance && (
                                                <Button
                                                    variant={isPresent ? "ghost" : "outline"}
                                                    size="sm"
                                                    disabled={loadingId === student._id}
                                                    onClick={(e) => handleUpdate(e, student._id, isPresent ? 'absent' : 'present')}
                                                    className={isPresent ? "text-education-success hover:text-education-success/80" : "text-muted-foreground hover:text-foreground"}
                                                >
                                                    {loadingId === student._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : isPresent ? (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            Present
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-4 h-4 mr-2" />
                                                            Mark Present
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-8">
                        <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No students yet.</p>
                        <p className="text-sm text-muted-foreground">Start by inviting students to your classes.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
