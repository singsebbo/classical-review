import { Request, Response, NextFunction } from "express";

export async function searchComposers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const term: string = req.query.term as string;
    /**
     * @todo Query database and store the result
     * @todo Send a response containing an array of objects representing composers
     */
  } catch (error: unknown) {
    next(error);
  }
}
