import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkRateLimit } from "../_shared/rate-limiter.ts";

const SubmitAttendanceSchema = z.object({
  code: z.string().trim().length(6, "Code must be 6 characters"),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Rate limit: 5 attempts per minute per user
const RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
};

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

    // Check rate limit
    const rateLimitResult = checkRateLimit(user.id, RATE_LIMIT);
    if (!rateLimitResult.allowed) {
      const resetIn = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
      console.log(`Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ 
          error: "Too many attempts. Please try again later.",
          retryAfter: resetIn
        }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
            "Retry-After": resetIn.toString(),
            ...corsHeaders 
          },
        }
      );
    }

    // Verify user is a student
    const { data: student, error: studentError } = await supabase
      .from("app_b3583718a0_students")
      .select("id, name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (studentError || !student) {
      return new Response(
        JSON.stringify({ error: "Only students can submit attendance" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const requestBody = await req.json();

    // Validate input
    let validated;
    try {
      validated = SubmitAttendanceSchema.parse(requestBody);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return new Response(
          JSON.stringify({ 
            error: "Invalid code format", 
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

    const { code } = validated;

    // Find active attendance code (not expired)
    const now = new Date().toISOString();
    const { data: attendanceCode, error: codeError } = await supabase
      .from("app_b3583718a0_attendance_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .gt("expires_at", now)
      .maybeSingle();

    if (codeError || !attendanceCode) {
      console.log(`Invalid or expired code attempted by student ${student.id}: ${code}`);
      return new Response(
        JSON.stringify({ error: "Invalid or expired code" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verify student is in the same class as the attendance code
    const { data: studentData } = await supabase
      .from("app_b3583718a0_students")
      .select("class")
      .eq("id", student.id)
      .single();

    if (studentData?.class !== attendanceCode.class) {
      return new Response(
        JSON.stringify({ error: "This code is not for your class" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if already marked with this code
    const { data: existingRecord } = await supabase
      .from("app_b3583718a0_attendance_records")
      .select("id")
      .eq("student_id", student.id)
      .eq("code_id", attendanceCode.id)
      .maybeSingle();

    if (existingRecord) {
      return new Response(
        JSON.stringify({ error: "You already marked attendance with this code" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Mark attendance
    const { data: attendanceRecord, error: recordError } = await supabase
      .from("app_b3583718a0_attendance_records")
      .insert({
        student_id: student.id,
        code_id: attendanceCode.id,
      })
      .select()
      .single();

    if (recordError) {
      console.error("Error creating attendance record:", recordError);
      return new Response(
        JSON.stringify({ error: "Failed to mark attendance" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Attendance marked successfully for student ${student.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Attendance marked successfully",
        record: attendanceRecord
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-attendance function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
