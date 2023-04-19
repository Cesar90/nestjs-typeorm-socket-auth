import { Reflector } from '@nestjs/core'
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/auth/entities/users.entity';
import { META_ROLES } from './../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflactor: Reflector
  ){

  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles: string[] = this.reflactor.get(META_ROLES, context.getHandler());

    if(!validRoles){
      return true;
    }
    if(validRoles.length === 0){
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;
    if(!user){
      throw new BadRequestException('User not found');
    }
    // console.log({ validRoles });
    // console.log('User Role Guard')
    // throw new BadRequestException('Hello World');
    console.log({userRoles: user.roles});

    for(const role of user.roles){
      if(validRoles.includes(role)){
        return true;
      }
    }

    throw new ForbiddenException(
      `User ${user.fullName} need a valid role: [${validRoles}]`
    )
  }
}
