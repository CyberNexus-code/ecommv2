"use server"

import { getUserRole } from "@/lib/getuserRole"

export async function getRole() {
   const role = await getUserRole()

   return role
}