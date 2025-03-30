import { getMapPreview } from '~/.server/maps';
import type { Route } from './+types/maps.$id.preview';

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number.parseInt(params.id, 10);
  const image = await getMapPreview(id);
  return new Response(image, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
}
