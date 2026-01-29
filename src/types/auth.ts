import type { User } from "@supabase/supabase-js";
import { UUID } from "./uuid";

export type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    role: "admin" | "client" | "guest";
    basketSession: UUID
}