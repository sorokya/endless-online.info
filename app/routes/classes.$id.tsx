import { data } from 'react-router';
import { getClassById } from '~/.server/classes';
import type { Route } from './+types/classes.$id';

export function meta({ data }: Route.MetaArgs) {
  const { cls } = data;
  if (!cls) {
    return [];
  }

  return [
    { title: `EOR Database - ${cls.name}` },
    { name: 'og:title', content: `EOR Database - ${cls.name}` },
    {
      name: 'og:url',
      content: `https://endless-online.info/classes/${cls.id}`,
    },
    { name: 'og:image', content: 'https://endless-online.info/icon.png' },
    {
      name: 'og:description',
      content: `Stats for ${cls.name} Class in Endless Online`,
    },
    {
      name: 'description',
      content: `Stats for ${cls.name} Class in Endless Online`,
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number.parseInt(params.id, 10);
  const cls = await getClassById(id);

  return data({
    cls,
  });
}

export default function Class({ loaderData }: Route.ComponentProps) {
  const { cls } = loaderData;

  if (!cls) {
    return (
      <div className="clss-center flex h-60 justify-center">
        <div className="card bg-base-200 text-center shadow-xl">
          <div className="card-body">
            <h2 className="font-bold text-gray-600 text-xl">Not found</h2>
            <p className="mt-2 text-gray-400 text-sm">
              A class with that ID does not exist
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="card bg-base-200 p-4 shadow-xl">
        <div className="card-body">
          <h2 className="mb-4 text-center font-bold text-2xl">{cls.name}</h2>

          <details
            className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl"
            open
          >
            <summary className="collapse-title font-bold text-xl">
              Stats:
            </summary>

            <div className="grid grid-cols-2 gap-4 rounded-lg bg-base-100 p-4 shadow md:grid-cols-6">
              <div className="font-bold">Power</div>
              <div>{cls.base_power}</div>
              <div className="font-bold">Accuracy</div>
              <div>{cls.base_accuracy}</div>
              <div className="font-bold">Dexterity</div>
              <div>{cls.base_dexterity}</div>

              <div className="font-bold">Defense</div>
              <div>{cls.base_defense}</div>
              <div className="font-bold">Vitality</div>
              <div>{cls.base_vitality}</div>
              <div className="font-bold">Aura</div>
              <div>{cls.base_aura}</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
