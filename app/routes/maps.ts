import { data } from 'react-router';
import { type Map as MapType, getMaps } from '~/.server/maps';

export async function loader() {
  const maps = await getMaps();
  return data(getMap(15, maps));
}

type MapSlim = {
  id: number;
  name: string;
  width: number;
  height: number;
  from_x: number | null;
  from_y: number | null;
  destination_x: number | null;
  destination_y: number | null;
};

function getMap(id: number, maps: MapType[]) {
  const map = maps.find((m) => m.id === id);
  if (!map) {
    return null;
  }

  type WarpArray = typeof map.warp_tiles;

  const warps: WarpArray = [];
  for (const warp of map.warp_tiles) {
    const existing = warps.find(
      (w) => w.destination_id === warp.destination_id,
    );
    if (!existing) {
      warps.push(warp);
    }
  }

  const warpMaps: MapSlim[] = [];

  for (const warp of warps) {
    const map = maps.find((m) => m.id === warp.destination_id);
    if (!map) {
      continue;
    }

    warpMaps.push({
      id: warp.destination_id,
      name: map.name,
      width: map.width,
      height: map.height,
      from_x: warp.x,
      from_y: warp.y,
      destination_x: warp.destination_x,
      destination_y: warp.destination_y,
    });
  }

  return {
    id: map.id,
    name: map.name,
    width: map.width,
    height: map.height,
    warps,
  };
}
