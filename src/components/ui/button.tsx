import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 hover:shadow-lg active:scale-95 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-lg active:scale-95 hover:-translate-y-0.5",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow-md active:scale-95 hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md active:scale-95 hover:-translate-y-0.5",
        ghost: 
          "hover:bg-accent hover:text-accent-foreground active:scale-95 hover:shadow-sm",
        link: 
          "text-primary underline-offset-4 hover:underline hover:text-primary/80 active:scale-95",
        premium: 
          "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:from-purple-700 hover:to-blue-700 hover:shadow-xl active:scale-95 hover:-translate-y-0.5",
        success:
          "bg-green-600 text-white shadow hover:bg-green-700 hover:shadow-lg active:scale-95 hover:-translate-y-0.5",
        warning:
          "bg-amber-500 text-white shadow hover:bg-amber-600 hover:shadow-lg active:scale-95 hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        subtle: "transition-all duration-200",
        smooth: "transition-all duration-300 ease-out",
        bouncy: "transition-all duration-200 hover:scale-105 active:scale-95",
        glow: "hover:shadow-lg hover:shadow-primary/25",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "smooth",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  ripple?: boolean
  gradient?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation,
    asChild = false, 
    loading = false, 
    loadingText = "Loading...",
    leftIcon,
    rightIcon,
    ripple = true,
    gradient = false,
    children,
    onClick,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    const [rippleArray, setRippleArray] = React.useState<Array<{ id: number; x: number; y: number }>>([])

    const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2
      const id = Date.now()

      setRippleArray(prev => [...prev, { id, x, y }])

      // Remove ripple after animation
      setTimeout(() => {
        setRippleArray(prev => prev.filter(ripple => ripple.id !== id))
      }, 600)
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !disabled && !loading) {
        createRipple(event)
      }
      if (onClick && !disabled && !loading) {
        onClick(event)
      }
    }

    const buttonContent = (
      <>
        {/* Gradient overlay for gradient variant */}
        {gradient && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        )}

        {/* Ripple effects */}
        <AnimatePresence>
          {rippleArray.map((ripple) => (
            <motion.div
              key={ripple.id}
              className="absolute bg-white/30 rounded-full pointer-events-none"
              initial={{ 
                scale: 0, 
                opacity: 1,
                x: ripple.x,
                y: ripple.y
              }}
              animate={{ 
                scale: 4, 
                opacity: 0 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                width: 20,
                height: 20,
              }}
            />
          ))}
        </AnimatePresence>

        {/* Button content */}
        <div className="relative z-10 flex items-center gap-2">
          {loading ? (
            <>
              <motion.div
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span>{loadingText}</span>
            </>
          ) : (
            <>
              <AnimatePresence mode="wait">
                {leftIcon && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {leftIcon}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <span>{children}</span>
              
              <AnimatePresence mode="wait">
                {rightIcon && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {rightIcon}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* Shine effect for premium buttons */}
        {variant === "premium" && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 3,
              ease: "easeInOut" 
            }}
          />
        )}
      </>
    )

    return (
      <motion.div
        whileTap={disabled || loading ? {} : { scale: 0.98 }}
        whileHover={disabled || loading ? {} : { scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Comp
          className={cn(buttonVariants({ variant, size, animation, className }))}
          ref={ref}
          onClick={handleClick}
          disabled={disabled || loading}
          {...props}
        >
          {buttonContent}
        </Comp>
      </motion.div>
    )
  }
)

Button.displayName = "Button"

// Specialized button components
export const IconButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ size = "icon", variant = "ghost", ...props }, ref) => (
    <Button ref={ref} size={size} variant={variant} {...props} />
  )
)

IconButton.displayName = "IconButton"

export const LoadingButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, loading = false, ...props }, ref) => (
    <Button ref={ref} loading={loading} {...props}>
      {children}
    </Button>
  )
)

LoadingButton.displayName = "LoadingButton"

export const GradientButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ gradient = true, variant = "premium", ...props }, ref) => (
    <Button ref={ref} gradient={gradient} variant={variant} {...props} />
  )
)

GradientButton.displayName = "GradientButton"

// Floating Action Button
export const FloatingActionButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    size = "lg", 
    variant = "default",
    ...props 
  }, ref) => (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Button
        ref={ref}
        className={cn(
          "rounded-full shadow-2xl hover:shadow-2xl shadow-primary/25",
          className
        )}
        size={size}
        variant={variant}
        {...props}
      />
    </motion.div>
  )
)

FloatingActionButton.displayName = "FloatingActionButton"

export { Button, buttonVariants }