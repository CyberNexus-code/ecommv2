import { tokens } from "@/styles/tokens";
import Link, {LinkProps} from "next/link";
import { AnchorHTMLAttributes } from "react";

type Variant = "primary" | "secondary1" | "secondary2"

type LinkButtonProps = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    variant?: Variant
    loading?: boolean
}

export default function LinkButton({ children, variant="primary", loading = false, className="", ...props} : LinkButtonProps){

    const base = `inline-flex items-center justify-center ${tokens.radius.md} px-4 py-2 ${tokens.text.sm} font-medium transition ${loading ? 'pointer-events-none opacity-70' : ''}`

    return (
        <Link aria-busy={loading} className={`${base} ${tokens.button[variant]} ${className}`} {...props}>
            {children}
        </Link>
    ) 
    
}