import { resolveNigeriaStateName } from "@/data/nigeria-state-meta";
import { findPolitilogLgaOption } from "@/features/politilog/lib/politilog-lga-options";
import { connectMongoose } from "@/lib/mongoose";
import {
  NigeriaLgaModel,
  NigeriaStateModel,
  UserResidenceModel,
} from "@/lib/models";
import mongoose from "mongoose";

export type PolitilogResidencePayload = {
  state: string;
  lga: string;
  key: string;
};

function politilogStateFromDbStateName(dbName: string): string {
  if (dbName === "Federal Capital Territory") return "FCT";
  return dbName;
}

export async function resolvePolitilogToGeoIds(
  politilogState: string,
  politilogLgaName: string,
): Promise<{
  state: mongoose.Types.ObjectId;
  lga: mongoose.Types.ObjectId;
} | null> {
  const option = findPolitilogLgaOption(politilogState, politilogLgaName);
  if (!option) return null;

  await connectMongoose();

  const canonical = resolveNigeriaStateName(politilogState.trim());
  if (!canonical) return null;

  const stateDoc = await NigeriaStateModel.findOne({ name: canonical })
    .select("_id")
    .lean();
  if (!stateDoc?._id) return null;

  const lgaDoc = await NigeriaLgaModel.findOne({
    state: stateDoc._id,
    name: politilogLgaName.trim(),
  })
    .select("_id")
    .lean();

  if (!lgaDoc?._id) return null;
  return { state: stateDoc._id, lga: lgaDoc._id };
}

export async function setUserCurrentResidenceFromPolitilog(
  userIdHex: string,
  payload: { state: string; lga: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!mongoose.Types.ObjectId.isValid(userIdHex)) {
    return { ok: false, error: "Invalid user" };
  }
  const ids = await resolvePolitilogToGeoIds(payload.state, payload.lga);
  if (!ids) return { ok: false, error: "Unknown state or LGA" };

  const userId = new mongoose.Types.ObjectId(userIdHex);
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await UserResidenceModel.updateMany(
        { userId, isCurrent: true },
        { $set: { isCurrent: false } },
        { session },
      );
      await UserResidenceModel.create(
        [
          {
            userId,
            state: ids.state,
            lga: ids.lga,
            ward: null,
            isCurrent: true,
          },
        ],
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
  return { ok: true };
}

export async function clearUserCurrentResidence(userIdHex: string): Promise<void> {
  if (!mongoose.Types.ObjectId.isValid(userIdHex)) return;
  await connectMongoose();
  const userId = new mongoose.Types.ObjectId(userIdHex);
  await UserResidenceModel.updateMany(
    { userId, isCurrent: true },
    { $set: { isCurrent: false } },
  );
}

export async function getUserCurrentResidencePolitilog(
  userIdHex: string,
): Promise<PolitilogResidencePayload | null> {
  if (!mongoose.Types.ObjectId.isValid(userIdHex)) return null;
  await connectMongoose();
  const userId = new mongoose.Types.ObjectId(userIdHex);
  const row = await UserResidenceModel.findOne({ userId, isCurrent: true })
    .populate("state", "name")
    .populate("lga", "name")
    .lean();

  if (!row) return null;
  const { state: statePop, lga: lgaPop } = row as {
    state: unknown;
    lga: unknown;
  };
  if (
    !statePop ||
    typeof statePop !== "object" ||
    !("name" in statePop) ||
    !lgaPop ||
    typeof lgaPop !== "object" ||
    !("name" in lgaPop)
  ) {
    return null;
  }
  const dbStateName = String((statePop as { name: string }).name);
  const lgaName = String((lgaPop as { name: string }).name);
  const politilogState = politilogStateFromDbStateName(dbStateName);
  const match = findPolitilogLgaOption(politilogState, lgaName);
  return match
    ? { state: match.state, lga: match.lga, key: match.key }
    : null;
}
