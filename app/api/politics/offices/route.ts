import { NextResponse } from "next/server";
import { jsonInternalError } from "@/lib/api-error-response";
import { connectMongoose } from "@/lib/mongoose";
import { PoliticalOfficeModel } from "@/lib/models/PoliticalOffice";

export async function GET() {
  try {
    await connectMongoose();
    const rows = await PoliticalOfficeModel.find({})
      .select(
        "slug label defaultHeadline tier branch body seatType jurisdictionScope sortOrder",
      )
      .sort({ sortOrder: 1, label: 1 })
      .lean();

    return NextResponse.json({
      offices: rows.map((o) => ({
        id: String(o._id),
        slug: o.slug,
        label: o.label,
        defaultHeadline: o.defaultHeadline,
        tier: o.tier,
        branch: o.branch,
        body: o.body,
        seatType: o.seatType,
        jurisdictionScope: o.jurisdictionScope,
        sortOrder: o.sortOrder,
      })),
    });
  } catch (e) {
    return jsonInternalError(e, "GET /api/politics/offices");
  }
}
