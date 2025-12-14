
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Clock, Users, Calendar, TrendingUp } from "lucide-react";

export function ROICalculator() {
    const [numStudents, setNumStudents] = useState<number[]>([30]);
    const [classesPerWeek, setClassesPerWeek] = useState<number[]>([10]);
    const [hoursSaved, setHoursSaved] = useState(0);
    const [checkinsManaged, setCheckinsManaged] = useState(0);

    useEffect(() => {
        // Formula: (Classes * 5 mins * 15 weeks) / 60
        const classes = classesPerWeek[0];
        const students = numStudents[0];
        const weeks = 15; // Standard semester

        const minutesSaved = classes * 5 * weeks;
        const hours = Math.round((minutesSaved / 60) * 10) / 10; // Round to 1 decimal
        setHoursSaved(hours);

        // Checkins managed
        setCheckinsManaged(students * classes * weeks);
    }, [numStudents, classesPerWeek]);

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-2xl overflow-hidden relative">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />

                <CardHeader className="text-center relative z-10 pb-2">
                    <div className="mx-auto w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm shadow-lg">
                        <Calculator className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-3xl md:text-4xl font-bold">See How Much Time You'll Save</CardTitle>
                    <p className="text-blue-100 max-w-lg mx-auto mt-2">
                        Taking attendance manually wastes roughly 5 minutes per class. See how much time you reclaim per semester.
                    </p>
                </CardHeader>

                <CardContent className="grid md:grid-cols-2 gap-8 md:gap-12 pt-8 relative z-10">
                    {/* Controls */}
                    <div className="space-y-8 bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="flex items-center gap-2 font-medium">
                                    <Users className="w-4 h-4 text-blue-200" />
                                    Students per Class
                                </label>
                                <span className="bg-white/20 px-3 py-1 rounded-full font-mono font-bold text-sm">
                                    {numStudents[0]}
                                </span>
                            </div>
                            <Slider
                                value={numStudents}
                                onValueChange={setNumStudents}
                                min={10}
                                max={100}
                                step={1}
                                className="py-4"
                            />
                            <div className="flex justify-between text-xs text-blue-200 px-1">
                                <span>10</span>
                                <span>100</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="flex items-center gap-2 font-medium">
                                    <Calendar className="w-4 h-4 text-blue-200" />
                                    Classes per Week
                                </label>
                                <span className="bg-white/20 px-3 py-1 rounded-full font-mono font-bold text-sm">
                                    {classesPerWeek[0]}
                                </span>
                            </div>
                            <Slider
                                value={classesPerWeek}
                                onValueChange={setClassesPerWeek}
                                min={1}
                                max={50}
                                step={1}
                                className="py-4"
                            />
                            <div className="flex justify-between text-xs text-blue-200 px-1">
                                <span>1</span>
                                <span>50</span>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="flex flex-col justify-center space-y-6">
                        <div className="text-center md:text-left space-y-2">
                            <p className="text-blue-200 font-medium flex items-center justify-center md:justify-start gap-2">
                                <Clock className="w-5 h-5" />
                                Time Reclaimed Per Semester
                            </p>
                            <div className="text-6xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
                                <span className="tabular-nums">{hoursSaved}</span>
                                <span className="text-2xl md:text-3xl font-normal text-blue-200 ml-2">Hrs</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                                <p className="text-xs text-blue-200 uppercase tracking-wider mb-1">Check-ins Managed</p>
                                <p className="text-2xl font-bold flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    {checkinsManaged.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-white/10 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                                <p className="text-xs text-blue-200 uppercase tracking-wider mb-1">Weeks</p>
                                <p className="text-2xl font-bold">15</p>
                            </div>
                        </div>

                        <p className="text-sm text-blue-200/80 italic text-center md:text-left">
                            * Based on an average 15-week academic semester
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
