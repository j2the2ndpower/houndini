export function getEnv(name: string, required = false): string | undefined {
  const v = process.env[name];
  if (required && (!v || v.length === 0)) {
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

export function getCronSecret(): string | undefined {
  return getEnv('CRON_SECRET');
}

export function getStripeApiKey(required = false): string | undefined {
  return getEnv('STRIPE_API_KEY', required);
}


