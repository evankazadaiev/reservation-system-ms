import { Injectable } from '@nestjs/common';
import { UserDocument } from './users/models/user.schema';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { TokenPayload } from './interfaces/token-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  login(user: UserDocument, response: Response) {
    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
    };

    const JWT_EXPIRATION =
      this.configService.get<number>('JWT_EXPIRATION') || 3600;

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + JWT_EXPIRATION);

    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, {
      httpOnly: true,
      expires: expiresAt,
    });
  }
}
