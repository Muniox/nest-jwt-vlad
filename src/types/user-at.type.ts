export type UserATRequest = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  refreshToken: string;
};
