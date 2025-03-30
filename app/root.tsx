import {
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from 'react-router';

import Logo from '~/icon.svg';
import type { Route } from './+types/root';
import './app.css';
import { useCallback, useMemo } from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={Logo} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const dismissMenu = useCallback(() => {
    const element = document.activeElement;
    if (element) {
      // @ts-ignore
      element.blur();
    }
  }, []);

  const menuItems = useMemo(() => {
    return (
      <>
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'menu-active' : '')}
            onClick={() => dismissMenu()}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/items"
            className={({ isActive }) => (isActive ? 'menu-active' : '')}
            onClick={() => dismissMenu()}
          >
            Items
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/npcs"
            className={({ isActive }) => (isActive ? 'menu-active' : '')}
            onClick={() => dismissMenu()}
          >
            NPCs
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/classes"
            className={({ isActive }) => (isActive ? 'menu-active' : '')}
            onClick={() => dismissMenu()}
          >
            Classes
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/spells"
            className={({ isActive }) => (isActive ? 'menu-active' : '')}
            onClick={() => dismissMenu()}
          >
            Spells
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/quests"
            className={({ isActive }) => (isActive ? 'menu-active' : '')}
            onClick={() => dismissMenu()}
          >
            Quests
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/guides"
            className={({ isActive }) => (isActive ? 'menu-active' : '')}
            onClick={() => dismissMenu()}
          >
            Guides
          </NavLink>
        </li>
      </>
    );
  }, [dismissMenu]);

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <div className="navbar bg-base-100 shadow-sm">
          <div className="navbar-start">
            <div className="dropdown">
              <div
                tabIndex={0}
                // biome-ignore lint/a11y/useSemanticElements: <explanation>
                role="button"
                className="btn btn-ghost lg:hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>Mobile Menu</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h8m-8 6h16"
                  />
                </svg>
              </div>
              <ul
                // biome-ignore lint/a11y/noNoninteractiveTabindex: <explanation>
                tabIndex={0}
                className="menu menu-sm dropdown-content z-1 mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
              >
                {menuItems}
              </ul>
            </div>
            <Link className="btn btn-ghost text-xl" to="/">
              <img src={Logo} alt="Logo" className="h-8" />
              EOR Database
            </Link>
          </div>
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">{menuItems}</ul>
          </div>
          <div className="navbar-end" />
        </div>
        <Outlet />

        <footer className="mt-auto bg-base-200 p-4 text-center">
          <div className="text-sm">
            <p>
              &copy; 2025{' '}
              <a href="https://leek.cafe" className="link">
                Richard Leek
              </a>
              . All Rights Reserved.
            </p>
            <p>
              Powered by{' '}
              <a href="https://eor-api.exile-studios.com" className="link">
                EOR API
              </a>
            </p>
            <p>
              <a href="https://endless-online.com" className="link">
                Endless Online
              </a>{' '}
              &copy; Copyright 2025{' '}
              <a href="https://www.vult-r.com" className="link">
                Vult-r
              </a>
            </p>
          </div>
        </footer>
      </div>

      {process.env.NODE_ENV !== 'development' && (
        <script
          defer
          src="https://stats.richardleek.com/script.js"
          data-website-id="ad0d67d9-d46d-4ea2-a455-13a64e1d1b43"
        />
      )}
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
