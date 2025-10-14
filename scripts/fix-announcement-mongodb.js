// scripts/fix-announcements-mongodb.js
import { MongoClient } from "mongodb";

async function fixAnnouncements() {
  const uri = process.env.DATABASE_URL;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db();
    const announcements = database.collection("Announcement");

    // Find all announcements with null or invalid createdAt
    const cursor = announcements.find({
      $or: [
        { createdAt: null },
        { createdAt: { $exists: false } },
        { createdAt: { $type: "string" } }, // If there are string dates
        { createdAt: { $lt: new Date("2000-01-01") } }, // Very old/invalid dates
      ],
    });

    let fixedCount = 0;

    while (await cursor.hasNext()) {
      const announcement = await cursor.next();

      let newCreatedAt;

      // Use the date field if it exists and is valid
      if (announcement.date && announcement.date instanceof Date) {
        newCreatedAt = announcement.date;
      } else {
        // Otherwise use current date
        newCreatedAt = new Date();
      }

      // Update the document
      await announcements.updateOne(
        { _id: announcement._id },
        { $set: { createdAt: newCreatedAt } }
      );

      fixedCount++;
      console.log(`Fixed announcement: ${announcement._id}`);
    }

    console.log(`✅ Successfully fixed ${fixedCount} announcements`);

    // Verify the fix
    const remainingNullCount = await announcements.countDocuments({
      createdAt: null,
    });

    console.log(
      `Remaining announcements with null createdAt: ${remainingNullCount}`
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

fixAnnouncements();
