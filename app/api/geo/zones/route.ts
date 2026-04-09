import { NextResponse } from "next/server";
import { jsonInternalError } from "@/lib/api-error-response";
import { connectMongoose } from "@/lib/mongoose";
import { NigeriaGeopoliticalZoneModel } from "@/lib/models/NigeriaGeopoliticalZone";

export async function GET() {
  try {
    await connectMongoose();
    const rows = await NigeriaGeopoliticalZoneModel.find({})
      .select("_id slug name sortOrder")
      .sort({ sortOrder: 1, name: 1 })
      .lean();
    return NextResponse.json({
      zones: rows.map((z) => ({
        id: String(z._id),
        slug: z.slug,
        name: z.name,
        sortOrder: z.sortOrder,
      })),
    });
  } catch (e) {
    return jsonInternalError(e, "GET /api/geo/zones");
  }
}
