import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth.service";

class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, confirmPass } = req.body;

      const result = await AuthService.register({
        name,
        email,
        password,
        confirmPass,
      });

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login({ email, password });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async me(req: any, res: Response) {
    // If you attach auth middleware here, req.user will exist
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const user = await AuthService.me(req.user.id);
    res.json(user);
  }
}

export default AuthController;
