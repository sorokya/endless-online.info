import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Route } from './+types/maps._index';

import { useDebounce } from '@uidotdev/usehooks';
import { Form, Link, data } from 'react-router';
import { getMapList } from '~/.server/maps';
import { CONFIG } from '~/config';

export function links() {
  return [{ rel: 'canonical', href: 'https://endless-online.info/maps' }];
}

export function meta() {
  return [
    { title: 'EOR Database - Maps' },
    { name: 'og:title', content: 'EOR Database - Maps' },
    { name: 'og:url', content: 'https://endless-online.info/maps' },
    { name: 'og:image', content: 'https://endless-online.info/app/icon.svg' },
    {
      name: 'og:description',
      content: 'Endless Online Map Search',
    },
    {
      name: 'description',
      content: 'Endless Online Map Search',
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const search = {
    name: url.searchParams.get('name') || '',
    page: url.searchParams.get('page') || '1',
  };

  const maps = await getMapList(search);
  return data({
    maps,
    search,
  });
}

export default function Maps({ loaderData }: Route.ComponentProps) {
  const { maps, search } = loaderData;

  const [name, setName] = useState(search.name);
  const [page, setPage] = useState(search.page);

  const debouncedName = useDebounce(name, 300);

  // Use useRef for the form element
  const formRef = useRef<HTMLFormElement | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Run effect when name changes
  useEffect(() => {
    if (formRef.current) {
      setPage('1');
      formRef.current.requestSubmit();
    }
  }, [debouncedName]);

  const pageCount = useMemo(
    () => Math.ceil(maps.count / CONFIG.PAGE_SIZE),
    [maps],
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

        <input name="page" type="hidden" value={page} />

        <div className="mt-6">
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </Form>
      {maps.records.length === 0 ? (
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
            {maps.records.map((map) => (
              <Link
                to={`/maps/${map.id}`}
                key={map.id}
                className="card bg-base-200 p-4 shadow-xl"
              >
                <img
                  src={`/maps/${map.id}/preview`}
                  alt="Map Preview"
                  className="h-32"
                />
                <div className="mt-2 text-center font-bold">{map.name}</div>
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
