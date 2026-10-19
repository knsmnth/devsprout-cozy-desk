// Cozy Leveling & Progression System for DevSprout

export const LEVEL_TIERS = [
  { level: 1, title: "Cozy Sprout", icon: "🌱", minXp: 0, maxXp: 100 },
  { level: 2, title: "Curious Seedling", icon: "🌿", minXp: 100, maxXp: 250 },
  { level: 3, title: "Green Bud", icon: "🍃", minXp: 250, maxXp: 450 },
  { level: 4, title: "Blooming Flora", icon: "🌸", minXp: 450, maxXp: 700 },
  { level: 5, title: "Garden Tree", icon: "🌳", minXp: 700, maxXp: 1000 },
  { level: 6, title: "Ancient Bonsai", icon: "🪴", minXp: 1000, maxXp: 1400 },
  { level: 7, title: "Enchanted Canopy", icon: "✨", minXp: 1400, maxXp: 1900 },
  { level: 8, title: "Master Cultivator", icon: "🌾", minXp: 1900, maxXp: 2500 },
  { level: 9, title: "Garden Sage", icon: "🍵", minXp: 2500, maxXp: 3200 },
  { level: 10, title: "Mythic Forest Spirit", icon: "👑", minXp: 3200, maxXp: Infinity },
];

export const XP_REWARDS = {
  HARVEST_TASK: 20,
  FOCUS_SESSION: 15,
  SIP_WATER: 5,
  LEARNING_NOTE: 10,
  STAMP: 2,
};

export function calculateLevel(xp) {
  const safeXp = Math.max(0, Math.floor(xp || 0));
  let tier = LEVEL_TIERS[0];

  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (safeXp >= LEVEL_TIERS[i].minXp) {
      tier = LEVEL_TIERS[i];
      break;
    }
  }

  const nextTier = LEVEL_TIERS.find((t) => t.level === tier.level + 1) || null;
  const currentLevelXp = safeXp - tier.minXp;
  const neededForNext = nextTier ? nextTier.minXp - tier.minXp : 100;
  const progressPercent = nextTier
    ? Math.min(100, Math.round((currentLevelXp / neededForNext) * 100))
    : 100;

  return {
    level: tier.level,
    title: tier.title,
    icon: tier.icon,
    totalXp: safeXp,
    currentLevelXp,
    neededForNext,
    progressPercent,
    nextTier,
  };
}
