import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { UserDocument } from './schema/user.schema';
import { SignupInput } from './types/signup.input';
import { LoginInput } from './types/login.input';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User')
    private userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  async signup(input: SignupInput) {
    const email = input.email.trim().toLowerCase();
    const existingUser = await this.userModel.findOne({ email });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const password = this.hashPassword(input.password);
    const username = email.split('@')[0] || 'user';

    const user = await this.userModel.create({
      email,
      username,
      password,
      photoURL: '/images/user.png',
      isAdmin: false,
      isSigned: true,
      lastLogin: new Date(),
      likedPosts: [],
      lovedPosts: [],
      savedPosts: [],
      commentPosts: [],
    });

    const accessToken = this.generateAccessToken(user);
    return { accessToken, user };
  }

  async login(input: LoginInput) {
    const email = input.email.trim().toLowerCase();
    const user = await this.userModel.findOne({ email });

    if (!user || !this.verifyPassword(input.password, user.password)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    user.lastLogin = new Date();
    user.isSigned = true;
    await user.save();

    const accessToken = this.generateAccessToken(user);
    return { accessToken, user };
  }


  async logout(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    user.isSigned = false;
    await user.save();
    return true;
  }

  private generateAccessToken(user: UserDocument): string {
    const secret = this.configService.get<string>('SECRET_KEY');
    if (!secret) {
      throw new BadRequestException('Missing SECRET_KEY configuration');
    }

    return jwt.sign(
      {
        id: String(user._id),
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: '7d' },
    );
  }


  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(plainPassword: string, storedPassword: string): boolean {
    const [salt, storedHash] = storedPassword.split(':');
    if (!salt || !storedHash) {
      return false;
    }

    const computedHash = crypto.scryptSync(plainPassword, salt, 64);
    const storedHashBuffer = Buffer.from(storedHash, 'hex');

    if (computedHash.length !== storedHashBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(computedHash, storedHashBuffer);
  }
}
