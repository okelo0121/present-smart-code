
import { BarChart3, CheckCircle2, ArrowRight, MoreHorizontal, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useNavigate } from "react-router-dom";

export function FeatureSpotlights() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-24 py-12">
            {/* Spotlight 1: Real-Time Tracking (Dashboard Visual) */}
            <div className="grid lg:grid-cols-2 gap-12 md:gap-24 items-center">
                <div className="order-2 lg:order-1 space-y-8">
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                        Real-Time Insights
                    </Badge>
                    <h3 className="text-3xl md:text-5xl font-bold leading-tight">
                        Watch Attendance Happen <br />
                        <span className="text-primary">In Real-Time</span>
                    </h3>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        Stop guessing who is in class. Our live dashboard updates instantly as students check in,
                        giving you a bird's-eye view of your classroom engagement as it happens.
                    </p>
                    <ul className="space-y-4 pt-4">
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                            <span className="text-lg">Instant verification of physical presence</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                            <span className="text-lg">Live tally of present vs absent students</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                            <span className="text-lg">Export data immediately after class</span>
                        </li>
                    </ul>
                    <div className="pt-4">
                        <Button
                            variant="link"
                            className="p-0 h-auto text-lg font-semibold group"
                            onClick={() => navigate('/auth')}
                        >
                            Explore Live Dashboard <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>

                {/* Mock Dashboard UI */}
                <div className="order-1 lg:order-2">
                    <Card className="p-2 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800 border-border/50 shadow-2xl rounded-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                        <div className="bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden">
                            {/* Window Header */}
                            <div className="border-b px-4 py-3 flex items-center justify-between bg-muted/30">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">dashboard.edutrack.store</div>
                            </div>

                            {/* Dashboard Content */}
                            <div className="p-6 space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Current Session</div>
                                        <div className="text-2xl font-bold mt-1">Intro to Computer Science</div>
                                    </div>
                                    <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200">
                                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" /> Live
                                    </Badge>
                                </div>

                                {/* Graph Bars */}
                                <div className="flex items-end gap-2 h-48 pt-4">
                                    {[40, 65, 45, 80, 55, 90, 85].map((h, i) => (
                                        <div key={i} className="flex-1 group relative">
                                            <div
                                                className="bg-primary/10 group-hover:bg-primary/20 rounded-t-lg transition-all duration-500 w-full relative overflow-hidden"
                                                style={{ height: `${h}%` }}
                                            >
                                                <div className="absolute bottom-0 w-full h-1 bg-primary/50" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/30 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                            <Users className="w-4 h-4" /> Present
                                        </div>
                                        <div className="text-2xl font-bold">142</div>
                                    </div>
                                    <div className="bg-muted/30 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                            <TrendingUp className="w-4 h-4" /> Rate
                                        </div>
                                        <div className="text-2xl font-bold text-green-600">94%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Spotlight 2: Analytics (Mobile App Visual) */}
            <div className="grid lg:grid-cols-2 gap-12 md:gap-24 items-center">
                {/* Mock Mobile App UI */}
                <div className="relative mx-auto lg:mx-0 max-w-[320px]">
                    <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full opacity-50" />
                    <div className="relative bg-black rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden h-[600px]">
                        {/* Dynamic Island */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-24 bg-black rounded-b-2xl z-20" />

                        {/* App Content */}
                        <div className="bg-white h-full pt-12 p-6 flex flex-col">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h4 className="text-gray-500 text-sm font-medium">Analytics</h4>
                                    <h2 className="text-2xl font-bold text-gray-900">Weekly Report</h2>
                                </div>
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-gray-600" />
                                </div>
                            </div>

                            <div className="space-y-4 overflow-hidden">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4 hover:bg-gray-100 transition-colors">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${i === 1 ? 'bg-blue-100 text-blue-600' :
                                            i === 2 ? 'bg-purple-100 text-purple-600' :
                                                i === 3 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                            {i === 1 ? <TrendingUp className="w-6 h-6" /> :
                                                i === 2 ? <Users className="w-6 h-6" /> :
                                                    <BarChart3 className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">
                                                {i === 1 ? 'Attendance Rate' : i === 2 ? 'Total Students' : 'Class Average'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {i === 1 ? '+2.4% vs last week' : 'Active across 3 classes'}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Graph in App */}
                                <div className="mt-8 bg-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-200">
                                    <div className="text-blue-100 text-sm mb-4">Retention Trend</div>
                                    <div className="h-24 flex items-end justify-between gap-2">
                                        {[30, 45, 35, 60, 50, 75, 65].map((h, k) => (
                                            <div key={k} className="w-full bg-white/20 rounded-t-sm" style={{ height: `${h}%` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                        Deep Analytics
                    </Badge>
                    <h3 className="text-3xl md:text-5xl font-bold leading-tight">
                        Data That Drives <br />
                        <span className="text-primary">Better Decisions</span>
                    </h3>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        Go beyond simple check-ins. Our analytics suite helps you identify at-risk students
                        early, track participation trends over time, and generate comprehensive reports for
                        administration with a single click.
                    </p>
                    <ul className="space-y-4 pt-4">
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                            <span className="text-lg">Identify engagement drops early</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                            <span className="text-lg">Visual trends for every student</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                            <span className="text-lg">Automated weekly email summaries</span>
                        </li>
                    </ul>
                    <div className="pt-4">
                        <Button
                            variant="link"
                            className="p-0 h-auto text-lg font-semibold group"
                            onClick={() => navigate('/auth')}
                        >
                            View Sample Reports <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
