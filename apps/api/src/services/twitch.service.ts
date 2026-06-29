import { env } from "../config/env.js";

let appAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getAppAccessToken(): Promise<string> {
  const now = Date.now();
  if (appAccessToken && now < tokenExpiresAt - 60000) {
    return appAccessToken;
  }

  const params = new URLSearchParams({
    client_id: env.twitchClientId,
    client_secret: env.twitchClientSecret,
    grant_type: "client_credentials",
  });

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error("Failed to get Twitch app access token");
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  appAccessToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000;

  return appAccessToken;
}

export async function isChannelLive(channelLogin: string): Promise<boolean> {
  try {
    const token = await getAppAccessToken();
    const res = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${channelLogin}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": env.twitchClientId,
        },
      },
    );

    if (!res.ok) return false;

    const data = (await res.json()) as { data: Array<{ type: string }> };
    return data.data.length > 0 && data.data[0].type === "live";
  } catch {
    return false;
  }
}
