const mongoose = require('mongoose');

const pointsRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'URT Estandar'
  },
  win: { type: Number, default: 4 },
  draw: { type: Number, default: 2 },
  loss: { type: Number, default: 0 },
  bonusOffensiveType: {
    type: String,
    enum: ['ABSOLUTE', 'DIFFERENTIAL', 'NONE'],
    default: 'DIFFERENTIAL',
    description: 'ABSOLUTE: 4 tries or more. DIFFERENTIAL: 3 tries more than opponent.'
  },
  bonusOffensivePoints: { type: Number, default: 1 },
  bonusDefensiveType: {
    type: String,
    enum: ['MARGIN', 'NONE'],
    default: 'MARGIN',
    description: 'MARGIN: losing by 7 or less.'
  },
  bonusDefensiveMargin: { type: Number, default: 7 },
  bonusDefensivePoints: { type: Number, default: 1 },
  walkoverPoints: { type: Number, default: -2 }, // Points deducted for not showing up
}, {
  timestamps: true
});

module.exports = mongoose.model('PointsRule', pointsRuleSchema);
