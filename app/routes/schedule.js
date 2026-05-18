const express  = require('express');
const router   = express.Router();
const Schedule = require('../models/schedule');
const { protect } = require('../middleware/auth');

// جميع المسارات محمية — لازم token صالح
router.use(protect);

/* ────────────────────────────────────────────────────────────
   GET /api/schedule/months
   قائمة الشهور التي بها بيانات للكابتن الحالي
   ──────────────────────────────────────────────────────────── */
router.get('/months', async (req, res) => {
  try {
    const list = await Schedule.find(
      { trainer: req.trainer._id },
      'year month groups'
    ).sort({ year: -1, month: -1 });

    res.json({
      success: true,
      data: list.map(s => ({
        y:     s.year,
        m:     s.month,
        count: Array.isArray(s.groups) ? s.groups.length : 0,
      })),
    });
  } catch (err) {
    console.error('[Schedule /months]', err);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

/* ────────────────────────────────────────────────────────────
   GET /api/schedule/:year/:month
   جلب بيانات شهر معين (مجموعات + أوقات محظورة)
   يرجع { success, data: null } لو الشهر ملوش بيانات بعد
   ──────────────────────────────────────────────────────────── */
router.get('/:year/:month', async (req, res) => {
  try {
    const year  = parseInt(req.params.year,  10);
    const month = parseInt(req.params.month, 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12)
      return res.status(400).json({ success: false, message: 'بيانات الشهر/السنة غير صحيحة' });

    const doc = await Schedule.findOne({ trainer: req.trainer._id, year, month });

    if (!doc)
      return res.json({ success: true, data: null }); // لا بيانات بعد

    res.json({
      success: true,
      data: {
        groups: doc.groups || [],
        blocks: doc.blocks,
      },
    });
  } catch (err) {
    console.error('[Schedule GET /:year/:month]', err);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

/* ────────────────────────────────────────────────────────────
   PUT /api/schedule/:year/:month
   حفظ أو تحديث بيانات شهر (upsert)
   Body: { groups: [...], blocks: [...] }
   ──────────────────────────────────────────────────────────── */
router.put('/:year/:month', async (req, res) => {
  try {
    const year  = parseInt(req.params.year,  10);
    const month = parseInt(req.params.month, 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12)
      return res.status(400).json({ success: false, message: 'بيانات الشهر/السنة غير صحيحة' });

    const { groups, blocks } = req.body;

    const doc = await Schedule.findOneAndUpdate(
      { trainer: req.trainer._id, year, month },
      {
        $set: {
          groups: Array.isArray(groups) ? groups : [],
          blocks: blocks ?? null,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      data: {
        groups: doc.groups,
        blocks: doc.blocks,
      },
    });
  } catch (err) {
    console.error('[Schedule PUT /:year/:month]', err);
    res.status(500).json({ success: false, message: 'خطأ في الحفظ: ' + err.message });
  }
});

/* ────────────────────────────────────────────────────────────
   DELETE /api/schedule/:year/:month
   حذف بيانات شهر كامل (نادراً ما يُستخدم لكن مفيد)
   ──────────────────────────────────────────────────────────── */
router.delete('/:year/:month', async (req, res) => {
  try {
    const year  = parseInt(req.params.year,  10);
    const month = parseInt(req.params.month, 10);

    await Schedule.deleteOne({ trainer: req.trainer._id, year, month });
    res.json({ success: true, message: 'تم حذف بيانات الشهر' });
  } catch (err) {
    console.error('[Schedule DELETE /:year/:month]', err);
    res.status(500).json({ success: false, message: 'خطأ في الحذف' });
  }
});

module.exports = router;
