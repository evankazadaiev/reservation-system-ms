import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Request } from 'express';
import { TokenPayload } from '../interfaces/token-payload';
import { Injectable } from '@nestjs/common';

interface AuthenticatedRequest extends Request {
  Authentication?: string;
  cookies: {
    Authentication?: string;
  };
}

function isExpressRequest(request: any): request is AuthenticatedRequest {
  return (request as AuthenticatedRequest).cookies !== undefined;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private usersService: UsersService,
  ) {
    const JWT_SECRET = configService.get<string>('JWT_SECRET') || 'default';
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any): string | null => {
          console.log('REQUEST >>> ', request);
          if (isExpressRequest(request)) {
            return (
              request.cookies?.Authentication || request.Authentication || null
            );
          }
          return (request as AuthenticatedRequest).Authentication || null;
        },
      ]),
      secretOrKey: JWT_SECRET,
    });
  }

  async validate({ userId }: TokenPayload) {
    return this.usersService.getUser({ _id: userId });
  }
}
