// Redaktionelle Orientierungswerte (Ansatz B), keine empirischen Geschichtsanteile.
export const analysisConfig = {
  disciplineTolerance: 3,
  topicRelativeTolerance: 0.30,
  topicMinimumTolerance: 3,
  smallSampleThreshold: 100,
  maxTimeBins: 80,
  disciplines: { politics_society:22, technology_economy:20, art_culture:18, science:15, philosophy_religion:13, environment_nature:12 },
  subdisciplines: { political_history:45, social_history:55, energy:18, mechanical_engineering:12, communication:18, transport:14, production:20, trade:18, architecture:20, literature:30, painting:18, music:22, design:10, physics:20, biology:20, chemistry:15, astronomy:15, medicine:30, philosophy:45, theology:55, climate_history:50, ecology:50 },
  topics: { energy:13, mobility:10, production:13, industrialisation:10, urbanisation:10, work:15, trade:14, communication:14, knowledge:24, religion:16, state:20, rights:16, war:12, health:15, nature:15, climate:10, resources:15, media:12, technology:17, science:16, education:17 },
};
