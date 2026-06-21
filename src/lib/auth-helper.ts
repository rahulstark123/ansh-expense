import { createClient } from "@supabase/supabase-js";
import { prisma } from "./db";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hjnqlybokoljhxyzsqqi.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_GbWUE3qA8Uv80ssHRUKqsQ_FwANa9OY";

const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Cache map definitions for token verification and employee query caching
const tokenCache = new Map<string, { user: any; expiresAt: number }>();
const employeeCache = new Map<string, { employee: any; expiresAt: number }>();

export async function getAuthUser(req: Request) {
  let token = "";
  const authHeader = req.headers.get("Authorization");
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    try {
      const { searchParams } = new URL(req.url);
      const paramToken = searchParams.get("token");
      if (paramToken) {
        token = paramToken;
      }
    } catch {
      // Ignore URL parsing errors
    }
  }

  if (!token) {
    return null;
  }

  // Check cached token state
  const cachedToken = tokenCache.get(token);
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.user;
  }
  
  try {
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    if (error || !user) return null;

    // Cache the user for 60 seconds to avoid Supabase API roundtrip latency
    tokenCache.set(token, {
      user,
      expiresAt: Date.now() + 60000,
    });

    // occasional cache eviction cleanup (1% probability)
    if (Math.random() < 0.01) {
      const now = Date.now();
      for (const [k, v] of tokenCache.entries()) {
        if (v.expiresAt < now) tokenCache.delete(k);
      }
      for (const [k, v] of employeeCache.entries()) {
        if (v.expiresAt < now) employeeCache.delete(k);
      }
    }

    return user;
  } catch (err) {
    console.error("Auth helper verification error:", err);
    return null;
  }
}

export async function getAuthEmployee(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return null;

  const impersonateHeader = req.headers.get("X-Impersonate-User") || "";
  const isGetRequest = req.method === "GET";
  const cacheKey = `${user.id}:${impersonateHeader}:${req.method}`;

  // Serve from cache for GET requests if exists
  if (isGetRequest) {
    const cachedEmp = employeeCache.get(cacheKey);
    if (cachedEmp && cachedEmp.expiresAt > Date.now()) {
      return cachedEmp.employee;
    }
  }

  try {
    const loggedInEmployee = await prisma.employee.findUnique({
      where: { id: user.id },
    });

    if (!loggedInEmployee) return null;

    let finalEmployee = loggedInEmployee;

    // Impersonate check: allow Admin/Manager for any request, or standard employees for GET requests only
    if (impersonateHeader && impersonateHeader !== loggedInEmployee.id) {
      const isManagement = loggedInEmployee.role === "Admin" || loggedInEmployee.role === "Manager" || loggedInEmployee.role === "Owner";
      if (isGetRequest || isManagement) {
        const impersonated = await prisma.employee.findUnique({
          where: { id: impersonateHeader },
        });
        if (impersonated) finalEmployee = impersonated;
      }
    }

    // Cache employee DB resolutions for GET requests for 30 seconds
    if (isGetRequest) {
      employeeCache.set(cacheKey, {
        employee: finalEmployee,
        expiresAt: Date.now() + 30000,
      });
    }

    return finalEmployee;
  } catch (err) {
    console.error("Auth helper database lookup error:", err);
    return null;
  }
}
