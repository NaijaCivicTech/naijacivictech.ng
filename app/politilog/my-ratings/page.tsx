import { PolitilogMyRatingsView } from "@/features/politilog/components/PolitilogMyRatingsView";
import { SiteFooter } from "@/components/civic/SiteFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My ratings | PolitiLog",
  description: "Every role you have rated in PolitiLog.",
};

export default function PolitilogMyRatingsPage() {
  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <section className='mx-auto w-full max-w-[1200px] flex-1 px-10 py-12 max-md:px-5 max-md:py-8'>
        <PolitilogMyRatingsView />
      </section>
      <SiteFooter short />
    </div>
  );
}
