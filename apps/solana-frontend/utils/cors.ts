import Cors from "cors";
import { NextApiRequest, NextApiResponse } from "next";

const cors = Cors({
  origin:
    process.env.NODE_ENV === "development" ? true : /\.playspokemon\.xyz$/,
});

export default function runCorsMiddleware(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return runMiddleware(req, res, cors);
}

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}
