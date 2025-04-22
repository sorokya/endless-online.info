export function getSpellDirectEffect(id: number): string {
  switch (id) {
    case 0:
      return 'None';
    case 1:
      return 'Attack';
    case 2:
      return 'Heal';
    default:
      return `Unknown (${id})`;
  }
}
