import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        // Clean, modern, professional textarea styles
        "flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-base shadow-inner transition-all duration-200",
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
})
Textarea.displayName = "Textarea"

export { Textarea }
