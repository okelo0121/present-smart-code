import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, CheckCircle, XCircle } from "lucide-react";
import { getAuthToken } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '') + '/api';

export const StudentCalendar = () => {
    const [attendanceDays, setAttendanceDays] = useState<Date[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = getAuthToken();
                const response = await fetch(`${API_URL}/attendance/history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Convert string dates to Date objects
                    const dates = data.map((record: any) => new Date(record.submittedAt));
                    setAttendanceDays(dates);
                }
            } catch (error) {
                console.error("Failed to load attendance history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    // Custom modifiers for react-day-picker
    const modifiers = {
        present: attendanceDays
    };

    const modifiersStyles = {
        present: {
            color: 'white',
            backgroundColor: 'var(--education-success-DEFAULT, #10b981)',
            fontWeight: 'bold',
            borderRadius: '50%'
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Attendance Calendar</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-education-primary" />
                            Monthly View
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center p-0 md:p-6">
                        <style>{`
                            .rdp {
                                --rdp-cell-size: 40px;
                                --rdp-accent-color: #f75555;
                                --rdp-background-color: #e7edff;
                                margin: 0;
                            }
                            .rdp-day_selected { 
                                background-color: var(--education-primary); 
                            }
                        `}</style>
                        <DayPicker
                            mode="multiple"
                            selected={attendanceDays}
                            modifiers={{ present: attendanceDays }}
                            modifiersStyles={modifiersStyles}
                            showOutsideDays
                            fixedWeeks
                        />
                    </CardContent>
                </Card>

                <Card className="bg-gradient-card">
                    <CardHeader>
                        <CardTitle>Attendance Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border">
                            <div className="p-3 bg-education-success/10 rounded-full">
                                <CheckCircle className="w-6 h-6 text-education-success" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Days Present</p>
                                <p className="text-3xl font-bold text-education-success">{attendanceDays.length}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Legend</h4>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-education-success"></div>
                                <span className="text-sm text-muted-foreground">Present (Class Attended)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-muted"></div>
                                <span className="text-sm text-muted-foreground">Absent / No Class</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
