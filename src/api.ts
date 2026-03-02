import { requireApiKey, resolveBaseUrl } from "./config.js";

async function parseResponse(response: Response) {
  const text = await response.text();
  let parsed: unknown = null;

  try {
    parsed = text.length ? JSON.parse(text) : null;
  } catch {
    parsed = { message: text };
  }

  if (!response.ok) {
    const message =
      typeof parsed === "object" && parsed && "message" in parsed
        ? String((parsed as { message: unknown }).message)
        : `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return parsed;
}

export async function register() {
  const baseUrl = await resolveBaseUrl();
  const response = await fetch(`${baseUrl}/register`, {
    method: "POST"
  });
  return parseResponse(response) as Promise<{ api_key: string; message: string }>;
}

export async function settingsSummary() {
  const baseUrl = await resolveBaseUrl();
  const apiKey = await requireApiKey();

  const response = await fetch(`${baseUrl}/settings`, {
    headers: {
      "x-api-key": apiKey
    }
  });

  return parseResponse(response) as Promise<{
    settings: {
      email: string | null;
      zip_code: string | null;
      approval_enabled: boolean;
      approval_threshold_usd: number | null;
      card: {
        issuer: string | null;
        last4: string | null;
      } | null;
    };
  }>;
}

export async function settingsPageLink() {
  const baseUrl = await resolveBaseUrl();
  const apiKey = await requireApiKey();

  const response = await fetch(`${baseUrl}/settings/link`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey
    }
  });

  return parseResponse(response) as Promise<{ url: string; expires_in_hours: number }>;
}

export async function setAddress(input: {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}) {
  const baseUrl = await resolveBaseUrl();
  const apiKey = await requireApiKey();

  const response = await fetch(`${baseUrl}/settings/address`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify(input)
  });

  return parseResponse(response);
}

export async function setEmail(email: string) {
  const baseUrl = await resolveBaseUrl();
  const apiKey = await requireApiKey();

  const response = await fetch(`${baseUrl}/settings/email`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify({ email })
  });

  return parseResponse(response);
}

export async function search(query: string) {
  const baseUrl = await resolveBaseUrl();
  const apiKey = await requireApiKey();

  const response = await fetch(`${baseUrl}/search`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify({ query })
  });

  return parseResponse(response) as Promise<{
    notice: string | null;
    results: Array<{
      selva_id: string;
      source: string;
      title: string;
      price: number | null;
      rating: number | null;
      url: string | null;
      delivery_estimate: string | null;
      prime_eligible: boolean | null;
      review_count: number | null;
      availability: string | null;
      variants: string[];
    }>;
    raw: Record<string, unknown>;
    errors: Array<{ provider: string; message: string }>;
  }>;
}

export async function details(selvaId: string) {
  const baseUrl = await resolveBaseUrl();
  const apiKey = await requireApiKey();

  const response = await fetch(`${baseUrl}/details/${encodeURIComponent(selvaId)}`, {
    headers: {
      "x-api-key": apiKey
    }
  });

  return parseResponse(response) as Promise<{
    source: string;
    product: {
      selva_id: string;
      source: string;
      title: string;
      price: number | null;
      rating: number | null;
      url: string | null;
      delivery_estimate: string | null;
      prime_eligible: boolean | null;
      review_count: number | null;
      availability: string | null;
      variants: string[];
      image_url: string | null;
    } | null;
    raw: unknown;
  }>;
}

export async function buy(input: {
  selva_id: string;
  method: "card" | "saved";
  payment_token?: string;
}) {
  const baseUrl = await resolveBaseUrl();
  const apiKey = await requireApiKey();

  const response = await fetch(`${baseUrl}/buy`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify(input)
  });

  return parseResponse(response) as Promise<Record<string, unknown>>;
}

export async function orders() {
  const baseUrl = await resolveBaseUrl();
  const apiKey = await requireApiKey();

  const response = await fetch(`${baseUrl}/orders`, {
    headers: {
      "x-api-key": apiKey
    }
  });

  return parseResponse(response) as Promise<{
    orders: Array<{
      id: string;
      selva_id: string;
      status: string;
      payment_method: string;
      requested_amount_usd: string;
      final_amount_usd: string | null;
      created_at: string;
    }>;
  }>;
}

export async function stripePublishableKey() {
  const baseUrl = await resolveBaseUrl();
  const apiKey = await requireApiKey();

  const response = await fetch(`${baseUrl}/settings/stripe-publishable-key`, {
    headers: {
      "x-api-key": apiKey
    }
  });

  return parseResponse(response) as Promise<{ stripe_publishable_key: string }>;
}
