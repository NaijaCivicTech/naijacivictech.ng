import { NextResponse } from "next/server";
import { jsonInternalError } from "@/lib/api-error-response";
import { parseGeoSlugParam, parseObjectIdParam } from "@/lib/geo-route-params";
import { connectMongoose } from "@/lib/mongoose";
import { NigeriaGeopoliticalZoneModel } from "@/lib/models/NigeriaGeopoliticalZone";
import { NigeriaStateModel } from "@/lib/models/NigeriaState";

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const zoneById = parseObjectIdParam(sp.get("zoneId"));
  const zoneParam = sp.get("zone");
  const zoneFromZoneParam = parseObjectIdParam(zoneParam);
  const zoneSlug = zoneFromZoneParam
    ? null
    : parseGeoSlugParam(zoneParam);

  try {
    await connectMongoose();

    let zoneRef = zoneById ?? zoneFromZoneParam;
    if (!zoneRef && zoneSlug) {
      const z = await NigeriaGeopoliticalZoneModel.findOne({ slug: zoneSlug })
        .select("_id")
        .lean();
      zoneRef = z?._id ?? null;
      if (!zoneRef) {
        return NextResponse.json({ error: "Unknown zone" }, { status: 404 });
      }
    }

    if (!zoneRef) {
      return NextResponse.json(
        {
          error:
            "Missing zone: use ?zone=<slug> (readable) or legacy ?zoneId=<ObjectId>",
        },
        { status: 400 },
      );
    }

    const rows = await NigeriaStateModel.find({ zone: zoneRef })
      .select("_id slug name capital")
      .sort({ name: 1 })
      .lean();
    return NextResponse.json({
      states: rows.map((s) => ({
        id: String(s._id),
        slug: s.slug,
        name: s.name,
        capital: s.capital,
      })),
    });
  } catch (e) {
    return jsonInternalError(e, "GET /api/geo/states");
  }
}
