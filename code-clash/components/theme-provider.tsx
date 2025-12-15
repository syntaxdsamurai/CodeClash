"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// This uses the correct type for next-themes v0.3+
export function ThemeProvider({
                                  children,
                                  ...props
                              }: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}