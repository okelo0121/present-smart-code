import { useState } from "react";
import { BookOpen, Facebook, Linkedin, Twitter, Github, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeInUp } from "@/components/FadeInUp";
import { footerContent } from "@/data/footerContent";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function Footer() {
    const currentYear = new Date().getFullYear();
    const [selectedContent, setSelectedContent] = useState<keyof typeof footerContent | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLinkClick = (e: React.MouseEvent, key: string) => {
        e.preventDefault();
        // Convert display text to key (e.g., "Privacy Policy" -> "privacy")
        let contentKey = key.toLowerCase().replace(/ /g, '');

        // Manual mapping for specific keys
        if (contentKey === "privacypolicy") contentKey = "privacy";
        if (contentKey === "termsofservice") contentKey = "terms";
        if (contentKey === "gdprcompliance") contentKey = "gdpr";
        if (contentKey === "cookiepolicy") contentKey = "cookies";
        if (contentKey === "aboutus") contentKey = "about";
        if (contentKey === "casestudies") contentKey = "casestudies";

        if (contentKey in footerContent) {
            setSelectedContent(contentKey as keyof typeof footerContent);
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <footer className="bg-slate-950 text-slate-200 border-t border-slate-800">
                <div className="container mx-auto px-4 py-16">
                    <FadeInUp>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                            {/* Column 1: Brand */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                                        <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-2xl font-bold text-white tracking-tight">
                                        EduTrack
                                    </span>
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                                    Modernizing classroom attendance with secure, time-sensitive tracking and real-time analytics for forward-thinking institutions.
                                </p>
                                <div className="flex gap-4">
                                    {[Twitter, Linkedin, Facebook, Github].map((Icon, i) => (
                                        <Button
                                            key={i}
                                            variant="ghost"
                                            size="icon"
                                            className="w-9 h-9 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-300"
                                        >
                                            <Icon className="w-4 h-4" />
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Column 2: Product */}
                            <div>
                                <h4 className="text-white font-semibold mb-6 tracking-wide">Product</h4>
                                <ul className="space-y-4 text-sm">
                                    {['Features', 'Pricing', 'Case Studies', 'Updates', 'Security'].map((item) => (
                                        <li key={item}>
                                            <a
                                                href="#"
                                                onClick={(e) => handleLinkClick(e, item)}
                                                className="text-slate-400 hover:text-white transition-colors duration-200 block w-fit"
                                            >
                                                {item}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Column 3: Company */}
                            <div>
                                <h4 className="text-white font-semibold mb-6 tracking-wide">Company</h4>
                                <ul className="space-y-4 text-sm">
                                    {['About Us', 'Careers', 'Contact', 'Press', 'Partners'].map((item) => (
                                        <li key={item}>
                                            <a
                                                href="#"
                                                onClick={(e) => handleLinkClick(e, item)}
                                                className="text-slate-400 hover:text-white transition-colors duration-200 block w-fit"
                                            >
                                                {item}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Column 4: Legal */}
                            <div>
                                <h4 className="text-white font-semibold mb-6 tracking-wide">Legal</h4>
                                <ul className="space-y-4 text-sm">
                                    {['Privacy Policy', 'Terms of Service', 'GDPR Compliance', 'Cookie Policy'].map((item) => (
                                        <li key={item}>
                                            <a
                                                href="#"
                                                onClick={(e) => handleLinkClick(e, item)}
                                                className="text-slate-400 hover:text-white transition-colors duration-200 block w-fit"
                                            >
                                                {item}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Bar */}
                        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                            <p>© {currentYear} EduTrack Inc. All rights reserved.</p>
                            <div className="flex gap-8">
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    All Systems Operational
                                </span>
                            </div>
                        </div>
                    </FadeInUp>
                </div>
            </footer>

            {/* Content Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0 bg-background/95 backdrop-blur-xl border-white/10">
                    <ScrollArea className="flex-1 p-6 md:p-8">
                        {selectedContent && (
                            <div
                                className="prose prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: footerContent[selectedContent] }}
                            />
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
}
