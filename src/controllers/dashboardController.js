const Match = require('../models/Match');
const News = require('../models/News');
const Player = require('../models/Player');
const MatchStats = require('../models/MatchStats');
const ContactRequest = require('../models/ContactRequest');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const unreadMessages = await ContactRequest.countDocuments({ status: 'Pendiente' });
    const totalMatches = await Match.countDocuments();
    const totalNews = await News.countDocuments({ published: true });

    // Alertas disciplinarias: agrupar amarillas y rojas por jugador
    const stats = await MatchStats.aggregate([
      {
        $group: {
          _id: '$player',
          totalYellowCards: { $sum: '$yellowCards' },
          totalRedCards: { $sum: '$redCards' }
        }
      },
      {
        $match: {
          $or: [
            { totalYellowCards: { $gte: 1 } },
            { totalRedCards: { $gte: 1 } }
          ]
        }
      },
      { $sort: { totalRedCards: -1, totalYellowCards: -1 } },
      { $limit: 10 }
    ]);

    await Player.populate(stats, { path: '_id', select: 'firstName lastName category photoUrl' });

    const formattedAlerts = stats.map(s => ({
      player: s._id,
      yellowCards: s.totalYellowCards,
      redCards: s.totalRedCards
    }));

    res.status(200).json({
      success: true,
      data: {
        unreadMessages,
        totalMatches,
        totalNews,
        alerts: formattedAlerts
      }
    });
  } catch (error) {
    next(error);
  }
};
