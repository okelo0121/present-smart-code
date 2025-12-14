import {
    FileSpreadsheet,
    Slack,
    GraduationCap,
    BookOpen,
    Layout,
    MessageSquare,
    Database
} from "lucide-react";

export function IntegrationsSection() {
    const integrations = [
        { name: "Google Classroom", icon: Layout, color: "text-green-600" },
        { name: "Canvas", icon: GraduationCap, color: "text-red-600" },
        { name: "Blackboard", icon: BookOpen, color: "text-gray-800" },
        { name: "Moodle", icon: GraduationCap, color: "text-orange-500" },
        { name: "Excel Export", icon: FileSpreadsheet, color: "text-green-700" },
        { name: "Slack", icon: Slack, color: "text-purple-600" },
        { name: "Microsoft Teams", icon: MessageSquare, color: "text-blue-600" },
        { name: "Notion", icon: Database, color: "text-gray-900" },
    ];

    return (
        <div className="w-full py-10 bg-background overflow-hidden">
            <div className="container mx-auto px-4 text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Works With Tools You Already Use</h2>
                <p className="text-muted-foreground">Seamlessly sync rosters and export grades to your favorite LMS.</p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="animate-marquee whitespace-nowrap flex gap-12 sm:gap-24 px-12 group-hover:[animation-play-state:paused]">
                    {[...integrations, ...integrations, ...integrations].map((item, idx) => (
                        <div
                            key={`${item.name}-${idx}`}
                            className="group/item flex items-center justify-center gap-3 grayscale transition-all duration-300 hover:grayscale-0 hover:scale-110 cursor-default"
                        >
                            <item.icon className={`w-8 h-8 md:w-10 md:h-10 ${item.color}`} />
                            <span className="text-lg font-bold text-gray-400 group-hover/item:text-foreground transition-colors">
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex gap-12 sm:gap-24 px-12 group-hover:[animation-play-state:paused]">
                    {[...integrations, ...integrations, ...integrations].map((item, idx) => (
                        <div
                            key={`dup-${item.name}-${idx}`}
                            className="group/item flex items-center justify-center gap-3 grayscale transition-all duration-300 hover:grayscale-0 hover:scale-110 cursor-default"
                        >
                            <item.icon className={`w-8 h-8 md:w-10 md:h-10 ${item.color}`} />
                            <span className="text-lg font-bold text-gray-400 group-hover/item:text-foreground transition-colors">
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tailwind specific styles for marquee - assuming these need to be added to index.css or tailwind.config.ts if not present 
          For now using inline styles approach won't work easily for keyframes without styled-components or global css.
          We will assume standard 'animate-marquee' exists or generic sliding. 
          Actually, I will use a simple inline style tag for this component to ensure it works without touching global CSS yet.
      */}
            <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee2 {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 40s linear infinite;
        }
      `}</style>
        </div>
    );
}
