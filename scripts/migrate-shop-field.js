import { Store } from "../app/models/storemodal.js";
import connectDatabase from "../app/lib/dbconnect.js";

async function run() {
  try {
    await connectDatabase();
    console.log("Connected to database — running migration: set shop = shopName where missing");

    const filter = { $or: [{ shop: { $exists: false } }, { shop: null }, { shop: "" }] };

    const docs = await Store.find(filter).lean();
    console.log(`Found ${docs.length} documents missing 'shop'`);

    if (!docs.length) {
      console.log("Nothing to do. Migration complete.");
      process.exit(0);
    }

    let updated = 0;
    for (const doc of docs) {
      if (doc.shopName) {
        await Store.updateOne({ _id: doc._id }, { $set: { shop: doc.shopName } });
        updated++;
      } else {
        // No shopName available — skip, but log for manual inspection
        console.warn(`Skipping doc ${doc._id} — no shopName present`);
      }
    }

    console.log(`Migration complete. Updated ${updated} documents.`);
    process.exit(0);
  } catch (e) {
    console.error("Migration failed:", e);
    process.exit(1);
  }
}

run();
