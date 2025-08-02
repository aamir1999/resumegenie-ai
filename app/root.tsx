import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import {usePuterStore} from "~/lib/puter";
import {useEffect} from "react";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { init } = usePuterStore();

  useEffect(() => {
    // Load Puter dynamically to avoid CORS issues
    const loadPuter = () => {
      if (typeof window === "undefined") return;

      // Check if Puter is already loaded
      if (window.puter) {
        init();
        return;
      }

      // Create script element with CORS attributes
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.crossOrigin = 'anonymous';
      script.async = true;

      script.onload = () => {
        console.log('Puter script loaded successfully');
        // Wait a bit for Puter to initialize
        setTimeout(() => {
          init();
        }, 500);
      };

      script.onerror = (error) => {
        console.error('Failed to load Puter script:', error);
        // Try alternative CDN
        const fallbackScript = document.createElement('script');
        fallbackScript.src = 'https://unpkg.com/puter@latest/dist/puter.js';
        fallbackScript.crossOrigin = 'anonymous';
        fallbackScript.async = true;

        fallbackScript.onload = () => {
          console.log('Puter fallback script loaded');
          setTimeout(() => {
            init();
          }, 500);
        };

        fallbackScript.onerror = () => {
          console.error('Both Puter script sources failed to load');
        };

        document.head.appendChild(fallbackScript);
      };

      document.head.appendChild(script);
    };

    loadPuter();
  }, [init]);

  return (
      <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
        error.status === 404
            ? "The requested page could not be found."
            : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
      <main className="pt-16 p-4 container mx-auto">
        <h1>{message}</h1>
        <p>{details}</p>
        {stack && (
            <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
        )}
      </main>
  );
}