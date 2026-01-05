/**
 * String inflection utilities - port of string-inflection.el for Emacs
 * https://github.com/akicho8/string-inflection
 */

/**
 * Convert to snake_case: FooBar => foo_bar
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([\p{Ll}\p{Lo}\p{Nd}])([\p{Lu}])/gu, "$1_$2")
    .replace(/([\p{Lu}]+)([\p{Lu}][\p{Ll}\p{Lo}])/gu, "$1_$2")
    .replace(/[-_]+/g, "_")
    .toLowerCase();
}

/**
 * Convert to SCREAMING_SNAKE_CASE: fooBar => FOO_BAR
 */
export function toScreamingSnakeCase(str: string): string {
  return toSnakeCase(str).toUpperCase();
}

/**
 * Convert to PascalCase: foo_bar => FooBar
 */
export function toPascalCase(str: string): string {
  return toSnakeCase(str).split("_").map(capitalize).join("");
}

/**
 * Convert to camelCase: foo_bar => fooBar
 */
export function toCamelCase(str: string): string {
  const parts = toSnakeCase(str).split("_");
  return parts[0].toLowerCase() + parts.slice(1).map(capitalize).join("");
}

/**
 * Convert to kebab-case: foo_bar => foo-bar
 */
export function toKebabCase(str: string): string {
  return toSnakeCase(str).replace(/_/g, "-");
}

/**
 * Convert to Capital_Snake_Case: foo_bar => Foo_Bar
 */
export function toCapitalSnakeCase(str: string): string {
  return toSnakeCase(str).split("_").map(capitalize).join("_");
}

export function capitalize(str: string): string {
  if (str.length === 0) return "";
  const [first, ...rest] = Array.from(str);
  return first.toUpperCase() + rest.join("").toLowerCase();
}

export function upcase(str: string): string {
  return str.toUpperCase();
}

export function downcase(str: string): string {
  return str.toLowerCase();
}

// Detection functions

export function isSymbol(str: string): boolean {
  return /^[\p{Ll}\p{Lo}\p{Nd}]+$/u.test(str);
}

export function isSnakeCase(str: string): boolean {
  return /^[\p{Ll}\p{Lo}\p{Nd}_]+$/u.test(str);
}

export function isScreamingSnakeCase(str: string): boolean {
  return /^[\p{Lu}\p{Lo}\p{Nd}_]+$/u.test(str);
}

export function isPascalCase(str: string): boolean {
  return /[\p{Ll}]/u.test(str) && /^[\p{Lu}][\p{L}\p{Nd}]*$/u.test(str);
}

export function isCamelCase(str: string): boolean {
  return /[\p{Lu}]/u.test(str) && /^[\p{Ll}][\p{L}\p{Nd}]*$/u.test(str);
}

export function isKebabCase(str: string): boolean {
  return /-/.test(str);
}

export function isCapitalSnakeCase(str: string): boolean {
  return /_/.test(str) && /^[\p{Lu}][\p{L}\p{Nd}_]*$/u.test(str);
}

export type InflectionStyle = "all" | "ruby" | "python" | "elixir" | "java";

/**
 * Cycle through inflection styles based on language style
 *
 * - all:    foo_bar => FOO_BAR => FooBar => fooBar => foo-bar => Foo_Bar => foo_bar
 * - ruby:   foo_bar => FOO_BAR => FooBar => foo_bar
 * - python: foo_bar => FOO_BAR => FooBar => foo_bar
 * - elixir: foo_bar => FooBar => foo_bar
 * - java:   fooBar  => FOO_BAR => FooBar => fooBar
 */
export function cycle(str: string, style: InflectionStyle = "all"): string {
  switch (style) {
    case "ruby":
    case "python":
      return cycleRubyStyle(str);
    case "elixir":
      return cycleElixirStyle(str);
    case "java":
      return cycleJavaStyle(str);
    case "all":
    default:
      return cycleAllStyle(str);
  }
}

function cycleAllStyle(str: string): string {
  // foo_bar => FOO_BAR => FooBar => fooBar => foo-bar => Foo_Bar => foo_bar
  if (isSymbol(str) || isSnakeCase(str)) return toScreamingSnakeCase(str);
  if (isScreamingSnakeCase(str)) return toPascalCase(str);
  if (isPascalCase(str)) return toCamelCase(str);
  if (isCamelCase(str)) return toKebabCase(str);
  if (isKebabCase(str)) return toCapitalSnakeCase(str);
  return toSnakeCase(str);
}

function cycleRubyStyle(str: string): string {
  // foo_bar => FOO_BAR => FooBar => foo_bar
  if (isSnakeCase(str)) return toScreamingSnakeCase(str);
  if (isScreamingSnakeCase(str)) return toPascalCase(str);
  return toSnakeCase(str);
}

function cycleElixirStyle(str: string): string {
  // foo_bar => FooBar => foo_bar
  if (isSnakeCase(str)) return toPascalCase(str);
  return toSnakeCase(str);
}

function cycleJavaStyle(str: string): string {
  // fooBar => FOO_BAR => FooBar => fooBar
  if (isSnakeCase(str) || isCamelCase(str)) return toScreamingSnakeCase(str);
  if (isScreamingSnakeCase(str)) return toPascalCase(str);
  return toCamelCase(str);
}

/**
 * Toggle between snake_case and PascalCase
 */
export function toggle(str: string): string {
  if (isSnakeCase(str)) return toPascalCase(str);
  if (isPascalCase(str)) return toCamelCase(str);
  return toSnakeCase(str);
}

/**
 * Cycle between snake_case and kebab-case: foo_bar <=> foo-bar
 */
export function cycleSnakeKebab(str: string): string {
  if (isSnakeCase(str)) return toKebabCase(str);
  return toSnakeCase(str);
}

/**
 * Cycle between PascalCase and camelCase: FooBar <=> fooBar
 */
export function cycleCamelCase(str: string): string {
  if (isPascalCase(str)) return toCamelCase(str);
  return toPascalCase(str);
}
