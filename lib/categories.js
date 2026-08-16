export const CATEGORIES = [
  { id: "game", label: "งานเกม", color: "#49CAFF" },
  { id: "cosplay", label: "คอสเพลย์", color: "#5271FF" },
  { id: "other", label: "กิจกรรมอื่นๆ", color: "#FFFFFF" },
];

export function catInfo(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[2];
}
