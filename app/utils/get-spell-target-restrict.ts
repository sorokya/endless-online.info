export function getSpellTargetRestrict(id: number): string {
  switch (id) {
    case 0:
      return 'Npc';
    case 1:
      return 'Friendly';
    case 2:
      return 'Opponent';
    default:
      return `Unknown (${id})`;
  }
}
