const express    = require('express');
const router     = express.Router();
const Swimmer    = require('../models/Swimmer');
const SwimmerUser= require('../models/SwimmerUser');
const Attendance = require('../models/Attendance');
const { protect, requireBoss } = require('../middleware/auth');

/* ─────────────────────────────────────────────────────────────
   POST /api/swimmers/register
   ───────────────────────────────────────────────────────────── */
router.post('/register', protect, async (req, res) => {
  try {
    const {
      fullName, dob, phone,
      swamBefore, egyptStars, starsCount, waterFear,
      goal, sessionsCount, trainingSchedule, restDay,
      trainingDays: trainingDaysFromBody,
      trainingTime, trainerName, subscriptionExpiry,
    } = req.body;

    const sessCount = Number(sessionsCount);
    const scheduleMap = {
      sun_tue: [0,2], sun_thu: [0,4], tue_thu: [2,4],
      sat_tue_thu: [6,2,4], sat_mon_wed: [6,1,3],
    };

    let trainingDays  = [];
    let finalSchedule = trainingSchedule || null;

    if (Array.isArray(trainingDaysFromBody) && trainingDaysFromBody.length > 0) {
      trainingDays = trainingDaysFromBody.map(Number);
      finalSchedule = finalSchedule || 'custom';
    } else if (sessCount === 24 && restDay !== null && restDay !== undefined) {
      trainingDays  = [0,1,2,3,4,5,6].filter(d => d !== Number(restDay));
      finalSchedule = null;
    } else if (trainingSchedule && scheduleMap[trainingSchedule]) {
      trainingDays = scheduleMap[trainingSchedule];
    }

    const expected = { 8:2, 12:3, 24:6 }[sessCount];
    if (expected && trainingDays.length !== expected)
      return res.status(400).json({ success: false, message: `اشتراك ${sessCount} حصة يتطلب ${expected} أيام — أُرسل ${trainingDays.length}` });

    const swimmer = await Swimmer.create({
      fullName: fullName?.trim(), dob, phone: phone?.trim(),
      swamBefore: swamBefore || 'no',
      egyptStars: egyptStars || null, starsCount: starsCount || null, waterFear: waterFear || null,
      goal, sessionsCount: sessCount, trainingSchedule: finalSchedule,
      restDay: (restDay !== undefined && restDay !== '') ? Number(restDay) : null,
      trainingDays, trainingTime: trainingTime || null,
      trainerName: trainerName || null, subscriptionExpiry: subscriptionExpiry || null,
      trainer: req.trainer._id,
    });

    res.status(201).json({
      success: true, message: 'تم تسجيل السباح بنجاح',
      data: { swimmerId: swimmer._id, subscriptionId: swimmer.subscriptionId, fullName: swimmer.fullName, trainingDays: swimmer.trainingDays },
    });
  } catch (err) {
    if (err.name === 'ValidationError')
      return res.status(400).json({ success: false, message: Object.values(err.errors).map(e => e.message).join(' — ') });
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

/* ─────────────────────────────────────────────────────────────
   GET /api/swimmers/public/search
   ───────────────────────────────────────────────────────────── */
router.get('/public/search', async (req, res) => {
  try {
    const { search } = req.query;
    if (!search || search.trim().length < 2)
      return res.json({ success: true, total: 0, data: [] });

    const q = search.trim();
    const filter = {
      $or: [
        { fullName:       { $regex: q, $options: 'i' } },
        { subscriptionId: { $regex: q, $options: 'i' } },
      ]
    };

    const swimmers = await Swimmer.find(filter)
      .select('fullName subscriptionId trainingDays trainingTime dob level trainerName trainer sessionsCount sessionsAttended isActive subscriptionExpiry')
      .populate('trainer', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({ success: true, total: swimmers.length, data: swimmers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

/* ─────────────────────────────────────────────────────────────
   GET /api/swimmers
   ───────────────────────────────────────────────────────────── */
router.get('/', protect, async (req, res) => {
  try {
    const { search, page = 1, limit = 20, trainerId, sessionsCount, isActive, city } = req.query;
    const isBoss = req.trainer.role === 'boss';
    const filter = {};

    if (isBoss) {
      if (trainerId) filter.trainer = trainerId;
    } else {
      filter.trainer = req.trainer._id;
    }

    if (sessionsCount) filter.sessionsCount = Number(sessionsCount);
    if (isActive === 'true')  filter.isActive = true;
    if (isActive === 'false') filter.isActive = false;

    if (city) {
      const usersInCity = await SwimmerUser.find({ city }).select('swimmers');
      const swimmerIds  = usersInCity.flatMap(u => u.swimmers);
      filter._id = { $in: swimmerIds };
    }

    if (search) {
      filter.$or = [
        { fullName:       { $regex: search, $options: 'i' } },
        { subscriptionId: { $regex: search, $options: 'i' } },
        { phone:          { $regex: search, $options: 'i' } },
      ];
    }

    const total    = await Swimmer.countDocuments(filter);
    const swimmers = await Swimmer.find(filter)
      .populate('trainer', 'name username')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), data: swimmers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

/* ─────────────────────────────────────────────────────────────
   GET /api/swimmers/:subscriptionId
   ───────────────────────────────────────────────────────────── */
router.get('/:subscriptionId', protect, async (req, res) => {
  try {
    const isBoss  = req.trainer.role === 'boss';
    const filter  = { subscriptionId: req.params.subscriptionId.trim() };
    if (!isBoss) filter.trainer = req.trainer._id;

    const swimmer = await Swimmer.findOne(filter);
    if (!swimmer)
      return res.status(404).json({ success: false, message: isBoss ? 'المشترك غير موجود' : 'المشترك غير موجود أو لا ينتمي لحسابك' });

    const swimmerUser = await SwimmerUser.findOne({ swimmers: swimmer._id }).select('city username');

    const today    = new Date(); today.setHours(0,0,0,0);
    const sunday   = new Date(today); sunday.setDate(today.getDate() - today.getDay());
    const saturday = new Date(sunday); saturday.setDate(sunday.getDate() + 6); saturday.setHours(23,59,59,999);

    const weekAttendance = await Attendance.find({ swimmer: swimmer._id, date: { $gte: sunday, $lte: saturday } });
    const attendanceMap  = {};
    weekAttendance.forEach(rec => { if (rec.status === 'absent') attendanceMap[rec.dayIndex] = 'absent'; });

    res.json({
      success: true,
      data: {
        id:               swimmer.subscriptionId,
        subscriptionId:   swimmer.subscriptionId,
        name:             swimmer.fullName,
        fullName:         swimmer.fullName,
        dob:              swimmer.dob,
        age:              swimmer.age,
        phone:            swimmer.phone,
        goal:             swimmer.goal,
        trainingDays:     swimmer.trainingDays,
        trainingTime:     swimmer.trainingTime || null,
        sessionsCount:    swimmer.sessionsCount,
        sessionsAttended: swimmer.sessionsAttended,
        isActive:         swimmer.isActive,
        trainerName:      swimmer.trainerName || null,
        trainer:          swimmer.trainer,
        subscriptionStart:  swimmer.subscriptionStart,
        subscriptionExpiry: swimmer.subscriptionExpiry,
        starsCount:         swimmer.starsCount,
        swamBefore:         swimmer.swamBefore,
        level:           swimmer.level,
        levelNote:       swimmer.levelNote,
        levelUpdatedBy:  swimmer.levelUpdatedBy,
        levelUpdatedAt:  swimmer.levelUpdatedAt,
        rating:          swimmer.rating,
        ratingNote:      swimmer.ratingNote,
        ratingUpdatedBy: swimmer.ratingUpdatedBy,
        ratingUpdatedAt: swimmer.ratingUpdatedAt,
        city:            swimmerUser?.city || null,
        sessions: { total: swimmer.sessionsCount, attended: swimmer.sessionsAttended },
        weekAttendance: attendanceMap,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});


/* ─────────────────────────────────────────────────────────────
   PUT /api/swimmers/:subscriptionId
   ✨ تم إعادة كتابتها باستخدام findOne + save بدلاً من findOneAndUpdate
      علشان الـ schema validators (اللي بتعتمد على this.sessionsCount)
      تشتغل صح، وعلشان trainingDays تتحفظ فعلاً.
   ───────────────────────────────────────────────────────────── */
router.put('/:subscriptionId', protect, async (req, res) => {
  try {
    const isBoss = req.trainer.role === 'boss';
    const filter = { subscriptionId: req.params.subscriptionId };
    if (!isBoss) filter.trainer = req.trainer._id;

    /* 1) هات الـ document الحالي */
    const swimmer = await Swimmer.findOne(filter);
    if (!swimmer)
      return res.status(404).json({ success: false, message: 'السباح غير موجود أو لا ينتمي لحسابك' });

    const allowed = [
      'fullName','phone','trainingTime','goal','isActive',
      'subscriptionExpiry','trainerName',
      'level','levelNote','rating','ratingNote',
      'sessionsCount','trainingDays'
    ];

    /* 2) جهّز قيم نظيفة */
    const body = {};
    allowed.forEach(key => { if (req.body[key] !== undefined) body[key] = req.body[key]; });

    if (typeof body.fullName    === 'string') body.fullName    = body.fullName.trim();
    if (typeof body.phone       === 'string') body.phone       = body.phone.trim();
    if (typeof body.trainerName === 'string') body.trainerName = body.trainerName.trim() || null;
    if (body.goal               === '') body.goal               = null;
    if (body.trainingTime       === '') body.trainingTime       = null;
    if (body.subscriptionExpiry === '') body.subscriptionExpiry = null;
    if ('isActive' in body) body.isActive = (body.isActive === true || body.isActive === 'true');

    if (body.sessionsCount !== undefined) body.sessionsCount = Number(body.sessionsCount);
    if (body.trainingDays  !== undefined) {
      if (!Array.isArray(body.trainingDays))
        return res.status(400).json({ success: false, message: 'trainingDays لازم تكون مصفوفة' });
      body.trainingDays = [...new Set(
        body.trainingDays.map(d => Number(d)).filter(d => Number.isInteger(d) && d >= 0 && d <= 6)
      )];
    }

    /* 3) لو في تغيير في الجدول — تحقق من التطابق */
    if (body.sessionsCount !== undefined || body.trainingDays !== undefined) {
      const finalSess = body.sessionsCount !== undefined ? body.sessionsCount : swimmer.sessionsCount;
      const finalDays = body.trainingDays  !== undefined ? body.trainingDays  : swimmer.trainingDays;

      const expected = { 8:2, 12:3, 24:6 }[finalSess];
      if (!expected)
        return res.status(400).json({ success: false, message: `عدد الحصص ${finalSess} غير مدعوم` });
      if (!Array.isArray(finalDays) || finalDays.length !== expected)
        return res.status(400).json({
          success: false,
          message: `اشتراك ${finalSess} حصة يتطلب ${expected} أيام — تم تمرير ${Array.isArray(finalDays) ? finalDays.length : 0}`
        });

      /* ✨ ترتيب مهم: غيّر sessionsCount الأول قبل trainingDays
         علشان الـ validator في الـ schema (اللي بيقرأ this.sessionsCount) يشتغل صح */
      if (body.sessionsCount !== undefined) swimmer.sessionsCount = finalSess;
      swimmer.trainingDays = finalDays;
      swimmer.markModified('trainingDays');

      if (finalSess === 24) {
        const restDay = [0,1,2,3,4,5,6].find(d => !finalDays.includes(d));
        swimmer.restDay = restDay !== undefined ? restDay : null;
        swimmer.trainingSchedule = null;
      } else {
        swimmer.restDay = null;
        swimmer.trainingSchedule = 'custom';
      }
    }

    /* 4) باقي الحقول */
    const scheduleKeys = new Set(['sessionsCount','trainingDays']);
    Object.keys(body).forEach(k => {
      if (scheduleKeys.has(k)) return;
      swimmer[k] = body[k];
    });

    /* 5) audit للـ level والـ rating */
    if (body.level !== undefined) {
      swimmer.levelUpdatedBy = req.trainer.name;
      swimmer.levelUpdatedAt = new Date();
    }
    if (body.rating !== undefined) {
      swimmer.ratingUpdatedBy = req.trainer.name;
      swimmer.ratingUpdatedAt = new Date();
    }

    /* 6) احفظ — هيشغّل كل الـ validators صح */
    await swimmer.save();

    res.json({ success: true, message: 'تم تحديث البيانات', data: swimmer });
  } catch (err) {
    if (err.name === 'ValidationError')
      return res.status(400).json({
        success: false,
        message: Object.values(err.errors).map(e => e.message).join(' — ')
      });
    res.status(500).json({ success: false, message: 'خطأ في التحديث: ' + err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   DELETE /api/swimmers/:subscriptionId
   ───────────────────────────────────────────────────────────── */
router.delete('/:subscriptionId', protect, async (req, res) => {
  try {
    const isBoss = req.trainer.role === 'boss';
    const filter = { subscriptionId: req.params.subscriptionId };
    if (!isBoss) filter.trainer = req.trainer._id;

    const swimmer = await Swimmer.findOne(filter);
    if (!swimmer)
      return res.status(404).json({ success: false, message: 'السباح غير موجود أو لا ينتمي لحسابك' });

    const deleted = await Attendance.deleteMany({ swimmer: swimmer._id });
    await Swimmer.findByIdAndDelete(swimmer._id);

    res.json({ success: true, message: `تم حذف "${swimmer.fullName}" و ${deleted.deletedCount} سجل حضور` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الحذف: ' + err.message });
  }
});

module.exports = router;
