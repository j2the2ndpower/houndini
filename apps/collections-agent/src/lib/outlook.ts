import { store } from "@/lib/store";

export function getOutlookAuthUrl() {
  const clientId = process.env.MS_CLIENT_ID || "";
  const tenant = process.env.MS_TENANT_ID || "common";
  const redirect = encodeURIComponent(
    process.env.MS_REDIRECT_URI ||
      "http://localhost:3000/api/auth/outlook/callback"
  );
  const scope = encodeURIComponent("offline_access Mail.Send User.Read");
  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirect}&response_mode=query&scope=${scope}`;
}

export async function handleOutlookCallback(code: string) {
  const clientId = process.env.MS_CLIENT_ID || "";
  const clientSecret = process.env.MS_CLIENT_SECRET || "";
  const tenant = process.env.MS_TENANT_ID || "common";
  const redirectUri =
    process.env.MS_REDIRECT_URI ||
    "http://localhost:3000/api/auth/outlook/callback";
  const tokenUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });
  const resp = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!resp.ok) throw new Error("Token exchange failed");
  const tokens = await resp.json();

  // fetch user email
  const meResp = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const me = await meResp.json();
  const email = me.mail || me.userPrincipalName;
  await store.writeOutlookAuth({ email, tokens });
  return { email };
}

export async function sendWithOutlook(
  to: string,
  subject: string,
  text: string
) {
  const auth = await store.readOutlookAuth();
  if (!auth) return false;
  let tokens = auth.tokens;
  let accessToken = tokens.access_token as string;
  const msg = {
    message: {
      subject,
      body: { contentType: "Text", content: text },
      toRecipients: [{ emailAddress: { address: to } }],
    },
    saveToSentItems: true,
  };
  let resp = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(msg),
  });
  if (resp.status === 401) {
    // try refresh token
    const clientId = process.env.MS_CLIENT_ID || "";
    const clientSecret = process.env.MS_CLIENT_SECRET || "";
    const tenant = process.env.MS_TENANT_ID || "common";
    const tokenUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: tokens.refresh_token as string,
    });
    const tResp = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (tResp.ok) {
      const newTokens = await tResp.json();
      tokens = { ...tokens, ...newTokens };
      await store.writeOutlookAuth({ email: auth.email, tokens });
      accessToken = tokens.access_token as string;
      resp = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(msg),
      });
    }
  }
  if (!resp.ok) return false;
  return true;
}

export async function checkOutlookHealth() {
  const auth = await store.readOutlookAuth();
  if (!auth) return { connected: false, email: null } as const;
  let tokens = auth.tokens;
  const clientId = process.env.MS_CLIENT_ID || "";
  const clientSecret = process.env.MS_CLIENT_SECRET || "";
  const tenant = process.env.MS_TENANT_ID || "common";
  const tokenUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
  // Try a lightweight call
  let meResp = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (meResp.status === 401 && tokens.refresh_token) {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: tokens.refresh_token as string,
    });
    const tResp = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (tResp.ok) {
      tokens = { ...tokens, ...(await tResp.json()) };
      await store.writeOutlookAuth({ email: auth.email, tokens });
      meResp = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
    }
  }
  if (!meResp.ok) {
    await store.clearOutlookAuth();
    return { connected: false, email: null } as const;
  }
  const me = await meResp.json();
  const email = me.mail || me.userPrincipalName || auth.email;
  if (email !== auth.email) await store.writeOutlookAuth({ email, tokens });
  return { connected: true, email } as const;
}
