import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Users, 
  Shield, 
  Zap,
  ArrowRight,
  BarChart3,
  Mail
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Clock,
      title: "Time-Sensitive Codes",
      description: "Generate secure, expiring attendance codes that students can use only during class time."
    },
    {
      icon: CheckCircle2,
      title: "Real-Time Tracking",
      description: "Instantly verify attendance and maintain accurate records for all your classes."
    },
    {
      icon: Users,
      title: "Easy Student Management",
      description: "Invite students via email and manage your class rosters effortlessly."
    },
    {
      icon: BarChart3,
      title: "Attendance Analytics",
      description: "View comprehensive statistics and insights about student attendance patterns."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security ensures your data is protected and accessible only to authorized users."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Mark attendance in seconds with our streamlined, intuitive interface."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Sign Up",
      description: "Create your teacher account in seconds and start managing attendance immediately."
    },
    {
      number: "02",
      title: "Invite Students",
      description: "Send email invitations to your students with class details and registration links."
    },
    {
      number: "03",
      title: "Generate Codes",
      description: "Create time-limited attendance codes for each class session."
    },
    {
      number: "04",
      title: "Track Attendance",
      description: "Students enter codes to mark attendance. View reports and analytics instantly."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-medium">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-education-primary to-education-secondary bg-clip-text text-transparent">
              EduTrack
            </span>
          </div>
          <Button 
            onClick={() => navigate('/auth')}
            variant="outline"
            className="hover-scale"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Modern Attendance Tracking
            <span className="block bg-gradient-to-r from-education-primary to-education-secondary bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform how you manage classroom attendance with secure, time-sensitive codes 
            and real-time analytics. Perfect for teachers and educational institutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-gradient-primary hover:bg-education-primary-dark transition-smooth text-lg px-8 py-6 shadow-large hover-scale"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-lg px-8 py-6 hover-scale"
            >
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
            <div className="p-4">
              <div className="text-3xl font-bold text-education-primary">99.9%</div>
              <div className="text-sm text-muted-foreground mt-1">Uptime</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-education-primary">&lt;2s</div>
              <div className="text-sm text-muted-foreground mt-1">Avg. Check-in</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-education-primary">100%</div>
              <div className="text-sm text-muted-foreground mt-1">Secure</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 bg-gradient-to-b from-transparent to-secondary/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make attendance tracking effortless and accurate
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-gradient-card border-border/50 hover:shadow-large transition-smooth hover-scale group"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our simple four-step process
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="bg-gradient-card border-border/50 h-full hover:shadow-large transition-smooth hover-scale">
                  <CardContent className="p-6">
                    <div className="text-5xl font-bold text-education-primary/20 mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-education-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-hero border-0 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-white/10"></div>
            <CardContent className="p-12 md:p-16 text-center relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to Simplify Attendance?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join hundreds of educators who trust EduTrack for accurate, 
                hassle-free attendance management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => navigate('/auth')}
                  variant="secondary"
                  className="text-lg px-8 py-6 hover-scale shadow-large"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Get Started Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold">EduTrack</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 EduTrack. Simplifying attendance tracking for modern classrooms.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
