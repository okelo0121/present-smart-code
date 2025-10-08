import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const InviteStudentForm = () => {
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [className, setClassName] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-student-invite', {
        body: {
          studentName,
          studentEmail,
          className,
          department,
        }
      });

      if (error) {
        // Check if there's an error message in the data
        const errorMessage = data?.error || error.message;
        throw new Error(errorMessage);
      }

      toast({
        title: "Invitation Sent!",
        description: `An invitation email has been sent to ${studentEmail}`,
      });

      // Reset form
      setStudentName("");
      setStudentEmail("");
      setClassName("");
      setDepartment("");
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      
      // Check if it's a Resend test mode error
      const errorMessage = error.message || "Failed to send invitation";
      const isResendTestMode = errorMessage.includes("testing emails") || errorMessage.includes("verify a domain");
      
      toast({
        title: isResendTestMode ? "Resend Test Mode Active" : "Error",
        description: isResendTestMode 
          ? "Resend is in test mode. You can only invite your own email address. To invite other students, verify a domain at resend.com/domains" 
          : errorMessage,
        variant: "destructive",
        duration: isResendTestMode ? 10000 : 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="w-5 h-5 text-education-primary" />
          <span>Invite Student</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          ⚠️ Resend is in test mode - only your verified email can receive invitations. 
          <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
            Verify a domain
          </a> to invite other students.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentName">Student Name</Label>
            <Input
              id="studentName"
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter student's full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentEmail">Email Address</Label>
            <Input
              id="studentEmail"
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="student@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="className">Class</Label>
            <Input
              id="className"
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g., CS101, Math 202"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g., Computer Science"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-primary hover:bg-education-primary-dark transition-smooth"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Invitation...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
