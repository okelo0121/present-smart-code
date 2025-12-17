import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken } from "@/hooks/useAuth";

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '') + '/api';

export const ReportsView = () => {
    const [downloading, setDownloading] = useState(false);
    const { toast } = useToast();

    const handleExport = async () => {
        try {
            setDownloading(true);
            const token = getAuthToken();

            if (!token) {
                toast({
                    title: "Authentication Error",
                    description: "Please sign in again to export data.",
                    variant: "destructive"
                });
                return;
            }

            const response = await fetch(`${API_URL}/attendance/export`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to export data');
            }

            // Create a blob from the response
            const blob = await response.blob();

            // Create a link to download the file
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: "Export Successful",
                description: "Your attendance report has been downloaded.",
            });
        } catch (error) {
            console.error('Export error:', error);
            toast({
                title: "Export Failed",
                description: "Could not download the attendance report. Please try again.",
                variant: "destructive"
            });
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Reports & Exports</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-education-success" />
                            Attendance CSV Export
                        </CardTitle>
                        <CardDescription>
                            Download a detailed CSV report of all attendance records for your classes.
                            Useful for importing into Excel or Google Sheets.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside text-sm text-muted-foreground mb-6 space-y-1">
                            <li>Includes student names, emails, and IDs</li>
                            <li>Includes timestamp and attendance codes</li>
                            <li>Compatible with most spreadsheet software</li>
                        </ul>

                        <Button
                            onClick={handleExport}
                            disabled={downloading}
                            className="w-full sm:w-auto"
                        >
                            {downloading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating Report...
                                </>
                            ) : (
                                <>
                                    <FileDown className="w-4 h-4 mr-2" />
                                    Download CSV Report
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* You can add more report types here in the future */}
                <Card className="bg-secondary/20 border-dashed">
                    <CardHeader>
                        <CardTitle className="text-muted-foreground">More Reports Coming Soon</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center py-8 text-muted-foreground text-sm">
                        Detailed PDF summaries and class-specific breakdown reports are under development.
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
