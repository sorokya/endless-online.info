export function getLightMode(id: number): string {
  switch (id) {
    case 0:
    case 1:
      return 'Indoors';
    case 2:
      return 'Dark';
    case 3:
      return 'Glitch';
    case 4:
      return 'Outdoors';
    case 5:
      return 'Shadowed';
    default:
      return `Unknown (${id})`;
  }
}
