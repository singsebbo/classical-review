import { Request, Response, NextFunction } from "express";

export async function searchComposers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    /**
     * @todo
     */
  } catch (error: unknown) {
    next(error);
  }
}
