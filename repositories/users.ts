import { user } from "@/auth-schema";
import { db } from "@/src/db";
import "server-only";



export async function getUsers() {
    return db.select().from(user);
}