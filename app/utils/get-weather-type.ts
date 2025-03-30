export function getWeatherType(id: number): string {
  switch (id) {
    case 0:
      return 'Normal';
    case 4:
      return 'Freezing';
    case 5:
      return 'Underwater';
    case 7:
      return 'Light Snow';
    case 8:
      return 'Heavy Snow';
    default:
      return `Unknown (${id})`;
  }
}
