import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth.service.js";
import { HttpException } from "../utils/http-exception.js";

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

  static async me(req: any, res: Response, next: NextFunction) {
    try {
      // authMiddleware runs before this controller, so req.user is populated.
      if (!req.user) return next(new HttpException(401, "Unauthorized", "UNAUTHORIZED"));
      const user = await AuthService.me(req.user.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
