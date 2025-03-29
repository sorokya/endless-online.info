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

import type { Route } from './+types/root';
import Logo from '~/icon.svg';
import './app.css';
import { useMemo } from 'react';

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
  const menuItems = useMemo(() => {
    return (
      <>
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'menu-active' : '')}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/items"
            className={({ isActive }) => (isActive ? 'menu-active' : '')}
          >
            Items
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/npcs"
            className={({ isActive }) => (isActive ? 'menu-active' : '')}
          >
            NPCs
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/classes"
            className={({ isActive }) => (isActive ? 'menu-active' : '')}
          >
            Classes
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/spells"
            className={({ isActive }) => (isActive ? 'menu-active' : '')}
          >
            Spells
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/quests"
            className={({ isActive }) => (isActive ? 'menu-active' : '')}
          >
            Quests
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/guides"
            className={({ isActive }) => (isActive ? 'menu-active' : '')}
          >
            Guides
          </NavLink>
        </li>
      </>
    );
  }, []);
  return (
    <>
      <div className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
          <div className="dropdown">
            {/* biome-ignore lint/a11y/useSemanticElements: <explanation> */}
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
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
