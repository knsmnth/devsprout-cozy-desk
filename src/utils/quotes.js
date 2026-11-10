/**
 * Curated Cozy Developer Affirmations & Daily Intentions
 * Mindful, encouraging quotes rotated daily and shuffleable anytime.
 */

export const COZY_DEVELOPER_QUOTES = [
  "Keep code clean, sip matcha often, and don't worry if a bug takes time. We nurture our garden one seed at a time.",
  "Small commits lead to great journeys. Celebrate each test that passes today.",
  "Breathe in clarity, breathe out self-doubt. The best code is written with a calm mind.",
  "Pause, hydrate, and stretch your wings. Your well-being is the foundation of your craft.",
  "A gentle pace moves mountains. Trust the natural rhythm of your creative flow.",
  "Leave the code a little cozier than you found it. Kindness in comments, warmth in architecture.",
  "Not all progress is counted in lines of code; thoughtful refactoring is an act of care.",
  "Even the tallest oak was once a sprout that held its ground. Grow steadily today.",
  "Debugging is simply teaching the computer what you already know in your heart.",
  "Warm tea, steady hands, gentle thoughts. You are doing wonderful work today.",
  "Every error message is a gentle whisper pointing toward a cleaner solution.",
  "Celebrate the quiet wins: clean diffs, readable functions, and peaceful focus sessions.",
  "Don't rush the blossom. Great ideas need time to steep, like a comforting cup of tea.",
  "Write code for humans first and machines second. Clarity is your greatest kindness.",
  "Rest is not a reward for finished code; it is a vital part of the creative process.",
  "One mindful task at a time. Multi-tasking scatters seeds; focus tends the garden.",
  "Be patient with your learning curves. Every expert was once a curious beginner.",
  "Soft music, fresh water, and honest code. Keep your desk a cozy sanctuary.",
  "You don't need to finish everything today. Planting the seeds is already enough.",
  "A bug solved with patience teaches ten times more than one solved in haste.",
  "Trust your problem-solving roots. You have untangled tough knots before, and you will again.",
  "Notice how far your codebase has come since the first commit. Progress is blooming.",
  "Clean indentations, open tabs, clear thoughts. Nurture your dev flow with gentle intention.",
  "When logic feels heavy, step outside and look at the sky. Perspective solves tricky bugs.",
  "It is okay to delete code. Subtraction is often the highest form of elegance.",
  "Hold your focus gently, like a warm mug on a rainy morning.",
  "Every small bug fixed is a leaf turned toward the warm morning sun.",
  "Build with quiet confidence. You bring unique creativity and care to what you make.",
  "Give yourself permission to write a rough draft. Refinement will bring the polish.",
  "Stay hydrated, sit comfortably, and let curiosity lead your keyboard today.",
  "A tidy desk and an open mind can turn any complex problem into an enjoyable puzzle.",
  "Remember to stretch and unclench your jaw. You're building something lovely.",
  "Peaceful code comes from a peaceful desk. Sip your drink and take your time.",
  "Trust the process. Step by step, commit by commit, your project is growing.",
  "You are capable, resourceful, and creative. Happy coding and stay cozy today!",
];

/**
 * Returns a deterministic quote for any given calendar date string
 * (e.g. "Tue Nov 10 2026")
 */
export function getDailyQuote(dateStr = new Date().toDateString()) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % COZY_DEVELOPER_QUOTES.length;
  return COZY_DEVELOPER_QUOTES[index];
}

/**
 * Returns a random quote from the collection, avoiding the current quote if possible
 */
export function getRandomQuote(currentQuote = "") {
  const pool = COZY_DEVELOPER_QUOTES.filter((q) => q !== currentQuote);
  if (pool.length === 0) return COZY_DEVELOPER_QUOTES[0];
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

