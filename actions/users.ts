"use server";

import { db } from "@/src/db";
import { users } from "@/src/db/schema";



export async function createUser(formData: FormData) {
  await db.insert(users).values({
    name: formData.get("name") as string,
    email: formData.get("email") as string,
  });
}