import { Injectable, CanActivate, Inject, forwardRef } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UserIsGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UserService)) private userService: UserService,
  ) {}
  canActivate(context): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const params = request.params;
    if (Number(params.id) == request.user.user.id) {
      return true;
    } else return false;
  }
}
