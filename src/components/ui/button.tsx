'use client'

import { ButtonHTMLAttributes } from "react"
import { tokens } from "@/styles/tokens"
import { Spinner } from "./spinner"

type Variant = "primary" | "secondary1" | "secondary2" | "danger" 

interface ButtonRoseProps extends ButtonHTMLAttributes<HTMLButtonElement>{
    variant?: Variant
    loading?: boolean
}

export default function ButtonRose({children, variant="primary", loading = false, className = "", disabled, ...props}: ButtonRoseProps){

    const base = `inline-flex items-center justify-center ${tokens.radius.md} px-4 py-2 ${tokens.text.sm} font-medium transition`

    return (
        <button className={`${base} ${tokens.button[variant]} ${className}`} {...props} disabled={disabled || loading}>
            <span className="flex items-center justify-center gap-2">
                {loading && (
                    <span>
                        <Spinner size="sm" />
                    </span>
                    )}
                <span className={loading ? "opacity-70" : ""}>
                    {loading ? "Loading" : children}
                </span>
            </span>
        </button>
    )
}