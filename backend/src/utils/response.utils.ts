import { Response } from "express";

export class ResponseUtils {
   static success(
      res: Response,
      data: any,
      message: string = "Success",
      statusCode: number = 200
   ) {
      return res.status(statusCode).json({
         status: "success",
         message,
         data,
      });
   }

   static error(
      res: Response,
      message: string,
      statusCode: number = 500,
      errors?: any[]
   ) {
      return res.status(statusCode).json({
         status: "error",
         message,
         ...(errors && { errors }),
      });
   }

   static paginated(
      res: Response,
      data: any[],
      total: number,
      page: number,
      limit: number
   ) {
      return res.status(200).json({
         status: "success",
         data,
         pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrevious: page > 1,
         },
      });
   }
}
