import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const InviteSchema = z.object({
  studentName: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  studentEmail: z.string().email("Invalid email").max(255, "Email too long"),
  className: z.string().trim().min(1, "Class is required").max(100, "Class name too long"),
  department: z.string().trim().min(1, "Department is required").max(100, "Department name too long"),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface InviteRequest {
  studentName: string;
  studentEmail: string;
  className: string;
  department: string;
  teacherName: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { data: teacher, error: teacherError } = await supabase
      .from("app_b3583718a0_teachers")
      .select("id, name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (teacherError || !teacher) {
      return new Response(
        JSON.stringify({ error: "Only teachers can send invitations" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const requestBody = await req.json();

    // Validate input data
    let validated;
    try {
      validated = InviteSchema.parse(requestBody);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return new Response(
          JSON.stringify({ 
            error: "Invalid input data", 
            details: validationError.errors.map(e => e.message).join(", ")
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      throw validationError;
    }

    const { studentName, studentEmail, className, department } = validated;

    const { data: existingStudent } = await supabase
      .from("app_b3583718a0_students")
      .select("*")
      .eq("email", studentEmail)
      .maybeSingle();

    let student;

    if (existingStudent) {
      const { data: updatedStudent, error: updateError } = await supabase
        .from("app_b3583718a0_students")
        .update({
          name: studentName,
          class: className,
          department: department,
          teacher_id: teacher.id,
        })
        .eq("email", studentEmail)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error("Error updating student:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update student record" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      student = updatedStudent;
    } else {
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
        .maybeSingle();

      if (studentError) {
        console.error("Error creating student:", studentError);
        return new Response(
          JSON.stringify({ error: "Failed to create student record" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      student = newStudent;
    }

    // Generate secure invite token
    const inviteToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store the invite token
    const { error: tokenError } = await supabase
      .from('app_b3583718a0_student_invites')
      .insert({
        email: studentEmail,
        token: inviteToken,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error("Error storing invite token:", tokenError);
      return new Response(
        JSON.stringify({ error: "Failed to create invitation" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, '') || "https://8399a5db-9206-4a4d-8ef0-dd86b7b0ee48.lovableproject.com";
    const inviteLink = `${origin}/auth?email=${encodeURIComponent(studentEmail)}&type=student&token=${inviteToken}`;

    try {
      const emailHtml = `
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

                  <p>Click the button below to create your account and start tracking your attendance. <strong>No email verification needed - you'll get instant access!</strong></p>

                  <center>
                    <a href="${inviteLink}" class="button">Create Student Account</a>
                  </center>

                  <p style="margin-top: 20px; font-size: 14px; color: #666;">
                    After creating your account, you'll be able to:
                    <ul>
                      <li>Submit attendance using time-sensitive codes</li>
                      <li>View your attendance history</li>
                      <li>Track your attendance statistics</li>
                    </ul>
                  </p>

                  <div class="footer">
                    <p>This invitation link will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "EduTrack <noreply@edutrack.store>",
            to: [studentEmail],
            subject: `You've been invited to join ${className} on EduTrack`,
            html: emailHtml,
          }),
        });

        const emailData = await emailResponse.json();

        if (!emailResponse.ok) {
          console.error("Failed to send email:", emailData);
          return new Response(
            JSON.stringify({
              error: emailData.message || "Failed to send email",
              details: emailData
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        }

        console.log("Email sent successfully:", emailData);
      } catch (emailError: any) {
        console.error("Error sending email:", emailError);
        return new Response(
          JSON.stringify({
            error: "Failed to send invitation email",
            details: emailError.message
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

    return new Response(
      JSON.stringify({
        success: true,
        message: existingStudent ? "Student re-invited successfully" : "Student invited successfully",
        student: student,
        inviteLink: inviteLink
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
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});