import * as React from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

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
  const [showPassword, setShowPassword] = useState(true);

  const isPasswordType = type === inputTypes.PASSWORD;

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="relative">
      <Input
        {...props}
        type={showPassword ? "text" : "password"}
        className={isPasswordType ? "pr-10" : ""}
      />

      {isPasswordType && <button
        type="button"
        onClick={togglePassword}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:text-foreground"
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>}

    </div>
  );
};

export type { TogglePasswordInputProps };
