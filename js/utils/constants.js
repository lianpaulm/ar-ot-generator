export const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const years = [2025, 2026, 2027];
export const periodRanges = ["1-15", "16-30", "16-31"];

export function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}
