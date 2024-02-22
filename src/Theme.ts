import type {
  CssVariables,
  InternalThemePropertiesConfig,
  PartialThemePropertyConfig,
  ThemeOptions,
  ThemeProps,
  VariantOptions,
} from "./types";
import type { CSSRuleObject } from "tailwindcss/types/config";
import { withOptions } from "tailwindcss/plugin";
import { ColorProperty } from "./ColorProperty";
import { ThemeProperty } from "./ThemeProperty";
import { camelToKebab } from "./utils/camelToKebab";

/**
 * The themePropertiesConfig allows us to:
 *    1. Customize the property-prefix that gets injected into the generated CSS Variable name
 *       Note: this is optional; if you don't specify a prefix, it'll get autogenerated by converting the property name to kebab-case
 *    2. Attach properties to `ThemeProperty` child classes, enabling custom value conversion logic
 *
 * TODO: consider exposing a user-facing API for configuring this themePropertiesConfig; users could create their own ThemeProperty sub-classes (like ColorProperty) to write their own value conversion logic.. would make tailwind-easy-theme incredibly flexible -- like more of a low-level theming framework
 */
const themePropertiesConfig: InternalThemePropertiesConfig = {
  colors: {
    prefix: "",
    type: ColorProperty,
  },
  backgroundColor: {
    prefix: "bg",
    type: ColorProperty,
  },
  textColor: {
    prefix: "text",
    type: ColorProperty,
  },
  borderColor: {
    prefix: "border",
    type: ColorProperty,
  },
  accentColor: {
    prefix: "accent",
    type: ColorProperty,
  },
  ringColor: {
    prefix: "ring",
    type: ColorProperty,
  },
  caretColor: {
    prefix: "caret",
    type: ColorProperty,
  },
  divideColor: {
    prefix: "divide",
    type: ColorProperty,
  },
  outlineColor: {
    prefix: "outline",
    type: ColorProperty,
  },
  boxShadowColor: {
    prefix: "box-shadow",
    type: ColorProperty,
  },
  ringOffsetColor: {
    prefix: "ring-offset",
    type: ColorProperty,
  },
  placeholderColor: {
    prefix: "placeholder",
    type: ColorProperty,
  },
  textDecorationColor: {
    prefix: "text-decoration",
    type: ColorProperty,
  },
  gradientColorStops: {
    prefix: "gradient",
    type: ColorProperty,
  },
  fill: {
    prefix: "fill",
    type: ColorProperty,
  },
  stroke: {
    prefix: "stroke",
    type: ColorProperty,
  },
};

export class Theme<T extends ThemeProps = ThemeProps> {
  private userPrefix: string | undefined;
  private selector: string = ":root";
  private cssProperties: T = {} as T;
  private cssRules: CSSRuleObject = {};

  constructor(theme: T, options?: ThemeOptions) {
    this.userPrefix = options?.prefix;
    this.selector = options?.selector || this.selector;

    const { cssVariables, cssProperties } = this.getCSS(theme, this.userPrefix);

    this.cssRules[this.selector] = cssVariables;
    this.cssProperties = cssProperties;
  }

  getCSS(theme: T, userPrefix?: string) {
    let allCssVariables: CssVariables = {};
    let allCssProperties: T = {} as T;

    Object.keys(theme).forEach((propertyKey) => {
      const propertyValue = theme[propertyKey];
      if (!propertyValue) return;

      let prefix: string = camelToKebab(propertyKey);
      let Property = ThemeProperty;

      if (propertyKey in themePropertiesConfig) {
        const config = themePropertiesConfig[propertyKey];
        prefix = config.prefix ?? prefix;
        Property = config.type ?? Property;
      }

      prefix = userPrefix ? `${userPrefix}-${prefix}` : prefix;

      const { cssVariables, cssProperties } = new Property(propertyValue, {
        prefix,
      }).getCSS();

      allCssVariables = {
        ...allCssVariables,
        ...cssVariables,
      };

      allCssProperties[propertyKey as keyof T] = cssProperties as any;
    });

    return {
      cssVariables: allCssVariables,
      cssProperties: allCssProperties,
    };
  }

  variant(theme: PartialThemePropertyConfig<T>, options?: VariantOptions) {
    const mediaQuery = options?.mediaQuery;

    const { cssVariables } = this.getCSS(theme as T, this.userPrefix);

    if (mediaQuery) {
      this.cssRules[mediaQuery] = {
        [options?.selector || this.selector]: cssVariables,
      };
    }

    if (options?.selector) {
      this.cssRules[options.selector] = cssVariables;
    }

    return cssVariables;
  }

  create(base?: CSSRuleObject) {
    const cssRules = this.cssRules;
    const themeConfig = this.cssProperties;

    return withOptions(
      () => {
        return function ({ addBase }) {
          addBase({
            ...cssRules,
            ...base,
          });
        };
      },
      () => {
        return {
          theme: { extend: themeConfig },
        };
      }
    )({});
  }
}
