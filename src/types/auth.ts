import type { User } from "@supabase/supabase-js";

export type AuthRole = "admin" | "client" | "guest";

export type AuthContextType = {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    role: AuthRole;
    displayName: string | null;
    signOut: () => Promise<void>;
}