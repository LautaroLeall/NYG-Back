require('dotenv').config();
const mongoose = require('mongoose');
const PointsRule = require('./models/PointsRule');
const TiebreakRule = require('./models/TiebreakRule');

const connectDB = require('./config/db');

const seedRules = async () => {
  try {
    await connectDB();

    // 1. Limpiar las reglas actuales
    await PointsRule.deleteMany();
    await TiebreakRule.deleteMany();
    console.log('Reglas anteriores eliminadas.');

    // 2. Crear Reglas de Puntuación (PointsRule)
    const pointsRules = await PointsRule.insertMany([
      {
        name: 'Torneo URT (Regional / Tucumano)',
        win: 4,
        draw: 2,
        loss: 0,
        bonusOffensiveType: 'DIFFERENTIAL', // 3 tries más que el rival
        bonusOffensivePoints: 1,
        bonusDefensiveType: 'MARGIN', // Perder por 7 o menos
        bonusDefensiveMargin: 7,
        bonusDefensivePoints: 1,
        walkoverPoints: -2
      },
      {
        name: 'Torneo UAR (Interior A y B)',
        win: 4,
        draw: 2,
        loss: 0,
        bonusOffensiveType: 'ABSOLUTE', // 4 tries o más
        bonusOffensivePoints: 1,
        bonusDefensiveType: 'MARGIN',
        bonusDefensiveMargin: 7,
        bonusDefensivePoints: 1,
        walkoverPoints: -2
      }
    ]);

    console.log('PointsRules insertadas:', pointsRules.map(r => r.name).join(', '));

    // 3. Crear Reglas de Desempate (TiebreakRule)
    const tiebreakRules = await TiebreakRule.insertMany([
      {
        name: 'Desempate URT Estandar',
        criteria: [
          'HEAD_TO_HEAD_POINTS', // 1. Resultados partidos disputados entre sí
          'POINTS_DIFFERENCE',   // 2. Mayor dif de tantos entre sí (y luego general)
          'HEAD_TO_HEAD_TRIES',  // 3. Mayor número de tries a favor entre sí
          'TOTAL_POINTS_SCORED', // 4. Mayor cantidad tantos a favor torneo
          'TOTAL_TRIES_SCORED',  // 5. Mayor cantidad tries a favor torneo
          'CARDS_RECORD'         // 6. Tarjetas rojas y amarillas
        ]
      },
      {
        name: 'Desempate UAR Estandar',
        criteria: [
          'HEAD_TO_HEAD_POINTS', // 1. Resultados de partidos entre sí
          'POINTS_DIFFERENCE',   // 2. Mayor dif de tantos
          'TOTAL_TRIES_SCORED',  // 3. Mayor número de tries a favor
          'TOTAL_POINTS_SCORED'  // 4. Mayor cantidad de tantos a favor
        ]
      }
    ]);

    console.log('TiebreakRules insertadas:', tiebreakRules.map(r => r.name).join(', '));

    console.log('✅ Seed completado exitosamente.');
    process.exit();
  } catch (error) {
    console.error('❌ Error en el Seed:', error);
    process.exit(1);
  }
};

seedRules();
