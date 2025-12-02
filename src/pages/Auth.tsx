import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BookOpen, Eye, EyeOff, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// API URL configuration - same as useAuth.tsx
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL.replace(/\/$/, '')}/api`;

const passwordSchema = z.string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "One uppercase letter")
  .regex(/[a-z]/, "One lowercase letter")
  .regex(/[0-9]/, "One number");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isStudentSignup, setIsStudentSignup] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if this is a student invitation
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const typeParam = params.get('type');
    const tokenParam = params.get('token');
    console.log('[Auth] Params:', { email: emailParam, type: typeParam, token: tokenParam });

    if (emailParam && typeParam === 'student' && tokenParam) {
      setEmail(emailParam);
      setInviteToken(tokenParam);
      setIsLogin(false);
      setIsStudentSignup(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Update password validation on change
    if (!isLogin) {
      setPasswordValidation({
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password)
      });
    }
  }, [password, isLogin]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password Reset Email Sent",
          description: "If an account with that email exists, we've sent you a password reset link. Please check your email.",
          duration: 6000,
        });
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send password reset email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send password reset email",
        variant: "destructive",
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          const errorMessage = error.message.includes("Invalid login credentials")
            ? "Invalid email or password. If you just signed up, please confirm your email first (check your inbox and spam folder). You must verify your email before signing in."
            : error.message;

          toast({
            title: "Sign In Error",
            description: errorMessage,
            variant: "destructive",
            duration: 8000,
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

        if (!isStudentSignup && !department) {
          toast({
            title: "Validation Error",
            description: "Please select your department",
            variant: "destructive",
          });
          return;
        }

        // Validate password strength
        const passwordValidation = passwordSchema.safeParse(password);
        if (!passwordValidation.success) {
          const errors = passwordValidation.error.errors.map(e => e.message).join(", ");
          toast({
            title: "Password Requirements Not Met",
            description: errors,
            variant: "destructive",
            duration: 5000,
          });
          return;
        }

        const userType: 'student' | 'teacher' = isStudentSignup ? 'student' : 'teacher';
        const metadata = { name, userType, ...(department && { department }) };
        const { error } = await signUp(email, password, metadata, inviteToken || undefined);
        if (error) {
          // Check if user already exists
          if (error.message.includes("already registered") || error.message.includes("already been registered")) {
            toast({
              title: "Account Already Exists",
              description: "This email is already registered. Please try signing in instead, or use a different email address.",
              duration: 8000,
            });
            // Switch to login mode
            setIsLogin(true);
            setPassword("");
          } else if (error.message.includes("Database error") || error.message.includes("duplicate key")) {
            toast({
              title: "Account Already Exists",
              description: "An account with this email already exists. Please sign in instead.",
              duration: 6000,
            });
            setIsLogin(true);
            setPassword("");
          } else {
            toast({
              title: "Sign Up Error",
              description: error.message || "Failed to create account. Please try again.",
              variant: "destructive",
            });
          }
        } else {
          if (isStudentSignup && inviteToken) {
            // Auto-verified students can sign in immediately
            toast({
              title: "Account Created!",
              description: "Your account is ready! Signing you in...",
              duration: 3000,
            });
            // Auto sign-in for invited students
            await signIn(email, password);
          } else {
            toast({
              title: "Account Created!",
              description: "Please check your email to confirm your account before signing in. Check your spam folder if you don't see it.",
              duration: 8000,
            });
            // Switch to login mode after successful signup
            setIsLogin(true);
            setPassword(""); // Clear password for security
          }
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
      <div className="w-full max-w-md space-y-4">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Homepage
        </Button>

        <Card className="bg-gradient-card">
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
                  ? inviteToken
                    ? "Complete your registration - no email verification needed!"
                    : "Complete your student registration to track attendance"
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

                  {!isStudentSignup && (
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Business Administration">Business Administration</SelectItem>
                          <SelectItem value="Economics">Economics</SelectItem>
                          <SelectItem value="English Literature">English Literature</SelectItem>
                          <SelectItem value="History">History</SelectItem>
                          <SelectItem value="Psychology">Psychology</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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
                {!isLogin && (
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-muted-foreground mb-1">Password must contain:</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {passwordValidation.minLength ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={passwordValidation.minLength ? "text-green-500" : "text-muted-foreground"}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordValidation.hasUppercase ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={passwordValidation.hasUppercase ? "text-green-500" : "text-muted-foreground"}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordValidation.hasLowercase ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={passwordValidation.hasLowercase ? "text-green-500" : "text-muted-foreground"}>
                          One lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordValidation.hasNumber ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={passwordValidation.hasNumber ? "text-green-500" : "text-muted-foreground"}>
                          One number
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:bg-education-primary-dark transition-smooth"
                disabled={loading}
              >
                {loading ? "Loading..." : (isLogin ? "Sign In" : "Create Account")}
              </Button>
            </form>

            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
              </div>
            )}

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

        <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Forgot Password</DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a link to reset your password.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  required
                  placeholder="Enter your email address"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:bg-education-primary-dark transition-smooth"
                disabled={forgotPasswordLoading}
              >
                {forgotPasswordLoading ? "Sending..." : "Send Reset Email"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Auth;