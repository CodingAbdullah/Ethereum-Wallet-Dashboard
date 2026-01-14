import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    
    // Date formatting for the purpose of sending email via Resend
    const submittedAt = new Date().toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    });

    // Sending emails using the Resend email library
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [process.env.PERSONAL_EMAIL as string],
      subject: "New Feedback - Ethereum Wallet Dashboard",
      html: `
        <h1>New Feedback Received</h1>
        <p>Submitted on: ${submittedAt}</p>
        <hr />
        <p>${feedback.trim()}</p>
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