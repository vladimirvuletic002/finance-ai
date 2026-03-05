import { jwtDecode } from "jwt-decode";

type JwtPayload = { exp?: number };

export const isTokenExpired = (token: string) => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.exp) return true;
    // exp is in seconds
    return decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};