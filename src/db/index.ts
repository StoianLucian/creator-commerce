import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
/// import all schemas
import * as schema from "./exports";
const sql = neon(process.env.DB_URL!);

export const db = drizzle(sql, { schema });