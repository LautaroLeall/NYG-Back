const MatchStats = require('../models/MatchStats');
const Player = require('../models/Player');
const Match = require('../models/Match');

// @desc    Obtener estadísticas de un partido específico
// @route   GET /api/matches/:id/stats
// @access  Private/Admin
exports.getMatchStatsByMatchId = async (req, res, next) => {
  try {
    const matchId = req.params.id;

    const stats = await MatchStats.find({ match: matchId })
      .populate('player', 'name position category isActive imageUrl');

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

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
    const { tipo = 'goleadores', limit = 25, tournamentId } = req.query;

    const pipeline = [];

    // Si pasaron un tournamentId, necesitamos filtrar los MatchStats por torneo
    if (tournamentId && tournamentId !== 'Todos') {
      const mongoose = require('mongoose');
      pipeline.push({
        $lookup: {
          from: 'matches',
          localField: 'match',
          foreignField: '_id',
          as: 'matchInfo'
        }
      });
      pipeline.push({
        $unwind: '$matchInfo'
      });
      pipeline.push({
        $match: {
          'matchInfo.tournament': new mongoose.Types.ObjectId(tournamentId)
        }
      });
    }

    // Aquí usamos el aggregation framework de MongoDB (BE-062)
    // Agrupamos por jugador y sumamos los campos correspondientes.

    // Primero, hacemos el $group base que calcula las sumas.
    pipeline.push({
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
    });

    let sortField = 'points';

    switch (tipo) {
      case 'anotadores': sortField = 'totalTries'; break;
      case 'amarillas': sortField = 'totalYellowCards'; break;
      case 'partidos': sortField = 'totalMatches'; break;
      case 'minutos': sortField = 'totalMinutes'; break;
      case 'goleadores':
      default: sortField = 'points'; break;
    }

    pipeline.push({ $sort: { [sortField]: -1, _id: 1 } }); // Desempate por id
    pipeline.push({ $limit: parseInt(limit) });

    pipeline.push({
      $lookup: {
        from: 'players', // nombre de la colección en la base de datos
        localField: '_id',
        foreignField: '_id',
        as: 'playerInfo'
      }
    });

    pipeline.push({
      $unwind: '$playerInfo'
    });

    pipeline.push({
      $project: {
        _id: 1,
        'playerInfo._id': 1,
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
    });

    const results = await MatchStats.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: results
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obtener alertas disciplinarias
// @route   GET /api/stats/alerts
// @access  Private/Admin
exports.getAlerts = async (req, res, next) => {
  try {
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
      { $sort: { totalRedCards: -1, totalYellowCards: -1 } }
    ]);

    await Player.populate(stats, { path: '_id', select: 'name category imageUrl' });

    const formattedAlerts = stats.map(s => ({
      player: s._id,
      yellowCards: s.totalYellowCards,
      redCards: s.totalRedCards
    }));

    res.status(200).json({
      success: true,
      data: formattedAlerts
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Carga unificada de Plantel y Línea de Tiempo (Autocalcula MatchStats)
// @route   POST /api/matches/:id/unified-stats
// @access  Private/Admin
exports.saveUnifiedStats = async (req, res, next) => {
  try {
    const matchId = req.params.id;
    const { roster, events } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ success: false, error: 'Partido no encontrado.' });
    }

    // 1. Update Match with roster and events
    match.roster = roster || [];
    match.events = events || [];
    await match.save();

    // 2. Auto-calculate MatchStats
    // Delete stats for players no longer in the roster
    const rosterPlayerIds = match.roster.map(r => r.player.toString());
    await MatchStats.deleteMany({ match: matchId, player: { $nin: rosterPlayerIds } });

    const operations = [];

    for (const r of match.roster) {
      const playerId = r.player.toString();
      const isStarter = r.isStarter;

      let tries = 0;
      let conversions = 0;
      let penalties = 0;
      let drops = 0;
      let yellowCards = 0;
      let redCards = 0;
      let minuteIn = isStarter ? 0 : null;
      let minuteOut = 80; // Standard rugby match

      // Process events for this player
      for (const ev of match.events) {
        // Did they score or get a card?
        if (ev.team === 'NYG' && ev.player && ev.player.toString() === playerId) {
          if (ev.type === 'Try') tries++;
          if (ev.type === 'Conversión') conversions++;
          if (ev.type === 'Penal') penalties++;
          if (ev.type === 'Drop') drops++;
          if (ev.type === 'Tarjeta Amarilla') yellowCards++;
          if (ev.type === 'Tarjeta Roja') {
            redCards++;
            if (minuteOut === 80 || ev.minute < minuteOut) minuteOut = ev.minute;
          }
          // Entering the field
          if (ev.type === 'Cambio') {
            if (minuteIn === null || ev.minute < minuteIn) minuteIn = ev.minute;
          }
        }
        // Leaving the field
        if (ev.team === 'NYG' && ev.type === 'Cambio' && ev.playerOut && ev.playerOut.toString() === playerId) {
          if (minuteOut === 80 || ev.minute < minuteOut) minuteOut = ev.minute;
        }
      }

      let minutesPlayed = 0;
      if (minuteIn !== null && minuteIn <= minuteOut) {
        minutesPlayed = minuteOut - minuteIn;
      }

      operations.push({
        updateOne: {
          filter: { match: matchId, player: playerId },
          update: {
            $set: {
              match: matchId,
              player: playerId,
              isStarter: isStarter,
              minutesPlayed: minutesPlayed,
              tries: tries,
              conversions: conversions,
              penalties: penalties,
              drops: drops,
              yellowCards: yellowCards,
              redCards: redCards,
            }
          },
          upsert: true
        }
      });
    }

    if (operations.length > 0) {
      await MatchStats.bulkWrite(operations);
    }

    res.status(200).json({
      success: true,
      message: 'Ficha técnica guardada y estadísticas calculadas automáticamente.',
    });
  } catch (error) {
    next(error);
  }
};
