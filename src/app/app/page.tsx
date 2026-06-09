import type { Metadata } from "next";
import Wizard from "@/components/wizard/Wizard";

export const metadata: Metadata = {
  title: "Adaptar mi CV · Jano",
};

export default function AppPage() {
  return <Wizard />;
}
