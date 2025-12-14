
import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Star, Quote, Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FadeInUp } from "@/components/FadeInUp";

export function Testimonials() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selectedIndex, setSelectedIndex] = useState(0);

    const testimonials = [
        {
            name: "Dr. Sarah Miller",
            title: "Professor of Biology",
            org: "Stanford University",
            quote: "Finally, attendance that doesn't eat up my lecture time. The geo-fencing feature is a game changer for large lecture halls.",
            tags: ["Higher Ed", "Large Lectures"],
            avatar: "SM",
        },
        {
            name: "James Chen",
            title: "Science Teacher",
            org: "Bronx High School of Science",
            quote: "I used to spend 15 minutes every class just calling names. Now it takes 30 seconds. My students actually think it's cool.",
            tags: ["K-12", "Science"],
            avatar: "JC",
        },
        {
            name: "Emily Rodriguez",
            title: "Adjunct Professor",
            org: "UT Austin",
            quote: "The analytics help me identify students who are slipping away before it's too late. It's not just attendance; it's retention.",
            tags: ["Analytics", "Student Success"],
            avatar: "ER",
        },
        {
            name: "Michael Chang",
            title: "Department Head",
            org: "MIT",
            quote: "Secure, reliable, and integrates perfectly with our LMS. We've rolled this out to the entire department.",
            tags: ["Administration", "LMS Integration"],
            avatar: "MC",
        },
        {
            name: "Lisa Thompson",
            title: "Corporate Trainer",
            org: "Google",
            quote: "We use this for mandatory training sessions. The expiring codes ensure people are actually in the room paying attention.",
            tags: ["Corporate", "Training"],
            avatar: "LT",
        },
        {
            name: "David Wilson",
            title: "Lecturer",
            org: "Oxford University",
            quote: "Simple enough for technophobes, powerful enough for data nerds. The perfect balance.",
            tags: ["Higher Ed", "Ease of Use"],
            avatar: "DW",
        }
    ];

    const scrollTo = useCallback(
        (index: number) => emblaApi && emblaApi.scrollTo(index),
        [emblaApi]
    );

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);

        // Auto-play
        const intervalId = setInterval(() => {
            if (emblaApi.canScrollNext()) {
                emblaApi.scrollNext();
            } else {
                emblaApi.scrollTo(0);
            }
        }, 5000);

        return () => {
            emblaApi.off("select", onSelect);
            clearInterval(intervalId);
        };
    }, [emblaApi, onSelect]);

    return (
        <div className="w-full bg-gradient-to-b from-background to-secondary/20 py-20 overflow-hidden relative">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-education-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-education-secondary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <Badge variant="outline" className="mb-4 border-primary/20 text-primary uppercase tracking-wider bg-primary/5">
                        Our Customers
                    </Badge>
                    <h2 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
                        Success Stories
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Real educators share how they reclaimed their classroom time.
                    </p>
                </div>

                {/* Avatar Navigation */}
                <div className="flex justify-center gap-4 mb-16 flex-wrap">
                    {testimonials.map((t, index) => (
                        <button
                            key={index}
                            onClick={() => scrollTo(index)}
                            className={cn(
                                "relative transition-all duration-300 rounded-full p-1 border-2",
                                selectedIndex === index
                                    ? "scale-125 border-primary z-10 shadow-lg"
                                    : "border-transparent grayscale opacity-50 hover:opacity-100 hover:grayscale-0 hover:scale-110"
                            )}
                        >
                            <Avatar className="h-12 w-12 md:h-14 md:w-14 bg-background">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`} />
                                <AvatarFallback className="bg-primary/10 text-primary">{t.avatar}</AvatarFallback>
                            </Avatar>
                        </button>
                    ))}
                </div>

                {/* Carousel */}
                <div className="overflow-hidden max-w-4xl mx-auto px-4" ref={emblaRef}>
                    <div className="flex">

                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="flex-[0_0_100%] min-w-0 pl-4 py-4">
                                <FadeInUp>
                                    <Card className="bg-card border-border/50 shadow-xl relative overflow-hidden group">
                                        {/* ... card content ... */}
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Quote className="w-24 h-24 text-primary" />
                                        </div>

                                        <CardContent className="p-8 md:p-12">
                                            <div className="grid md:grid-cols-[2fr,1fr] gap-8 md:gap-12 items-center">
                                                <div className="space-y-6">
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                                        ))}
                                                        <span className="ml-2 text-muted-foreground font-mono">5.0</span>
                                                    </div>

                                                    <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed text-foreground">
                                                        "{testimonial.quote}"
                                                    </blockquote>

                                                    <div className="flex flex-wrap gap-2 pt-4">
                                                        {testimonial.tags.map(tag => (
                                                            <Badge key={tag} variant="secondary" className="hover:bg-secondary/80">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="relative border-l border-border pl-8 md:pl-12 hidden md:block">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                            <Building2 className="w-4 h-4" />
                                                            Institution Type
                                                        </div>
                                                        <div className="text-xl font-bold text-foreground">
                                                            {testimonial.tags[0]}
                                                        </div>

                                                        <div className="h-px bg-border my-4" />

                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-12 w-12 border border-border">
                                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.name}`} />
                                                                <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-bold text-foreground">{testimonial.name}</div>
                                                                <div className="text-sm text-muted-foreground">{testimonial.title}</div>
                                                                <div className="text-sm text-primary mt-1 font-medium">{testimonial.org}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Mobile View for Profile */}
                                                <div className="md:hidden flex items-center gap-4 border-t border-border pt-6 mt-2">
                                                    <Avatar className="h-12 w-12 border border-border">
                                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.name}`} />
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-bold text-foreground">{testimonial.name}</div>
                                                        <div className="text-sm text-muted-foreground">{testimonial.title}</div>
                                                        <div className="text-sm text-primary font-medium">{testimonial.org}</div>
                                                    </div>
                                                </div>

                                            </div>
                                        </CardContent>
                                    </Card>
                                </FadeInUp>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
