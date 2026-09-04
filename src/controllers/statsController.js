const MatchStats = require('../models/MatchStats');
const Player = require('../models/Player');
const Match = require('../models/Match');


// @desc    Cargar estadísticas de un partido completo (bulk insert/update)
// @route   POST /api/matches/:id/stats
// @access  Private/Admin
exports.saveMatchStats = async (req, res, next) => {
  try {
    const matchId = req.params.id;
    const { stats } = req.body; // stats es un array de objetos

    if (!Array.isArray(stats)) {
      return res.status(400).json({ success: false, error: 'El cuerpo de la petición debe incluir un array "stats".' });
    }

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ success: false, error: 'Partido no encontrado.' });
    }

    const operations = stats.map(stat => {
      return {
        updateOne: {
          filter: { match: matchId, player: stat.player },
          update: {
            $set: {
              match: matchId,
              player: stat.player,
              isStarter: stat.isStarter || false,
              minutesPlayed: stat.minutesPlayed || 0,
              tries: stat.tries || 0,
              conversions: stat.conversions || 0,
              penalties: stat.penalties || 0,
              drops: stat.drops || 0,
              yellowCards: stat.yellowCards || 0,
              redCards: stat.redCards || 0,
            }
          },
          upsert: true
        }
      };
    });

    if (operations.length > 0) {
      await MatchStats.bulkWrite(operations);
    }

    res.status(200).json({
      success: true,
      message: 'Estadísticas del partido guardadas con éxito.',
      count: operations.length
    });
  } catch (error) {
    next(error);
  }
};


// @desc    BE-063: Obtener rankings y estadísticas acumuladas
// @route   GET /api/stats/rankings
// @access  Public
exports.getRankings = async (req, res, next) => {
  try {
    const { tipo = 'goleadores', limit = 25 } = req.query;

    // Aquí usamos el aggregation framework de MongoDB (BE-062)
    // Agrupamos por jugador y sumamos los campos correspondientes.

    // Primero, hacemos el $group base que calcula las sumas.
    const groupStage = {
      $group: {
        _id: '$player',
        totalTries: { $sum: '$tries' },
        totalConversions: { $sum: '$conversions' },
        totalPenalties: { $sum: '$penalties' },
        totalDrops: { $sum: '$drops' },
        totalYellowCards: { $sum: '$yellowCards' },
        totalMatches: { $sum: 1 },
        totalMinutes: { $sum: '$minutesPlayed' },
        points: {
          $sum: {
            $add: [
              { $multiply: ['$tries', 5] },
              { $multiply: ['$conversions', 2] },
              { $multiply: ['$penalties', 3] },
              { $multiply: ['$drops', 3] }
            ]
          }
        }
      }
    };

    let sortField = 'points';

    switch (tipo) {
      case 'anotadores': sortField = 'totalTries'; break;
      case 'amarillas': sortField = 'totalYellowCards'; break;
      case 'partidos': sortField = 'totalMatches'; break;
      case 'minutos': sortField = 'totalMinutes'; break;
      case 'goleadores':
      default: sortField = 'points'; break;
    }

    const sortStage = { $sort: { [sortField]: -1, _id: 1 } }; // Desempate por id

    const limitStage = { $limit: parseInt(limit) };

    const lookupStage = {
      $lookup: {
        from: 'players', // nombre de la colección en la base de datos
        localField: '_id',
        foreignField: '_id',
        as: 'playerInfo'
      }
    };

    const unwindStage = {
      $unwind: '$playerInfo'
    };

    const projectStage = {
      $project: {
        _id: 1,
        'playerInfo.name': 1,
        'playerInfo.position': 1,
        'playerInfo.imageUrl': 1,
        totalTries: 1,
        totalConversions: 1,
        totalPenalties: 1,
        totalDrops: 1,
        totalYellowCards: 1,
        totalMatches: 1,
        totalMinutes: 1,
        points: 1,
        // Proyectamos el valor principal basado en el tipo para facilidad del front
        value: `$${sortField}`
      }
    };

    const pipeline = [
      groupStage,
      sortStage,
      limitStage,
      lookupStage,
      unwindStage,
      projectStage
    ];

    const results = await MatchStats.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: results
    });

  } catch (error) {
    next(error);
  }
};
