import { data } from 'react-router';
import { getMaps } from '~/.server/maps';

export async function loader() {
  const maps = await getMaps();

  const keyItems = maps
    .flatMap((m) => m.items.map((i) => ({ ...i, map_id: m.id })))
    .filter((i) => i.key > 0);
  return data(keyItems);
}
