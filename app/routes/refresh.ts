import { refresh } from '~/.server/refresh';
import type { Route } from './+types/refresh';

export async function loader({ request }: Route.LoaderArgs) {
  await refresh(request);

  return new Response('refreshed');
}
