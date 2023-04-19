import { ValidRoles } from './../interfaces/valid-roles';
import { SetMetadata } from '@nestjs/common';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: ValidRoles[]) => {


  return SetMetadata(META_ROLES, args);
}
