export type UserRole = 'OWNER' | 'SDR' | 'VIEWER';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export class IdDto {
  id!: string;
}
