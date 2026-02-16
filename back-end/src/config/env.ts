import "dotenv/config";

export const JWT_SECRET: string = (() => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return process.env.JWT_SECRET;
})();
