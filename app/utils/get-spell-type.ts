export function getSpellType(id: number): string {
  switch (id) {
    case 0:
      return 'Heal';
    case 1:
      return 'Attack';
    case 2:
      return 'Bard';
    case 3:
      return 'Fishing';
    case 6:
      return 'Discover';
    default:
      return `Unknown (${id})`;
  }
}
