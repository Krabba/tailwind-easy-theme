import type { FlatThemePropertyConfig, ThemePropertyConfig } from "../types";

export function flattenThemeConfig(
  config: ThemePropertyConfig,
  keyPrefix: string = ""
): FlatThemePropertyConfig {
  const keys = Object.keys(config);

  const flattenedThemeConfig = keys.reduce<FlatThemePropertyConfig>(
    (acc, _key) => {
      const key = keyPrefix ? `${keyPrefix}-${_key}` : _key;
      const value = config[_key];
      if (!value) return acc;

      if (typeof value === "string") {
        acc[key] = value;
        return acc;
      }

      const { DEFAULT, ...rest } = value;
      if (DEFAULT) {
        acc[key] = DEFAULT;
      }

      const nestedThemeProperty = flattenThemeConfig(rest, key);

      acc = { ...acc, ...nestedThemeProperty };

      return acc;
    },
    {}
  );

  return flattenedThemeConfig;
}
