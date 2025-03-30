import { data } from 'react-router';
import { getMapById, getMapPreviewWithArrow } from '~/.server/maps';
import type { Route } from './+types/maps.$id.find';

export function meta({ data }: Route.MetaArgs) {
  const { map, x, y } = data;
  if (!map) {
    return [];
  }

  return [
    { title: `EOR Database - ${map.name}` },
    { name: 'og:title', content: `EOR Database - ${map.name} (${x}, ${y})` },
    {
      name: 'og:url',
      content: `https://endless-online.info/maps/${map.id}/find?x=${x}&y=${y}`,
    },
    {
      name: 'og:description',
      content: `Endless Online Map Finder ${map.name} (${x}, ${y})`,
    },
    {
      name: 'description',
      content: `Endless Online Map Finder ${map.name} (${x}, ${y})`,
    },
  ];
}

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
