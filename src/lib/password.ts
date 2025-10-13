import bcrypt from "bcryptjs";

const SALT_ROUNDS = 8;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}
