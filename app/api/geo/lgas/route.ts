import { NextResponse } from "next/server";
import { jsonInternalError } from "@/lib/api-error-response";
import { parseGeoSlugParam, parseObjectIdParam } from "@/lib/geo-route-params";
import { connectMongoose } from "@/lib/mongoose";
import { NigeriaLgaModel } from "@/lib/models/NigeriaLga";
import { NigeriaStateModel } from "@/lib/models/NigeriaState";

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const stateById = parseObjectIdParam(sp.get("stateId"));
  const stateParam = sp.get("state");
  const stateFromStateParam = parseObjectIdParam(stateParam);
  const stateSlug = stateFromStateParam
    ? null
    : parseGeoSlugParam(stateParam);

  try {
    await connectMongoose();

    let stateRef = stateById ?? stateFromStateParam;
    let canonicalStateSlug: string | null = null;

    if (stateRef) {
      const doc = await NigeriaStateModel.findById(stateRef)
        .select("slug")
        .lean();
      if (!doc?.slug) {
        return NextResponse.json({ error: "Unknown state" }, { status: 404 });
      }
      canonicalStateSlug = doc.slug;
    } else if (stateSlug) {
      const s = await NigeriaStateModel.findOne({ slug: stateSlug })
        .select("_id slug")
        .lean();
      if (!s?._id || !s.slug) {
        return NextResponse.json({ error: "Unknown state" }, { status: 404 });
      }
      stateRef = s._id;
      canonicalStateSlug = s.slug;
    }

    if (!stateRef || !canonicalStateSlug) {
      return NextResponse.json(
        {
          error:
            "Missing state: use ?state=<slug> (readable) or legacy ?stateId=<ObjectId>",
        },
        { status: 400 },
      );
    }

    const rows = await NigeriaLgaModel.find({ state: stateRef })
      .select("_id slug name")
      .sort({ name: 1 })
      .lean();
    return NextResponse.json({
      stateSlug: canonicalStateSlug,
      lgas: rows.map((l) => ({
        id: String(l._id),
        slug: l.slug,
        name: l.name,
      })),
    });
  } catch (e) {
    return jsonInternalError(e, "GET /api/geo/lgas");
  }
}
