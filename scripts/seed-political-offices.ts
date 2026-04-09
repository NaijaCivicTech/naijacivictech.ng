/**
 * Upsert political office definitions from the PolitiLog catalog into MongoDB.
 *
 *   pnpm run db:seed:political-offices
 *   pnpm run db:seed:political-offices -- --dry-run
 */
import { config as loadEnv } from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import mongoose, { type AnyBulkWriteOperation } from "mongoose";
import { POLITILOG_POLITICAL_ROLE_CATALOG } from "../features/politilog/lib/politilog-political-role-catalog";
import { connectMongoose } from "../lib/mongoose";
import { PoliticalOfficeModel } from "../lib/models/PoliticalOffice";

const __dirname = dirname(fileURLToPath(import.meta.url));

loadEnv({ path: join(__dirname, "../.env.development") });
loadEnv({ path: join(__dirname, "../.env") });
loadEnv({ path: join(__dirname, "../.env.local") });

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const n = POLITILOG_POLITICAL_ROLE_CATALOG.length;
  console.log(`Political offices seed: ${n} rows (from PolitiLog catalog)`);

  if (dryRun) {
    for (const row of POLITILOG_POLITICAL_ROLE_CATALOG) {
      console.log(
        `  - ${row.id} (${row.tier}/${row.branch}) ${row.label}`,
      );
    }
    console.log("Dry run — no database writes.");
    return;
  }

  await connectMongoose();
  try {
    const ops: AnyBulkWriteOperation[] = POLITILOG_POLITICAL_ROLE_CATALOG.map(
      (row) => ({
        updateOne: {
          filter: { slug: row.id },
          update: {
            $set: {
              slug: row.id,
              label: row.label,
              defaultHeadline: row.defaultHeadline,
              tier: row.tier,
              branch: row.branch,
              body: row.body,
              seatType: row.seatType,
              jurisdictionScope: row.jurisdictionScope,
              sortOrder: row.sortOrder,
            },
          },
          upsert: true,
        },
      }),
    );

    await PoliticalOfficeModel.bulkWrite(ops);
    console.log(`Upserted ${n} political offices.`);
    console.log("Done.");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
