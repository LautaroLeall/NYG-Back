const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');

// @desc    Motor de cálculo de tabla de posiciones
// @route   GET /api/standings/:tournamentId
// @access  Public
exports.getStandings = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;

    // Obtener el torneo con sus reglas
    const tournament = await Tournament.findById(tournamentId)
      .populate('pointsRule')
      .populate('tiebreakRule')
      .populate('teams');

    if (!tournament) {
      return res.status(404).json({ success: false, error: 'Torneo no encontrado' });
    }

    const { pointsRule, tiebreakRule } = tournament;

    // Obtener todos los partidos finalizados de este torneo
    const matches = await Match.find({
      tournament: tournamentId,
      status: 'Finalizado'
    }).populate('homeTeam awayTeam');

    // Inicializar la tabla (diccionario por ID de equipo)
    const standingsMap = {};

    // Preparar a todos los equipos participantes inscritos
    if (tournament.teams && tournament.teams.length > 0) {
      tournament.teams.forEach(t => {
        standingsMap[t._id.toString()] = createEmptyTeamStat(t);
      });
    }

    // Calcular estadísticas base para cada partido
    matches.forEach(match => {
      const homeId = match.homeTeam._id.toString();
      const awayId = match.awayTeam._id.toString();

      // Si por alguna razón el equipo no está en el mapa, lo inicializamos
      if (!standingsMap[homeId]) standingsMap[homeId] = createEmptyTeamStat(match.homeTeam);
      if (!standingsMap[awayId]) standingsMap[awayId] = createEmptyTeamStat(match.awayTeam);

      const homeStats = standingsMap[homeId];
      const awayStats = standingsMap[awayId];

      homeStats.played++;
      awayStats.played++;

      homeStats.pf += match.homeScore || 0;
      homeStats.pa += match.awayScore || 0;
      homeStats.triesFor += match.homeTries || 0;
      homeStats.triesAgainst += match.awayTries || 0;

      awayStats.pf += match.awayScore || 0;
      awayStats.pa += match.homeScore || 0;
      awayStats.triesFor += match.awayTries || 0;
      awayStats.triesAgainst += match.homeTries || 0;

      // Ganador, Perdedor, Empate
      if (match.homeScore > match.awayScore) {
        homeStats.won++;
        awayStats.lost++;
        homeStats.pts += pointsRule.win;
        awayStats.pts += pointsRule.loss;
      } else if (match.homeScore < match.awayScore) {
        awayStats.won++;
        homeStats.lost++;
        awayStats.pts += pointsRule.win;
        homeStats.pts += pointsRule.loss;
      } else {
        homeStats.drawn++;
        awayStats.drawn++;
        homeStats.pts += pointsRule.draw;
        awayStats.pts += pointsRule.draw;
      }

      // Bonus Ofensivo
      if (pointsRule.bonusOffensiveType === 'DIFFERENTIAL') {
        if ((match.homeTries - match.awayTries) >= 3) {
          homeStats.bo++;
          homeStats.pts += pointsRule.bonusOffensivePoints;
        }
        if ((match.awayTries - match.homeTries) >= 3) {
          awayStats.bo++;
          awayStats.pts += pointsRule.bonusOffensivePoints;
        }
      } else if (pointsRule.bonusOffensiveType === 'ABSOLUTE') {
        if (match.homeTries >= 4) {
          homeStats.bo++;
          homeStats.pts += pointsRule.bonusOffensivePoints;
        }
        if (match.awayTries >= 4) {
          awayStats.bo++;
          awayStats.pts += pointsRule.bonusOffensivePoints;
        }
      }

      // Bonus Defensivo
      if (pointsRule.bonusDefensiveType === 'MARGIN') {
        if (match.homeScore < match.awayScore && (match.awayScore - match.homeScore) <= pointsRule.bonusDefensiveMargin) {
          homeStats.bd++;
          homeStats.pts += pointsRule.bonusDefensivePoints;
        }
        if (match.awayScore < match.homeScore && (match.homeScore - match.awayScore) <= pointsRule.bonusDefensiveMargin) {
          awayStats.bd++;
          awayStats.pts += pointsRule.bonusDefensivePoints;
        }
      }
    });

    // Calcular diferencias
    let standingsArray = Object.values(standingsMap).map(team => {
      team.diff = team.pf - team.pa;
      return team;
    });

    // Ordenamiento y Tiebreak (simplificado según la regla)
    standingsArray.sort((a, b) => {
      // 1. Siempre por puntos primero
      if (b.pts !== a.pts) return b.pts - a.pts;

      // 2. Si hay empate y hay reglas de desempate, iteramos (acá implementamos un subconjunto común)
      if (tiebreakRule && tiebreakRule.criteria) {
        for (let crit of tiebreakRule.criteria) {
          if (crit === 'TOTAL_WINS' && b.won !== a.won) return b.won - a.won;
          if (crit === 'POINTS_DIFFERENCE' && b.diff !== a.diff) return b.diff - a.diff;
          if (crit === 'TRIES_DIFFERENCE' && (b.triesFor - b.triesAgainst) !== (a.triesFor - a.triesAgainst)) {
            return (b.triesFor - b.triesAgainst) - (a.triesFor - a.triesAgainst);
          }
          if (crit === 'TOTAL_TRIES_SCORED' && b.triesFor !== a.triesFor) return b.triesFor - a.triesFor;
          if (crit === 'TOTAL_POINTS_SCORED' && b.pf !== a.pf) return b.pf - a.pf;
        }
      }

      // Fallback a diferencia de puntos
      return b.diff - a.diff;
    });

    // Asignar posicin final
    standingsArray.forEach((team, index) => {
      team.pos = index + 1;
    });

    res.status(200).json({
      success: true,
      tournament: {
        id: tournament._id,
        name: tournament.name,
      },
      data: standingsArray
    });

  } catch (error) {
    next(error);
  }
};

function createEmptyTeamStat(teamObj) {
  return {
    teamId: teamObj._id,
    teamName: teamObj.name,
    shieldUrl: teamObj.shieldUrl || null,
    pos: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    pf: 0,
    pa: 0,
    diff: 0,
    triesFor: 0,
    triesAgainst: 0,
    bo: 0,
    bd: 0,
    pts: 0
  };
}
