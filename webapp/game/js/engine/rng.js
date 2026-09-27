/* engine/rng.js — RNG seed được (mulberry32) để test deterministic. Runtime game dùng seed từ Date.now, test dùng seed cố định. */
export function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
export function makeRNG(seed) {
  const f = mulberry32(seed >>> 0);
  return {
    next: f,
    int: n => Math.floor(f() * n),
    pick: arr => arr[Math.floor(f() * arr.length)],
    chance: p => f() < p,
    range: (a, b) => a + f() * (b - a),
    round5k: (min, max) => Math.round((min + f() * (max - min)) / 5000) * 5000
  };
}
export const wpick = (rng, arr, w) => {
  let r = rng.next() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < arr.length; i++) { r -= w[i]; if (r <= 0) return arr[i]; }
  return arr[0];
};
