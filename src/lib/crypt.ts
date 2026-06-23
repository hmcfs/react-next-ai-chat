import bcrypt from 'bcryptjs';
import { SALT_ROUNDS } from './constants';
export const pswCrypt = {
  async hash(password: string) {
    return bcrypt.hash(password, SALT_ROUNDS);
  },
  async compare(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  },
};
/* (async () => {
  console.log(await pswCrypt.hash('123'));
})(); */
