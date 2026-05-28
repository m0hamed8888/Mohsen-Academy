const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { protect, requireBoss } = require("../middleware/auth");

// ✅ Boss Only - Download full DB backup as JSON
router.get("/download", protect, requireBoss, async (req, res) => {
  try {
    const db = mongoose.connection.db;

    // جيب أسماء كل الـ collections
    const collections = await db.listCollections().toArray();

    const backup = {
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: req.trainer?.name || "Boss",
        dbName: db.databaseName,
        totalCollections: collections.length,
      },
      data: {},
    };

    // جيب البيانات من كل collection
    for (const col of collections) {
      const name = col.name;
      const documents = await db.collection(name).find({}).toArray();
      backup.data[name] = documents;
    }

    // ابعت الملف كـ JSON download
    const filename = `backup_${db.databaseName}_${Date.now()}.json`;
    const jsonContent = JSON.stringify(backup, null, 2);

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", Buffer.byteLength(jsonContent, "utf8"));

    return res.status(200).send(jsonContent);
  } catch (err) {
    console.error("❌ Backup error:", err);
    return res.status(500).json({ message: "فشل إنشاء الـ backup", error: err.message });
  }
});

// ✅ Boss Only - معاينة معلومات الـ backup بدون تنزيل
router.get("/info", protect, requireBoss, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    const info = await Promise.all(
      collections.map(async (col) => {
        const count = await db.collection(col.name).countDocuments();
        return { collection: col.name, documents: count };
      })
    );

    return res.status(200).json({
      dbName: db.databaseName,
      totalCollections: collections.length,
      collections: info,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ message: "فشل جلب معلومات الـ backup", error: err.message });
  }
});

module.exports = router;
