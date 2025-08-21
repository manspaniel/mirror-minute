import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  plugins: [mkcert(), tailwindcss(), reactRouter(), tsconfigPaths()],
});
