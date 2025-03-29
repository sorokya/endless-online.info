export function getNpcSpeed(id: number): string {
  switch (id) {
    case 0:
      return 'Custom';
    case 1:
      return 'Ultra++';
    case 2:
      return 'Ultra+';
    case 3:
      return 'Ultra';
    case 4:
      return 'Speedy+';
    case 5:
      return 'Speedy';
    case 6:
      return 'Fast+';
    case 7:
      return 'Fast';
    case 8:
      return 'Medium+';
    case 9:
      return 'Medium';
    case 10:
      return 'Medium-';
    case 11:
      return 'Slow';
    case 15:
      return 'Fixed';
    default:
      return `Unknown (${id})`;
  }
}
