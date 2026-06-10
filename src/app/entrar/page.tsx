import type { Metadata } from "next";
import AuthScreen from "@/components/auth/AuthScreen";

export const metadata: Metadata = {
  title: "Entrar · Jano",
};

export default function EntrarPage() {
  return <AuthScreen />;
}
