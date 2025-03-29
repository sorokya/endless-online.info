export function getNpcType(id: number): string {
  switch (id) {
    case 0:
      return 'Friendly';
    case 1:
      return 'Passive';
    case 2:
      return 'Aggressive';
    case 5:
      return 'Crafting';
    case 6:
      return 'Shop';
    case 7:
      return 'Inn Keeper';
    case 9:
      return 'Bank';
    case 10:
      return 'Barber';
    case 11:
      return 'Guild Master';
    case 12:
      return 'Priest';
    case 13:
      return 'Lawyer';
    case 14:
      return 'Trainer';
    case 15:
      return 'Quest';
    default:
      return 'Unknown';
  }
}
