import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface StudentsByClassProps {
    studentsByClass: Record<string, number>;
    onClassClick?: (className: string) => void;
}

export const StudentsByClass = ({ studentsByClass, onClassClick }: StudentsByClassProps) => {
    return (
        <Card className="bg-gradient-card">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-education-primary" />
                    <span>Students by Class</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {Object.entries(studentsByClass).length > 0 ? (
                        Object.entries(studentsByClass).map(([className, count]) => (
                            <div
                                key={className}
                                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
                                onClick={() => onClassClick?.(className)}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-education-primary/10 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-education-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{className}</p>
                                        <p className="text-sm text-muted-foreground">{count} students</p>
                                    </div>
                                </div>
                                <Badge className="bg-education-primary">
                                    {count}
                                </Badge>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-4">
                            No students yet. Start by inviting students to your classes.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
