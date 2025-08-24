import { google } from "googleapis";
import { store } from "@/lib/store";

export function createOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:3000/api/auth/gmail/callback";
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
  return oauth2Client;
}

export function getAuthUrl() {
  const oauth2Client = createOAuthClient();
  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/gmail.send",
  ];
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });
}

export async function handleOAuthCallback(code: string) {
  const oauth2Client = createOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const me = await oauth2.userinfo.get();
  const email = me.data.email as string;
  await store.writeGmailAuth({
    email,
    tokens: tokens as unknown as Record<string, unknown>,
  });
  return { email };
}

export async function sendWithGmail(to: string, subject: string, text: string) {
  const auth = await store.readGmailAuth();
  if (!auth) return false;
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials(auth.tokens);
  // Persist refreshed tokens
  oauth2Client.on("tokens", async (tokens) => {
    const merged = { ...auth.tokens, ...tokens } as unknown as Record<
      string,
      unknown
    >;
    await store.writeGmailAuth({ email: auth.email, tokens: merged });
  });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const message = [
    `From: ${auth.email}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "",
    text,
  ].join("\n");
  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedMessage },
  });
  return true;
}

export async function checkGmailHealth() {
  const auth = await store.readGmailAuth();
  if (!auth) return { connected: false, email: null } as const;
  try {
    const oauth2Client = createOAuthClient();
    oauth2Client.setCredentials(auth.tokens);
    oauth2Client.on("tokens", async (tokens) => {
      const merged = { ...auth.tokens, ...tokens } as unknown as Record<
        string,
        unknown
      >;
      await store.writeGmailAuth({ email: auth.email, tokens: merged });
    });
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const me = await oauth2.userinfo.get();
    const email = (me.data.email as string) || auth.email;
    if (email !== auth.email)
      await store.writeGmailAuth({ email, tokens: auth.tokens });
    return { connected: true, email } as const;
  } catch {
    await store.clearGmailAuth();
    return { connected: false, email: null } as const;
  }
}
