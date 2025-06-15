export interface JwtPayload {
  user_id: string;
  username: string;
  email?: string;
  role?: string;
}

export interface AuthenticatedRequest {
  user: JwtPayload;
}