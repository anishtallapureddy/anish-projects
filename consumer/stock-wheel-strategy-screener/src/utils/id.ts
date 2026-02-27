import * as crypto from 'crypto';

export function shortId(): string {
  return crypto.randomBytes(4).toString('hex');
}
