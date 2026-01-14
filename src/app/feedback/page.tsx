"use client";

import { useState } from "react";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";

// Feedback page for sending email feedback to owner of Ethereum Dashboard
export default function FeedbackPage() {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Function for handling form submissions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!feedback.trim()) {
      setErrorMessage("Please enter your feedback");
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/send-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send feedback");
      }

      setSubmitStatus("success");
      setFeedback("");
    } 
    catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    } 
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-800 text-gray-300 py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
      <section className="text-center py-10 px-4">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400">
            FEEDBACK
          </h1>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            Have suggestions, found a bug, or want to share your thoughts?
            Your feedback helps improve the Ethereum Wallet Dashboard.
          </p>
        </div>
      </section>

      <section className="pb-10 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-gray-900 text-gray-300 border border-gray-800 rounded-xl shadow-lg overflow-hidden p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="feedback"
                  className="block text-sm font-medium text-gray-400 mb-2"
                >
                  Your Feedback
                </label>
                <Textarea
                  id="feedback"
                  placeholder="Share your thoughts, suggestions, or report issues..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[200px] bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500 focus:border-gray-500 focus:ring-gray-500"
                  disabled={isSubmitting}
                />
              </div>

              {submitStatus === "error" && (
                <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg">
                  {errorMessage}
                </div>
              )}

              {submitStatus === "success" && (
                <div className="bg-green-900/20 border border-green-800 text-green-400 px-4 py-3 rounded-lg">
                  Thank you for your feedback! Your message has been sent successfully.
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-400 text-white py-3 px-6 rounded-full hover:from-gray-500 hover:to-gray-300 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? "Sending..." : "Submit Feedback"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
