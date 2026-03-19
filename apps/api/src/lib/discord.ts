import type { Env } from "../config/env";
import { NotFoundError } from "./errors";

export const sendDiscordReportNotification = async (env: Env, input: any) => {
  const webhookUrl = env.DISCORD_REPORT_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new NotFoundError("Discord webhook URL not found");
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`Discord API responded with status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error("Error sending discord notification:", error);
    throw error;
  }
};
