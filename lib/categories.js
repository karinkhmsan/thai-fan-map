export const CATEGORIES = [
  { id: "game", label: "งานเกม", color: "#35E6C4" },
  { id: "cosplay", label: "คอสเพลย์", color: "#FF3D8A" },
  { id: "other", label: "กิจกรรมอื่นๆ", color: "#FFC145" },
];

export function catInfo(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[2];
}
