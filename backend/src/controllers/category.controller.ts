import { Request,Response,NextFunction } from "express";
import CategoryService from "../services/category.service";

class CategoryController{
    static async list(req: Request, res: Response, next: NextFunction){
        try{
            const userId = (req as any).user.id;
            const data = await CategoryService.list(userId);

            res.status(200).json(data);
        }
        catch(err){
            next(err);
        }
    }


}

export default CategoryController;