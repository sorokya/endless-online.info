import { data } from 'react-router';
import { getSpellById } from '~/.server/spells';
import { getSpellTarget } from '~/utils/get-spell-target';
import { getSpellTargetRestrict } from '~/utils/get-spell-target-restrict';
import { getSpellType } from '~/utils/get-spell-type';
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

          <div className="spell-icon">
            <div
              style={{
                width: 34,
                height: 32,
                margin: 'auto',
                backgroundImage: `url(https://eor-api.exile-studios.com/api/spells/${spell.id}/icon)`,
              }}
            />
          </div>

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
              <div className="font-bold">Type</div>
              <div>{getSpellType(spell.spell_type)}</div>
              <div className="font-bold">Target</div>
              <div>{getSpellTarget(spell.target_type)}</div>
              <div className="font-bold">Target Restrict</div>
              <div>{getSpellTargetRestrict(spell.target_restrict)}</div>

              <div className="font-bold">MP Cost</div>
              <div>{spell.tp_cost}</div>
              <div className="font-bold">SP Cost</div>
              <div>{spell.sp_cost}</div>
              <div className="font-bold">Cast time</div>
              <div>{spell.cast_time}s</div>

              {spell.spell_type === 0 && (
                <>
                  <div className="font-bold">HP</div>
                  <div>{spell.hp}</div>
                </>
              )}

              {spell.spell_type === 1 && (
                <>
                  <div className="font-bold">Damage</div>
                  <div>
                    {spell.min_damage} - {spell.max_damage}
                  </div>
                  <div className="font-bold">Accuracy</div>
                  <div>{spell.accuracy}</div>
                </>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
