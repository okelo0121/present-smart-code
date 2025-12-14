
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FadeInUpProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
}

export function FadeInUp({
    children,
    className,
    delay = 0,
    duration = 0.6
}: FadeInUpProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: 0.1,
                rootMargin: "0px 0px -50px 0px"
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    return (
        <div
            ref={ref}
            className={cn(
                "transition-all ease-out transform",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[20px]",
                className
            )}
            style={{
                transitionDuration: `${duration}s`,
                transitionDelay: `${delay}s`
            }}
        >
            {children}
        </div>
    );
}
