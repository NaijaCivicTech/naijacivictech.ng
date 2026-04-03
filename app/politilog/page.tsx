import { PolitilogBoard } from "@/components/civic/PolitilogBoard";
import { SiteFooter } from "@/components/civic/SiteFooter";

export default function PolitilogPage() {
  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <section className='mx-auto w-full max-w-[1200px] flex-1 px-10 py-12 max-md:px-5 max-md:py-8'>
        <PolitilogBoard />
      </section>
      <SiteFooter short />
    </div>
  );
}
