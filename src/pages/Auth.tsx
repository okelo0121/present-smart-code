import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isStudentSignup, setIsStudentSignup] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if this is a student invitation
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const typeParam = params.get('type');
    
    if (emailParam && typeParam === 'student') {
      setEmail(emailParam);
      setIsLogin(false);
      setIsStudentSignup(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          const errorMessage = error.message.includes("Invalid login credentials") 
            ? "Invalid email or password. If you just signed up, please make sure you're using the correct credentials."
            : error.message;
          
          toast({
            title: "Sign In Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else {
        if (!name.trim()) {
          toast({
            title: "Validation Error",
            description: "Please enter your full name",
            variant: "destructive",
          });
          return;
        }
        
        const userType = isStudentSignup ? 'student' : 'teacher';
        const { error } = await signUp(email, password, { name, userType });
        if (error) {
          toast({
            title: "Sign Up Error", 
            description: error.message,
            variant: "destructive",
          });
        } else {
          // Account created successfully - switch to login mode
          toast({
            title: "Account Created Successfully!",
            description: "You can now sign in with your credentials.",
          });
          setIsLogin(true);
          setPassword(""); // Clear password for security
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-card">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center shadow-large mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">
            {isLogin ? "Welcome Back" : (isStudentSignup ? "Create Student Account" : "Create Teacher Account")}
          </CardTitle>
          <p className="text-muted-foreground">
            {isLogin 
              ? "Sign in to your EduTrack account" 
              : (isStudentSignup 
                  ? "Complete your student registration to track attendance" 
                  : "Sign up as a teacher to manage your classes")}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                disabled={isStudentSignup}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:bg-education-primary-dark transition-smooth"
              disabled={loading}
            >
              {loading ? "Loading..." : (isLogin ? "Sign In" : "Create Account")}
            </Button>
          </form>
          
          {!isStudentSignup && (
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;