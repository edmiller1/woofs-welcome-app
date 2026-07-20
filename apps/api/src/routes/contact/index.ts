import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getResend } from "../../lib/resend";
import { sendDiscordContactNotification } from "../../lib/discord";
import { authRateLimiter } from "../../middleware/rate-limit";

export const contactRouter = new Hono();

contactRouter.use("/", authRateLimiter);

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.enum([
    "generalInquiry",
    "feedback",
    "partnership",
    "press/media",
    "bugReport",
    "featureRequest",
    "other",
  ]),
  message: z.string().min(10).max(2000),
});

const subjectLabels: Record<string, string> = {
  generalInquiry: "General Inquiry",
  feedback: "Feedback",
  partnership: "Partnership",
  "press/media": "Press/Media",
  bugReport: "Bug Report",
  featureRequest: "Feature Request",
  other: "Other",
};

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

contactRouter.post("/", zValidator("json", contactSchema), async (c) => {
  const env = c.get("env");
  const { name, email, subject, message } = c.req.valid("json");

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  const resend = getResend(env);

  const subjectLabel = subjectLabels[subject] ?? subject;

  await resend.emails.send({
    from: "Woofs Welcome <hello@woofswelcome.app>",
    to: "woofswelcome1@gmail.com",
    replyTo: email,
    subject: `[Contact] ${subjectLabel} — ${safeName}`,
    html: `
      <p><strong>From:</strong> ${safeName} (${safeEmail})</p>
      <p><strong>Subject:</strong> ${subjectLabel}</p>
      <hr />
      <p>${safeMessage}</p>
    `,
  });

  resend.emails
    .send({
      from: "Woofs Welcome <no-reply@woofswelcome.app>",
      to: email,
      subject: `We've received your message — ${subjectLabel}`,
      html: `
      <p>Hi ${safeName},</p>
      <p>Thanks for reaching out! We've received your message and will get back to you as soon as possible.</p>
      <p><strong>Your message:</strong></p>
      <blockquote style="border-left:3px solid #ccc;margin:0;padding:0 1em;color:#666;">
        <p>${safeMessage}</p>
      </blockquote>
      <br />
      <p>— The Woofs Welcome Team</p>
    `,
    })
    .catch(() => {});

  await sendDiscordContactNotification(env, { name, email, subject, message }).catch(
    (err) => console.error("Discord contact notification failed:", err),
  );

  return c.json({ success: true }, 200);
});
