import type { Metadata } from "next";
import Protected from "@/components/auth/Protected";
import CuentaView from "@/components/cuenta/CuentaView";

export const metadata: Metadata = {
  title: "Mi cuenta · Jano",
};

export default function CuentaPage() {
  return (
    <Protected>
      <CuentaView />
    </Protected>
  );
}
