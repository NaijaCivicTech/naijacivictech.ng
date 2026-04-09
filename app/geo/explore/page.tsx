import { GeoExplore } from "@/features/geo/components/GeoExplore";
import { GeoExplorePageSkeleton } from "@/features/geo/components/GeoLoadingSkeletons";
import { Suspense } from "react";

export default function GeoExplorePage() {
  return (
    <Suspense fallback={<GeoExplorePageSkeleton />}>
      <GeoExplore />
    </Suspense>
  );
}
