import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import "server-only";



export async function getUsers() {
    return db.select().from(users);
}

export async function createUser(data: {
    name: string;
    email: string;
    password: string
}) {
    await db.insert(users).values(data);
}