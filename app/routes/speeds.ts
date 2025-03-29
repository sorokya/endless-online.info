import { data } from 'react-router';
import { getMaps } from '~/.server/maps';
import { getNpcById } from '~/.server/npcs';

export async function loader() {
  const maps = await getMaps();

  type Npc = {
    npc_id: number;
    speed: number;
  };

  const npcs: Npc[] = [];

  for (const map of maps) {
    for (const npc of map.npcs) {
      const npcRecord = await getNpcById(npc.id);
      if (!npcRecord) {
        continue;
      }

      if (
        !npcs.find(
          (n) => n.speed === (npc.speed || npcRecord.npc_default_speed),
        )
      ) {
        npcs.push({
          npc_id: npcRecord.id,
          speed: npc.speed || npcRecord.npc_default_speed,
        });
      }
    }
  }

  return data(npcs);
}
