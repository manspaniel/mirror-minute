import {
  createTailwindMerge,
  twJoin,
  getDefaultConfig,
  mergeConfigs,
} from "tailwind-merge";
import {
  createTV,
  type VariantProps,
  type ClassValue,
} from "tailwind-variants";

const getConfig = () =>
  mergeConfigs(getDefaultConfig(), {
    extend: {
      classGroups: {
        type: ["type", (val: string) => /^type-/.test(val)],
      },
    },
  });

/** clsx-like function, which ensures conflicting classes are stripped */
const cn = createTailwindMerge(getConfig);

/** clsx-like function, which joins classes only — more performant since it doesn't compare strings */
const cx = twJoin;

const tv = createTV({
  twMergeConfig: getConfig,
});

export { cn, tv, cx };
export type { VariantProps, ClassValue };
