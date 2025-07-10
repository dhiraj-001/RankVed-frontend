import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Clean, modern, professional input styles
          "flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-base shadow-inner transition-all duration-200",
          "placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary focus:bg-white focus:shadow-lg",
          "hover:border-primary/40 hover:bg-white",
          "disabled:cursor-not-allowed disabled:opacity-50 md:text-base",
          "dark:bg-slate-900 dark:border-slate-700 dark:placeholder:text-slate-500 dark:focus:bg-slate-800",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
