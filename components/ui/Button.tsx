import { Pressable, Text, type PressableProps } from "react-native";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends Omit<PressableProps, "children"> {
  /** Button label text */
  children: string;
  /** Visual variant of the button */
  variant?: "primary" | "secondary" | "ghost";
  /** Size of the button */
  size?: "sm" | "md" | "lg";
}

/**
 * Reusable button component with primary, secondary, and ghost variants.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "items-center justify-center rounded-xl";

  const variantStyles = {
    primary: "bg-primary active:bg-primary-dark",
    secondary: "bg-surface-dark active:bg-surface-active",
    ghost: "bg-transparent active:bg-surface-dark",
  };

  const sizeStyles = {
    sm: "px-3 py-2",
    md: "px-4 py-3",
    lg: "px-6 py-4",
  };

  const textVariantStyles = {
    primary: "text-background-dark font-bold",
    secondary: "text-white font-medium",
    ghost: "text-primary font-medium",
  };

  const textSizeStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <Pressable
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabled && "opacity-50",
        className
      )}
      disabled={disabled}
      accessibilityRole="button"
      {...props}
    >
      <Text
        className={cn(textVariantStyles[variant], textSizeStyles[size])}
      >
        {children}
      </Text>
    </Pressable>
  );
}
