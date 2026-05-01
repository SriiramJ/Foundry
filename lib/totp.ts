import { generateSecret as genSecret, generateURI, verifySync } from "otplib";

export function generateSecret(): string {
  return genSecret();
}

export function generateKeyUri(email: string, secret: string, issuer: string): string {
  return generateURI({ label: email, issuer, secret, strategy: "totp" });
}

export function verifyToken(token: string, secret: string): boolean {
  const result = verifySync({ token, secret, strategy: "totp" });
  return result === true || (typeof result === "object" && (result as any).isValid === true);
}
