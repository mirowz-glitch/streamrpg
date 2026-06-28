import { env } from "../config/env.js";

export function getTwitchAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.twitchClientId,
    redirect_uri: env.twitchRedirectUri,
    response_type: "code",
    scope: "user:read:email",
    state,
  });
  return `https://id.twitch.tv/oauth2/authorize?${params.toString()}`;
}

export async function exchangeTwitchCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
}> {
  const params = new URLSearchParams({
    client_id: env.twitchClientId,
    client_secret: env.twitchClientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: env.twitchRedirectUri,
  });

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error("Failed to exchange Twitch code");
  }

  return res.json() as Promise<{ access_token: string; refresh_token: string }>;
}

export async function fetchTwitchUser(accessToken: string): Promise<{
  id: string;
  login: string;
  display_name: string;
  email?: string;
  profile_image_url: string;
}> {
  const res = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-Id": env.twitchClientId,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Twitch user");
  }

  const data = (await res.json()) as {
    data: Array<{
      id: string;
      login: string;
      display_name: string;
      email?: string;
      profile_image_url: string;
    }>;
  };

  const user = data.data[0];
  if (!user) {
    throw new Error("Twitch user not found");
  }

  return user;
}
