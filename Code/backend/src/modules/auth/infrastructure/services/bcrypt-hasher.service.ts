import bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../domain/services/password-hasher.service.interface.js';

export class BcryptHasherService implements IPasswordHasher {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
