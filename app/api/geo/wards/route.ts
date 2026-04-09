import { NextResponse } from "next/server";
import { jsonInternalError } from "@/lib/api-error-response";
import { parseGeoSlugParam, parseObjectIdParam } from "@/lib/geo-route-params";
import { connectMongoose } from "@/lib/mongoose";
import { NigeriaLgaModel } from "@/lib/models/NigeriaLga";
import { NigeriaStateModel } from "@/lib/models/NigeriaState";
import { NigeriaWardModel } from "@/lib/models/NigeriaWard";

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const lgaById = parseObjectIdParam(sp.get("lgaId"));
  const stateParam = sp.get("state");
  const stateFromParam = parseObjectIdParam(stateParam);
  const stateSlug = stateFromParam
    ? null
    : parseGeoSlugParam(stateParam);
  const lgaSlug = parseGeoSlugParam(sp.get("lga"));

  try {
    await connectMongoose();

    let lgaRef = lgaById;
    if (!lgaRef && lgaSlug) {
      if (stateFromParam) {
        const lgaDoc = await NigeriaLgaModel.findOne({
          state: stateFromParam,
          slug: lgaSlug,
        })
          .select("_id")
          .lean();
        lgaRef = lgaDoc?._id ?? null;
      } else if (stateSlug) {
        const st = await NigeriaStateModel.findOne({ slug: stateSlug })
          .select("_id")
          .lean();
        if (!st?._id) {
          return NextResponse.json({ error: "Unknown state" }, { status: 404 });
        }
        const lgaDoc = await NigeriaLgaModel.findOne({
          state: st._id,
          slug: lgaSlug,
        })
          .select("_id")
          .lean();
        lgaRef = lgaDoc?._id ?? null;
      }
      if (!lgaRef && (stateFromParam || stateSlug)) {
        return NextResponse.json({ error: "Unknown LGA" }, { status: 404 });
      }
    }

    if (!lgaRef) {
      return NextResponse.json(
        {
          error:
            "Missing LGA: use ?state=<stateSlug>&lga=<lgaSlug> (readable) or legacy ?lgaId=<ObjectId>",
        },
        { status: 400 },
      );
    }

    const rows = await NigeriaWardModel.find({ lga: lgaRef })
      .select("_id slug name")
      .sort({ name: 1 })
      .lean();
    return NextResponse.json({
      wards: rows.map((w) => ({
        id: String(w._id),
        slug: w.slug,
        name: w.name,
      })),
    });
  } catch (e) {
    return jsonInternalError(e, "GET /api/geo/wards");
  }
}
