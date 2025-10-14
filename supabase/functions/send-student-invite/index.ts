import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.38.4";

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

    const { studentName, studentEmail, className, department } = requestBody;

    if (!studentName || !studentEmail || !className || !department) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

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

    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, '') || "https://8399a5db-9206-4a4d-8ef0-dd86b7b0ee48.lovableproject.com";
    const inviteLink = `${origin}/auth?email=${encodeURIComponent(studentEmail)}&type=student`;

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