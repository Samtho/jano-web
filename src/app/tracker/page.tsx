import type { Metadata } from "next";
import TrackerView from "@/components/tracker/TrackerView";

export const metadata: Metadata = {
  title: "Tracker · Jano",
};

export default function TrackerPage() {
  return <TrackerView />;
}
