import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  studentName: string;
  studentEmail: string;
  className: string;
  department: string;
  teacherName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify the user is authenticated
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Verify user is a teacher
    const { data: teacher, error: teacherError } = await supabase
      .from("app_b3583718a0_teachers")
      .select("id, name")
      .eq("user_id", user.id)
      .single();

    if (teacherError || !teacher) {
      throw new Error("Only teachers can send invitations");
    }

    const { studentName, studentEmail, className, department }: InviteRequest = await req.json();

    // Create student record (user_id will be null until student signs up)
    const { data: newStudent, error: studentError } = await supabase
      .from("app_b3583718a0_students")
      .insert({
        name: studentName,
        email: studentEmail,
        class: className,
        department: department,
        teacher_id: teacher.id,
        user_id: null,
      })
      .select()
      .single();

    if (studentError) {
      console.error("Error creating student:", studentError);
      throw new Error("Failed to create student record");
    }

    // Generate invitation link - use the frontend URL
    const inviteLink = `${req.headers.get("origin") || "https://nllpxugnekhilifkfjox.supabase.co"}/auth`;

    // Send invitation email
    const emailResponse = await resend.emails.send({
      from: "EduTrack <onboarding@resend.dev>",
      to: [studentEmail],
      subject: `You've been invited to join ${className} on EduTrack`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .details { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to EduTrack!</h1>
              </div>
              <div class="content">
                <p>Hi ${studentName},</p>
                <p>${teacher.name} has invited you to join their class on EduTrack, a modern attendance tracking system.</p>
                
                <div class="details">
                  <strong>Class Details:</strong><br>
                  Class: ${className}<br>
                  Department: ${department}<br>
                  Teacher: ${teacher.name}
                </div>

                <p>Click the button below to access the system and start tracking your attendance:</p>
                
                <center>
                  <a href="${inviteLink}" class="button">Access EduTrack</a>
                </center>

                <p style="margin-top: 20px; font-size: 14px; color: #666;">
                  You'll be able to:
                  <ul>
                    <li>Submit attendance using time-sensitive codes</li>
                    <li>View your attendance history</li>
                    <li>Track your attendance statistics</li>
                  </ul>
                </p>

                <div class="footer">
                  <p>If you didn't expect this invitation, please ignore this email.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Invitation sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Student invited successfully",
        student: newStudent 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-student-invite function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
