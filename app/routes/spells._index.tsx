import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Route } from './+types/spells._index';

import { useDebounce } from '@uidotdev/usehooks';
import { Form, Link, data } from 'react-router';
import { getSpellList } from '~/.server/spells';
import { CONFIG } from '~/config';

export function links() {
  return [{ rel: 'canonical', href: 'https://endless-online.info/classes' }];
}

export function meta() {
  return [
    { title: 'EOR Database - Spells' },
    { name: 'og:title', content: 'EOR Database - Spells' },
    { name: 'og:url', content: 'https://endless-online.info/spells' },
    {
      name: 'og:description',
      content: 'Endless Online Spell Search',
    },
    {
      name: 'description',
      content: 'Endless Online Spell Search',
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const search = {
    name: url.searchParams.get('name') || '',
    type: url.searchParams.get('type') || 'all',
    page: url.searchParams.get('page') || '1',
  };

  const spells = await getSpellList(search);
  return data({
    spells,
    search,
  });
}

export default function Classes({ loaderData }: Route.ComponentProps) {
  const { spells, search } = loaderData;

  const [name, setName] = useState(search.name);

  const debouncedName = useDebounce(name, 300);

  // Use useRef for the form element
  const formRef = useRef<HTMLFormElement | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Run effect when name changes
  useEffect(() => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  }, [debouncedName]);

  const pageCount = useMemo(
    () => Math.ceil(spells.count / CONFIG.PAGE_SIZE),
    [spells],
  );

  const getSearchParams = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      params.append('name', name);
      params.append('page', page.toString());

      return Array.from(params.entries())
        .map(([key, value]) =>
          value ? `${key}=${encodeURIComponent(value)}` : key,
        )
        .join('&');
    },
    [name],
  );

  const pageLinks = useMemo(() => {
    if (pageCount === 1) {
      return undefined;
    }

    const links = [];
    for (let i = 1; i <= pageCount; i++) {
      const active = search.page === i.toString();
      links.push(
        <Link
          key={i}
          to={{
            search: getSearchParams(i),
          }}
          className={`join-item btn ${active ? 'btn-primary' : ''}`}
        >
          {i}
        </Link>,
      );
    }

    return links;
  }, [pageCount, getSearchParams, search.page]);

  return (
    <div className="container mx-auto p-4">
      <Form
        className="mb-2 flex justify-end gap-2"
        method="get"
        replace
        ref={formRef}
      >
        <div className="form-control flex-2/3">
          <label htmlFor="name" className="label">
            <span className="label-text">Name</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter name"
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <input name="page" type="hidden" value={search.page} />

        <div className="mt-6">
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </Form>
      {spells.records.length === 0 ? (
        <div className="flex h-60 items-center justify-center">
          <div className="card bg-base-200 text-center shadow-xl">
            <div className="card-body">
              <h2 className="font-bold text-gray-600 text-xl">
                No results found
              </h2>
              <p className="mt-2 text-gray-400 text-sm">
                Try adjusting your search criteria.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {spells.records.map((s) => (
              <Link
                to={`/spells/${s.id}`}
                key={s.id}
                className="card spell-icon bg-base-200 p-4 shadow-xl"
              >
                <div
                  style={{
                    width: 34,
                    height: 32,
                    margin: 'auto',
                    backgroundImage: `url(https://eor-api.exile-studios.com/api/spells/${s.id}/icon)`,
                  }}
                />
                <div className="mt-2 text-center font-bold">{s.name}</div>
              </Link>
            ))}
          </div>
          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-center">
              <div className="join flex-wrap">{pageLinks}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
