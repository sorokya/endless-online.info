export function getItemSubType(id: number): string {
  switch (id) {
    case 24:
      return 'craft';
    case 25:
      return 'quest';
    case 26:
      return 'fillable';
    case 31:
      return 'deprecated';
    default:
      return `unknown(${id})`;
  }
}

export enum ItemSubType {
  Playable = 3,
  Wedding = 10,
  Mining = 14,
  Logging = 15,
  Farming = 16,
  Fishing = 17,
  Antidote = 22,
  Unboxing = 23,
  Craft = 24,
  Quest = 25,
  Fillable = 26,
  Warmth = 27,
  StealTheShow = 30,
  Deprecated = 31,
}
