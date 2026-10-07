import { NextResponse } from "next/server";
import { Resend } from "resend";

const MAX_FEEDBACK_LENGTH = 5000;

// Escape user input before placing it in the email's HTML
function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// POST request function for sending feedback emails
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { feedback } = body;

    if (!feedback || typeof feedback !== "string" || feedback.trim().length === 0) {
      return NextResponse.json(
        { error: "Feedback message is required" },
        { status: 400 }
      );
    }

    if (feedback.length > MAX_FEEDBACK_LENGTH) {
      return NextResponse.json(
        { error: `Feedback must be ${MAX_FEEDBACK_LENGTH} characters or fewer` },
        { status: 400 }
      );
    }
    
    // Date formatting for the purpose of sending email via Resend
    const submittedAt = new Date().toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    });

    if (!process.env.RESEND_API_KEY || !process.env.PERSONAL_EMAIL) {
      return NextResponse.json({ error: "Feedback email is not configured" }, { status: 500 });
    }

    // Sending emails using the Resend email library (created per request so builds don't need the key)
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [process.env.PERSONAL_EMAIL],
      subject: "New Feedback - Ethereum Wallet Dashboard",
      html: `
        <h1>New Feedback Received</h1>
        <p>Submitted on: ${submittedAt}</p>
        <hr />
        <p>${escapeHtml(feedback.trim()).replace(/\n/g, "<br />")}</p>
      `
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to send feedback email", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } 
  catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}