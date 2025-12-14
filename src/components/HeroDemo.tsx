import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
    Users,
    Smartphone,
    CheckCircle2,
    Loader2,
    RefreshCw,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroDemo() {
    const [stage, setStage] = useState<'idle' | 'generating' | 'active' | 'success'>('idle');
    const [code, setCode] = useState<string>("");
    const [timeLeft, setTimeLeft] = useState(30);
    const [studentCode, setStudentCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    // Timer logic
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (stage === 'active' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && stage === 'active') {
            setStage('idle');
        }
        return () => clearInterval(timer);
    }, [stage, timeLeft]);

    const generateCode = () => {
        setStage('generating');
        // Simulate API call
        setTimeout(() => {
            const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
            setCode(randomCode);
            setTimeLeft(30);
            setStage('active');
            setStudentCode(""); // Reset student input
        }, 800);
    };

    const handleStudentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (studentCode.length !== 4) return;

        setIsVerifying(true);
        // Simulate verification
        setTimeout(() => {
            setIsVerifying(false);
            if (studentCode === code) {
                setStage('success');
            } else {
                // Shake animation effect could go here
            }
        }, 600);
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto h-[400px] md:h-[500px] perspective-1000">
            {/* Teacher View (Back/Main) */}
            <Card className={cn(
                "absolute top-0 left-0 md:left-4 w-full md:w-3/4 h-full bg-gradient-to-br from-background to-secondary/10 border-border/50 shadow-2xl transition-all duration-500",
                stage === 'success' ? "scale-95 opacity-50 blur-[2px]" : "z-10"
            )}>
                <div className="p-6 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-semibold">Teacher Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live
                    </div>
                </div>

                <div className="p-8 flex flex-col items-center justify-center h-[calc(100%-80px)] space-y-8">
                    {stage === 'idle' && (
                        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-10 h-10 text-primary/40" />
                            </div>
                            <h3 className="text-xl font-medium">Ready to take attendance?</h3>
                            <Button size="lg" onClick={generateCode} className="shadow-lg hover:shadow-xl transition-all">
                                Generate Class Code
                            </Button>
                        </div>
                    )}

                    {stage === 'generating' && (
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                            <p className="text-muted-foreground">Creating secure session...</p>
                        </div>
                    )}

                    {(stage === 'active' || stage === 'success') && (
                        <div className="text-center w-full animate-in fade-in zoom-in duration-300">
                            <p className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Class Code</p>
                            <div className="text-6xl md:text-8xl font-black text-primary tracking-widest font-mono mb-8 tabular-nums">
                                {code}
                            </div>

                            <div className="flex items-center justify-center gap-2 text-orange-500 font-medium bg-orange-500/10 py-2 px-4 rounded-full w-fit mx-auto">
                                <Clock className="w-4 h-4" />
                                <span>Expires in {timeLeft}s</span>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Student View (Floating Overlay) */}
            <Card className={cn(
                "absolute -bottom-8 -right-4 md:-right-8 w-64 md:w-72 bg-black text-white border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 p-4 rounded-[2rem]",
                stage === 'success' ? "scale-110 z-20 bottom-12 right-12" : "z-20"
            )}>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-10" />

                <div className="h-full bg-gray-900 rounded-[1.5rem] overflow-hidden flex flex-col relative">
                    {/* Status Bar */}
                    <div className="px-4 py-3 flex justify-between items-center text-[10px] text-gray-400">
                        <span>9:41</span>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 bg-gray-400 rounded-sm" />
                            <div className="w-3 h-3 bg-gray-400 rounded-sm" />
                        </div>
                    </div>

                    <div className="flex-1 p-6 flex flex-col justify-center">
                        {stage === 'success' ? (
                            <div className="text-center animate-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                                    <CheckCircle2 className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">You're Present!</h3>
                                <p className="text-gray-400 text-sm">Attendance recorded at 9:42 AM</p>
                                <Button variant="ghost" className="mt-8 text-xs text-gray-500 hover:text-white hover:bg-white/5" onClick={() => { setStage('idle'); setStudentCode(''); }}>
                                    Done
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleStudentSubmit} className="space-y-6">
                                <div className="text-center mb-4">
                                    <Smartphone className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                    <h4 className="font-medium">Enter Code</h4>
                                </div>

                                <Input
                                    value={studentCode}
                                    onChange={(e) => setStudentCode(e.target.value.slice(0, 4))}
                                    placeholder="0000"
                                    className="bg-gray-800/50 border-gray-700 text-center text-3xl tracking-[0.5em] h-16 font-mono focus-visible:ring-primary focus-visible:border-primary placeholder:tracking-normal placeholder:text-gray-700"
                                    maxLength={4}
                                    disabled={stage !== 'active'}
                                />

                                <Button
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90"
                                    disabled={stage !== 'active' || studentCode.length !== 4 || isVerifying}
                                >
                                    {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check In"}
                                </Button>

                                {stage === 'idle' && (
                                    <p className="text-center text-xs text-gray-600">Waiting for teacher...</p>
                                )}
                            </form>
                        )}
                    </div>

                    {/* Home Indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-gray-700/50 rounded-full" />
                </div>
            </Card>

            {/* Reset Button (Debug/Demo Loop) */}
            {stage !== 'idle' && (
                <button
                    onClick={() => { setStage('idle'); setStudentCode(''); setCode(''); }}
                    className="absolute -top-12 right-0 text-muted-foreground hover:text-foreground text-xs flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity"
                >
                    <RefreshCw className="w-3 h-3" /> Reset Demo
                </button>
            )}
        </div>
    );
}
