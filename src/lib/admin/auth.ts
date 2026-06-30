export const ADMIN_EMAIL = "expense@anshapps.com";
export const ADMIN_PASSWORD = "Rahul@123";
export const ADMIN_PASSCODE = "Khushi@Simran";
export const ADMIN_PIN = "30042026";
export const ADMIN_SESSION_TOKEN = "ansh-admin-v2-authenticated";

export const ADMIN_SESSION_KEY = "ansh_admin_token";

export function validateAdminCredentials(credentials: {
  email: string;
  password: string;
  passcode: string;
  pin: string;
}) {
  return (
    credentials.email.trim() === ADMIN_EMAIL &&
    credentials.password === ADMIN_PASSWORD &&
    credentials.passcode === ADMIN_PASSCODE &&
    credentials.pin === ADMIN_PIN
  );
}

export function isAdminSessionToken(token: string | null | undefined) {
  return token === ADMIN_SESSION_TOKEN;
}
