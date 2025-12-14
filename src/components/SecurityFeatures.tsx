import { Globe, Fingerprint, Clock, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SecurityFeatures() {
    const features = [
        {
            icon: Globe,
            title: "Geo-Fencing",
            description: "Students must be physically located in your classroom to check in. GPS validation ensures no remote attendance.",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            icon: Fingerprint,
            title: "Device Lock",
            description: "One account, one device. Prevents students from checking in for their friends using multiple logins on a single phone.",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
        {
            icon: Clock,
            title: "Expiring Codes",
            description: "Attendance codes vanish in 30 seconds. No more sharing codes in group chats or social media.",
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        }
    ];

    return (
        <div className="w-full max-w-6xl mx-auto px-4">
            <div className="text-center mb-12 space-y-4">
                <div className="inline-flex items-center justify-center p-2 bg-green-500/10 rounded-full mb-4">
                    <ShieldCheck className="w-6 h-6 text-green-600 mr-2" />
                    <span className="text-sm font-semibold text-green-700 tracking-wide uppercase">Enterprise Grade Security</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold">Cheat-Proof Attendance</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    We use advanced technology to ensure that every check-in is authentic and verified.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <Card
                        key={index}
                        className="group relative overflow-hidden border-border/50 bg-card hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 ${feature.bg} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />

                        <CardHeader>
                            <div className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className={`w-7 h-7 ${feature.color}`} />
                            </div>
                            <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
