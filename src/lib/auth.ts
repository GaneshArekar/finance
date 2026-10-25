import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { headers } from "next/headers";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/personal_finance";
const MONGODB_DB = process.env.MONGODB_DB || "personal_finance";


// Global cached MongoClient for auth adapter to avoid connection exhaustion under high concurrency
declare global {
  // eslint-disable-next-line no-var
  var _authMongoClient: MongoClient | undefined;
}

if (!global._authMongoClient) {
  global._authMongoClient = new MongoClient(MONGODB_URI, {
    maxPoolSize: 50,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 10000,
  });
}

const authClient = global._authMongoClient;
const db = authClient.db(MONGODB_DB);

const getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: process.env.BETTER_AUTH_SECRET || "personal_finance_default_secret_key_32chars_long",
  baseURL: getBaseURL(),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 12, // 12 hours active session
    updateAge: 60 * 30, // 30 minutes update age
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    defaultCookieAttributes: {
      sameSite: "lax",
      path: "/",
      httpOnly: true,
    },
  },
  user: {
    additionalFields: {
      currency: {
        type: "string",
        defaultValue: "INR",
        required: false,
      },
      name: {
        type: "string",
        required: false,
      },
    },
  },
});

/**
 * Server-side session verification helper for Server Actions and Route Handlers
 */
export async function getAuthSession(customHeaders?: Headers) {
  try {
    const reqHeaders = customHeaders || (await headers());
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });
    return session;
  } catch {
    return null;
  }
}


/**
 * Required session helper that throws or returns 401 response structure if unauthorized
 */
export async function requireAuthUser() {
  const session = await getAuthSession();
  if (!session || !session.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}
