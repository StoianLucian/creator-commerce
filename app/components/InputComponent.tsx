import * as React from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TogglePasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isPassword?: boolean;
  className?: string;
}

const inputTypes = {
  TEXT: "text",
  PASSWORD: "password"
}

export const TogglePasswordInput: React.FC<TogglePasswordInputProps> = ({
  type = inputTypes.TEXT,
  className,
  ...props
}: TogglePasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordType = type === inputTypes.PASSWORD;

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="relative">
      <Input
        {...props}
        type={showPassword ? "text" : "password"}
        className={cn(isPasswordType && "pr-10", className)}
      />

      {isPasswordType && <button
        type="button"
        onClick={togglePassword}
        aria-label={showPassword ? "Hide password" : "Show password"}
        aria-pressed={showPassword}
        className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>}

    </div>
  );
};

export type { TogglePasswordInputProps };
