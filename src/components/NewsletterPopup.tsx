import { useState, useEffect } from "react";
import { X, Mail, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface NewsletterPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewsletterPopup({ isOpen, onClose }: NewsletterPopupProps) {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setMounted(false), 300); // Wait for exit animation
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted && !isOpen) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL.replace(/\/$/, '')}/api`;

      const response = await fetch(`${API_URL}/subscription/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
          setIsSuccess(false);
          setEmail("");
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to subscribe.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300",
      isOpen ? "opacity-100 visible" : "opacity-0 invisible"
    )}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className={cn(
        "relative w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden border border-border/50 transform transition-all duration-500",
        isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-95 opacity-0"
      )}>
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/80 text-muted-foreground transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative p-8 flex flex-col items-center text-center">
          {/* Icon Circle */}
          <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-border/50">
            {isSuccess ? (
              <Check className="w-8 h-8 text-green-500 animate-in zoom-in duration-300" />
            ) : (
              <Mail className="w-8 h-8 text-primary animate-pulse-slow" />
            )}
          </div>

          <h2 className="text-2xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {isSuccess ? "Welcome Aboard!" : "Weekly Inspiration"}
          </h2>
          
          <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm">
            {isSuccess 
              ? "You've been successfully subscribed. Watch your inbox for creative updates!"
              : "Join our digest for exclusive tips, trends, and resources delivered to your inbox."
            }
          </p>

          {!isSuccess && (
            <form onSubmit={handleSubscribe} className="w-full space-y-4">
              <div className="relative group">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-4 h-12 bg-muted/30 border-border/50 focus:border-primary/50 transition-all shadow-sm"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] group"
                disabled={isSubscribing}
              >
                {isSubscribing ? (
                  "Subscribing..."
                ) : (
                  <>
                    Subscribe Now 
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 flex flex-col items-center gap-2">
            {!isSuccess && (
              <button 
                onClick={onClose}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline decoration-muted-foreground/30 underline-offset-4"
              >
                No thanks, I prefer not to be inspired
              </button>
            )}
            <p className="text-[10px] text-muted-foreground/60 mt-2 font-mono">
              Secure Connection · 100% Spam Free
            </p>
          </div>
        </div>
        
        {/* Bottom Gradient Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
      </div>
    </div>
  );
}
