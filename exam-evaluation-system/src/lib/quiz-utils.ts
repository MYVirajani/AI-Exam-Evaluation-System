// src/lib/quiz-utils.ts

// Convert marks to integer cents to avoid float issues (e.g., 12.30 -> 1230)
export function toCents(n: number): number {
  return Math.round(n * 100);
}

// Fisher–Yates shuffle
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Exact subset with fixed count and exact sum (in cents)
export function findSubsetByCountAndSum<T extends { _marksCents: number }>(
  items: T[],
  k: number,
  target: number
): T[] | null {
  const dp: Array<Map<number, number[]>> = Array.from({ length: k + 1 }, () => new Map());
  dp[0].set(0, []);

  for (let i = 0; i < items.length; i++) {
    const w = items[i]._marksCents;
    for (let c = Math.min(i + 1, k); c >= 1; c--) {
      for (const [sum, idxs] of dp[c - 1]) {
        const newSum = sum + w;
        if (!dp[c].has(newSum)) {
          dp[c].set(newSum, [...idxs, i]);
        }
      }
    }
  }

  const picked = dp[k].get(target);
  if (!picked) return null;
  return picked.map(i => items[i]);
}

// Exact subset with any count but exact sum (in cents)
export function findSubsetBySum<T extends { _marksCents: number }>(
  items: T[],
  target: number
): T[] | null {
  let dp = new Map<number, number[]>();
  dp.set(0, []);

  for (let i = 0; i < items.length; i++) {
    const w = items[i]._marksCents;
    const next = new Map(dp);
    for (const [sum, idxs] of dp) {
      const newSum = sum + w;
      if (!next.has(newSum)) next.set(newSum, [...idxs, i]);
    }
    dp = next;
  }

  const picked = dp.get(target);
  if (!picked) return null;
  return picked.map(i => items[i]);
}

// Attach _marksCents helper field (non-mutating)
export function normalizeWithCents<T extends { marks_allowed?: number | null }>(qs: T[]) {
  return qs.map(q => {
    const marksNum = Number(q.marks_allowed ?? 0);
    return { ...q, _marksCents: toCents(marksNum) };
  }) as Array<T & { _marksCents: number }>;
}

// Strip helper field before responding
export function stripHelperField<T extends { _marksCents?: number }>(items: T[]) {
  return items.map(({ _marksCents, ...rest }) => rest) as Omit<T, "_marksCents">[];
}
