import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/playground")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/playground" || location.pathname === "/playground/") {
      throw redirect({ to: "/playground/animals" });
    }
  },
  component: () => <Outlet />,
});
