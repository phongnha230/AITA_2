const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnpqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%&*?';
// Ambiguous characters (0/O, 1/l/I) are left out so the password is easy to read out loud or type.
const ALL = UPPER + LOWER + DIGITS + SYMBOLS;

const randomInt = (max: number): number => {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit); // rejection sampling avoids modulo bias
  return buf[0] % max;
};

const pick = (chars: string): string => chars[randomInt(chars.length)];

/** Cryptographically random temporary password containing upper, lower, digit and symbol. */
export const generatePassword = (length = 12): string => {
  const chars = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SYMBOLS)];
  while (chars.length < length) chars.push(pick(ALL));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
};
