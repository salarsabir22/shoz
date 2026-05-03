export function calculateImpact(meals: number, originalTotal: number, paidTotal: number) {
  return {
    co2Saved: parseFloat((meals * 2.5).toFixed(2)),
    moneySaved: parseFloat((originalTotal - paidTotal).toFixed(2)),
    mealsFromWaste: meals,
  };
}
