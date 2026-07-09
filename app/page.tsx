import Image from "next/image";
import { LoginForm } from "./components/LoginForm";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className={cn("flex flex-col items-center justify-center h-screen bg-gray-100")}>
      <LoginForm />
    </div>

  );
}
