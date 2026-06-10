import type { Metadata } from "next";
import Protected from "@/components/auth/Protected";
import Wizard from "@/components/wizard/Wizard";

export const metadata: Metadata = {
  title: "Adaptar mi CV · Jano",
};

export default function AppPage() {
  return (
    <Protected>
      <Wizard />
    </Protected>
  );
}
