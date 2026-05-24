import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger.utils";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
   const startTime = Date.now();
   
   Logger.info(`Incoming Request`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent'),
   });

   res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logLevel = res.statusCode >= 400 ? 'error' : 'info';
      
      const logData = {
         method: req.method,
         url: req.originalUrl,
         status: res.statusCode,
         duration: `${duration}ms`,
         ip: req.ip,
      };

      if (logLevel === 'error') {
         Logger.error(`Request Completed`, logData);
      } else {
         Logger.info(`Request Completed`, logData);
      }
   });

   next();
};
