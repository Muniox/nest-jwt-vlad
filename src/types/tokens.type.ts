export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export enum CookieNames {
  ACCESS = 'Authorization',
  REFRESH = 'Refresh',
}
