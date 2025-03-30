import { data } from 'react-router';
import { getMapById, getMapPreviewWithArrow } from '~/.server/maps';
import type { Route } from './+types/maps.$id.find';

export async function loader({ request, params }: Route.LoaderArgs) {
  const id = Number.parseInt(params.id, 10);
  const url = new URL(request.url);
  const x = Number.parseInt(url.searchParams.get('x') || '', 10);
  const y = Number.parseInt(url.searchParams.get('y') || '', 10);

  if (Number.isNaN(x) || Number.isNaN(y)) {
    return data({ image: undefined, map: undefined, x: 0, y: 0 });
  }

  const image = await getMapPreviewWithArrow(id, x, y);
  const map = await getMapById(id);
  return data({ map, image, x, y });
}

export default function MapFind({ loaderData }: Route.ComponentProps) {
  const { image, map, x, y } = loaderData;

  if (!image || !map) {
    return 'Failed to create image';
  }

  return (
    <div className="container mx-auto p-6">
      <div className="card bg-base-200 p-4 shadow-xl">
        <div className="card-body">
          <h2 className="mb-4 text-center font-bold text-2xl">
            {map.name} ({x}, {y})
          </h2>

          <img
            src={image}
            alt="Preview of map with arrow pointing to coordinates"
          />
        </div>
      </div>
    </div>
  );
}
