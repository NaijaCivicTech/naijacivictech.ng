import { PolitilogProfileView } from "@/features/politilog/components/PolitilogProfileView";
import { SiteFooter } from "@/components/civic/SiteFooter";
import {
  ALL_POLITICIANS,
  getPoliticianById,
  officeLabel,
} from "@/features/politilog/lib/politilog-data";
import { getTimelineForPolitician } from "@/features/politilog/lib/politilog-timeline";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return ALL_POLITICIANS.map((politician) => ({ id: politician.id }));
}

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const p = getPoliticianById(id);
  if (!p) {
    return { title: "Officeholder | NaijaCivicTech" };
  }
  const timeline = getTimelineForPolitician(p.id);
  return {
    title: `${p.name} | PolitiLog`,
    description: `${officeLabel(p.office)} — ${p.jurisdiction}. Career timeline (${timeline.length} segments), community ratings, and moderated contributions on NaijaCivicTech PolitiLog.`,
  };
}

export default async function PolitilogProfilePage({ params }: PageProps) {
  const { id } = await params;
  const p = getPoliticianById(id);
  if (!p) notFound();
  const timeline = getTimelineForPolitician(p.id);

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <section className='mx-auto w-full max-w-[1200px] flex-1 px-10 py-12 max-md:px-5 max-md:py-8'>
        <PolitilogProfileView
          key={p.id}
          politician={p}
          timeline={timeline}
        />
      </section>
      <SiteFooter short />
    </div>
  );
}
