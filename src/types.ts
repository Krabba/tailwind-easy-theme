import { ThemeConfig } from "tailwindcss/types/config";
import { ThemeProperty } from "./ThemeProperty";

// export type TailwindThemeColorProperty =
//   (typeof colorProperties)[number];

export type ThemeOptions = {
  /** The prefix added to the key of a color. Defaults to `--color-` */
  prefix?: string;
  /** The selector to add the css variables to. Defaults to `:root` */
  selector?: string;
};

export type VariantOptions = {
  /** The selector to add the css variables to. If not specified will use main theme's selector. */
  selector?: string;
  /** @example `@media (prefers-color-scheme: dark)` */
  mediaQuery?: string;
};

/** Tailwind config's "theme" type: */
export type ThemeProps = Partial<ThemeConfig>;

/**
 * ${prefix}${key}: <hsl-values>
 *
 *  @example
 *  {
 *    '--color-primary': '100 100% 100%'
 *  }
 * */
export type CssVariables = Record<string, string>;

/** ThemeProperty types:
 ======================= */

export type FlatThemePropertyConfig = Record<string, string>;
export type ThemePropertyConfig = Record<
  string,
  FlatThemePropertyConfig | string
>;

type HexCode = string | undefined;

type RecursiveOptionalKeyValuePair<
  K extends string | number | symbol,
  V extends string | object
> = {
  [Key in K]?: V extends string
    ? HexCode
    : V extends object
    ? V[keyof V] extends string | object
      ? RecursiveOptionalKeyValuePair<keyof V, V[keyof V]>
      : never
    : never;
};

export type PartialThemePropertyConfig<PrimaryTheme extends ThemeProps> = {
  [K in keyof PrimaryTheme]?: PrimaryTheme[K] extends infer PrimaryThemeKey
    ? {
        [Key in keyof PrimaryThemeKey]?: PrimaryThemeKey[Key] extends infer Value
          ? Value extends object
            ? Value[keyof Value] extends string | object
              ? RecursiveOptionalKeyValuePair<keyof Value, Value[keyof Value]>
              : never
            : HexCode
          : never;
      }
    : never;
};

export type ThemePropertyOptions = {
  prefix: string;
};

// Constructor signature for classes extending ThemeProperty
export type ThemePropertyConstructor = new (...args: any[]) => ThemeProperty;

export type InternalThemePropertiesConfig<T extends ThemeProps> = {
  [P in keyof T]?: {
    prefix: string;
    type: ThemePropertyConstructor;
  };
};

export type ThemeValueFilterProps = {
  themePropertyKey: string;
  themePropertyValue: string;
};
