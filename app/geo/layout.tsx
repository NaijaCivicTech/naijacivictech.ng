import { GeoSubNav } from "@/features/geo/components/GeoSubNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Geo reference | NaijaCivicTech",
  robots: { index: false, follow: false },
};

export default function GeoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GeoSubNav />
      {children}
    </>
  );
}
