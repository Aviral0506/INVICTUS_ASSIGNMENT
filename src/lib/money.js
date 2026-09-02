export function formatMoney(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n) || Math.abs(n) < 0.005) return "$0.00";
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export function splitEqual(amount, ids) {
  const n = ids.length;
  if (!n) return {};
  const totalCents = Math.round(Number(amount) * 100);
  const baseCents = Math.floor(totalCents / n);
  const remainder = totalCents - baseCents * n;
  const shares = {};

  ids.forEach((id, index) => {
    const cents = index < remainder ? baseCents + 1 : baseCents;
    shares[id] = cents / 100;
  });

  return shares;
}

export function percentsSumTo100(percents) {
  const values = Object.values(percents).map(Number);
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.abs(sum - 100) < 0.01;
}

export function splitByPercent(amount, percents) {
  const entries = Object.entries(percents);
  if (!entries.length) return {};
  const totalCents = Math.round(Number(amount) * 100);
  const shares = {};
  let assignedCents = 0;

  entries.forEach(([id, pct], i) => {
    if (i === entries.length - 1) {
      const shareCents = totalCents - assignedCents;
      shares[id] = shareCents / 100;
    } else {
      const shareCents = Math.round((totalCents * Number(pct)) / 100);
      shares[id] = shareCents / 100;
      assignedCents += shareCents;
    }
  });

  return shares;
}

export function sharesForExpense(expense) {
  if (expense.splitType === "percent" && expense.percents) {
    return splitByPercent(expense.amount, expense.percents);
  }
  return splitEqual(expense.amount, expense.splitWith);
}

