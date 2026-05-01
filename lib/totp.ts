import { generateSecret as genSecret, generateURI, verifySync } from "otplib";

export function generateSecret(): string {
  return genSecret();
}

export function generateKeyUri(email: string, secret: string, issuer: string): string {
  return generateURI({ label: email, issuer, secret, strategy: "totp" });
}

export function verifyToken(token: string, secret: string): boolean {
  return verifySync({ token, secret, strategy: "totp" }) as unknown as boolean;
}
