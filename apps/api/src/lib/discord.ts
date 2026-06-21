import type { Env } from "../config/env";
import { NotFoundError } from "./errors";

const sendWebhook = async (webhookUrl: string, payload: object) => {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Discord API responded with status: ${response.status}`);
  }
  return response;
};

export const sendDiscordSuggestedEditNotification = async (
  env: Env,
  input: {
    placeName: string;
    placeSlug: string;
    locationPath: string;
    userName: string;
    field: string;
    suggestedValue: unknown;
    notes?: string;
  },
) => {
  const webhookUrl = env.DISCORD_SUGGESTED_EDIT_WEBHOOK_URL;
  if (!webhookUrl) throw new NotFoundError("Discord webhook URL not found");

  const placeUrl = `https://woofswelcome.app/location/${input.locationPath}/places/${input.placeSlug}`;
  const valueDisplay =
    typeof input.suggestedValue === "object"
      ? JSON.stringify(input.suggestedValue, null, 2)
      : String(input.suggestedValue);

  const payload = {
    embeds: [
      {
        title: "✏️ Suggested Edit",
        color: 0x2d6a4f,
        fields: [
          { name: "Place", value: `[${input.placeName}](${placeUrl})`, inline: true },
          { name: "Submitted by", value: input.userName, inline: true },
          { name: "Field", value: `\`${input.field}\``, inline: true },
          { name: "Suggested value", value: `\`\`\`${valueDisplay}\`\`\`` },
          ...(input.notes ? [{ name: "Notes", value: input.notes }] : []),
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    return await sendWebhook(webhookUrl, payload);
  } catch (error) {
    console.error("Error sending Discord suggested edit notification:", error);
  }
};

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
