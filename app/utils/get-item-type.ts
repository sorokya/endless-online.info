export function getItemType(id: number): string {
  switch (id) {
    case 0:
      return 'Static';
    case 1:
      return 'General';
    case 2:
      return 'Money';
    case 3:
      return 'Potion';
    case 4:
      return 'Teleport';
    case 5:
      return 'Transformation';
    case 6:
      return 'EXP Reward';
    case 7:
      return 'Skill Book';
    case 8:
      return 'Reserved';
    case 9:
      return 'Key';
    case 10:
      return 'Weapon';
    case 11:
      return 'Shield';
    case 12:
      return 'Clothing';
    case 13:
      return 'Hat';
    case 14:
      return 'Boots';
    case 15:
      return 'Gloves';
    case 16:
      return 'Accessory';
    case 17:
      return 'Belt';
    case 18:
      return 'Necklace';
    case 19:
      return 'Ring';
    case 20:
      return 'Bracelet';
    case 21:
      return 'Bracer';
    case 22:
      return 'Costume';
    case 23:
      return 'Costume Hat';
    case 24:
      return 'Wings';
    case 25:
      return 'Buddy';
    case 26:
      return 'Buddy 2';
    case 27:
      return 'Torch';
    case 28:
      return 'Beverage';
    case 29:
      return 'Effect';
    case 30:
      return 'Hairdye';
    case 31:
      return 'Hairtool';
    case 32:
      return 'Cure';
    case 33:
      return 'Title';
    case 34:
      return 'Visual Document';
    case 35:
      return 'Audio Document';
    case 36:
      return 'Transport Ticket';
    case 37:
      return 'Fireworks';
    case 38:
      return 'Explosive';
    case 39:
      return 'Buff';
    case 40:
      return 'Debuff';
    default:
      return 'Unknown';
  }
}
