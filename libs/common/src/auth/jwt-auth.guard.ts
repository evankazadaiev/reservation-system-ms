import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { map, Observable, tap } from 'rxjs';
import { Request } from 'express';
import { AUTH_SERVICE } from '@app/common/constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { UserDto } from '@app/common/dto';

interface AuthenticatedRequest extends Request {
  cookies: {
    Authentication?: string;
  };
}

interface RequestWithUser extends Request {
  user: UserDto;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const jwt = request.cookies?.Authentication;

    if (!jwt) {
      return false;
    }

    return this.authClient
      .send<UserDto>('authenticate', {
        Authentication: jwt,
      })
      .pipe(
        // Should be user
        tap((authResponse) => {
          context.switchToHttp().getRequest<RequestWithUser>().user =
            authResponse;
        }),
        map(() => true),
      );
  }
}
