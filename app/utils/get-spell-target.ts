export function getSpellTarget(id: number): string {
  switch (id) {
    case 0:
      return 'Other';
    case 1:
      return 'Self';
    case 3:
      return 'Group';
    default:
      return `Unknown (${id})`;
  }
}
