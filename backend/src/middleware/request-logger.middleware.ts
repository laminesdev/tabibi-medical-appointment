import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger.utils";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
   const startTime = Date.now();
   
   // Log the incoming request
   Logger.info(`Incoming Request`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent'),
   });

   // Capture response finish to log duration and status
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

// Optional: More detailed logging for development
export const detailedRequestLogger = (req: Request, _res: Response, next: NextFunction) => {
   if (process.env.NODE_ENV === 'development') {
      console.log('\n=== Request Details ===');
      console.log(`Method: ${req.method}`);
      console.log(`URL: ${req.originalUrl}`);
      console.log(`Headers:`, req.headers);
      if (req.body && Object.keys(req.body).length > 0) {
         console.log(`Body:`, JSON.stringify(req.body, null, 2));
      }
      if (req.query && Object.keys(req.query).length > 0) {
         console.log(`Query:`, req.query);
      }
      console.log('=====================\n');
   }
   next();
};
