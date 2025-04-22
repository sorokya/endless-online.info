import { data } from 'react-router';
import { getSpellById } from '~/.server/spells';
import { getSpellDirectEffect } from '~/utils/get-spell-direct-effect';
import type { Route } from './+types/spells.$id';

export function meta({ data }: Route.MetaArgs) {
  const { spell } = data;
  if (!spell) {
    return [];
  }

  return [
    { title: `EOR Database - ${spell.name}` },
    { name: 'og:title', content: `EOR Database - ${spell.name}` },
    {
      name: 'og:url',
      content: `https://endless-online.info/classes/${spell.id}`,
    },
    { name: 'og:image', content: 'https://endless-online.info/icon.png' },
    {
      name: 'og:description',
      content: `Stats for ${spell.name} Spell in Endless Online`,
    },
    {
      name: 'description',
      content: `Stats for ${spell.name} Spell in Endless Online`,
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number.parseInt(params.id, 10);
  const spell = await getSpellById(id);

  return data({
    spell,
  });
}

export default function Spell({ loaderData }: Route.ComponentProps) {
  const { spell } = loaderData;

  if (!spell) {
    return (
      <div className="clss-center flex h-60 justify-center">
        <div className="card bg-base-200 text-center shadow-xl">
          <div className="card-body">
            <h2 className="font-bold text-gray-600 text-xl">Not found</h2>
            <p className="mt-2 text-gray-400 text-sm">
              A spell with that ID does not exist
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
          <h2 className="mb-4 text-center font-bold text-2xl">{spell.name}</h2>

          <div className="text-center">
            <em>"{spell.shout}"</em>
          </div>

          <details
            className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl"
            open
          >
            <summary className="collapse-title font-bold text-xl">
              Stats:
            </summary>

            <div className="grid grid-cols-2 gap-4 rounded-lg bg-base-100 p-4 shadow md:grid-cols-6">
              <div className="font-bold">Direct Effect</div>
              <div>{getSpellDirectEffect(spell.direct_effect)}</div>

              <div className="font-bold">MP Cost</div>
              <div>{spell.tp_cost}</div>
              <div className="font-bold">SP Cost</div>
              <div>{spell.sp_cost}</div>
              <div className="font-bold">Cast time</div>
              <div>{spell.cast_time}s</div>

              <div className="font-bold">Cooldown</div>
              <div>{spell.cooldown}s</div>

              {spell.direct_effect === 2 && (
                <>
                  <div className="font-bold">HP</div>
                  <div>
                    {spell['direct-low']} - {spell['direct-high']}
                  </div>
                </>
              )}

              {spell.direct_effect === 1 && (
                <>
                  <div className="font-bold">Damage</div>
                  <div>
                    {spell['direct-low']} - {spell['direct-high']}
                  </div>
                </>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
