import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("wall", "routes/wall.tsx"),
] satisfies RouteConfig;
