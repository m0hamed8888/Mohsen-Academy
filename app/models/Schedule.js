const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    trainer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Trainer',
      required: true,
    },
    year:  { type: Number, required: true },          // مثال: 2025
    month: { type: Number, required: true, min: 1, max: 12 }, // 1=يناير ... 12=ديسمبر
    groups: {
      type:    Array,
      default: [],
    },
    blocks: {
      type:    mongoose.Schema.Types.Mixed, // مصفوفة كائنات الحظر
      default: null,
    },
  },
  { timestamps: true }
);

// كل كابتن → شهر واحد → سجل واحد فقط
scheduleSchema.index({ trainer: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
