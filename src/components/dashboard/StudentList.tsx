import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, Mail } from "lucide-react";
import { Student } from "@/types";

interface StudentListProps {
    students: Student[];
}

export const StudentList = ({ students }: StudentListProps) => {
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
                                <TableHead>Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student._id}>
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
                                    <TableCell className="text-muted-foreground">
                                        {new Date(student.createdAt).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
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
