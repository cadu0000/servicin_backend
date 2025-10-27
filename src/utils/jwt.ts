import jwt, { SignOptions } from "jsonwebtoken";

interface Payload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

interface IGenerateTokenOptions {
  payload: Payload;
  secret: string;
  expiresIn?: SignOptions["expiresIn"];
}

export function generateToken({
  payload,
  secret,
  expiresIn = "7d",
}: IGenerateTokenOptions): string {
  if (!secret) {
    throw new Error("JWT secret must be provided to generate token.");
  }

  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string, secret: string) {
  return jwt.verify(token, secret);
}
