// Small client-side hashing for demo purposes only
// Uses Web Crypto API to derive a salt+SHA-256 hash. Not suitable for production but fine for local demo.

export const generateSalt = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
};

export const hashPassword = async (password: string, salt: string): Promise<string> => {
  const enc = new TextEncoder();
  const data = enc.encode(salt + password);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuf));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const createPasswordHash = async (password: string): Promise<string> => {
  const salt = generateSalt();
  const hash = await hashPassword(password, salt);
  return `${salt}$${hash}`;
};

export const verifyPassword = async (password: string, stored: string | undefined): Promise<boolean> => {
  if (!stored) return false;
  const [salt, hash] = stored.split('$');
  if (!salt || !hash) return false;
  const candidate = await hashPassword(password, salt);
  return candidate === hash;
};
