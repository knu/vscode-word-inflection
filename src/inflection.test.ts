import * as assert from "assert";
import {
  toSnakeCase,
  toScreamingSnakeCase,
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toCapitalSnakeCase,
  capitalize,
  upcase,
  downcase,
  isSymbol,
  isSnakeCase,
  isScreamingSnakeCase,
  isPascalCase,
  isCamelCase,
  isKebabCase,
  isCapitalSnakeCase,
  cycle,
  toggle,
  cycleSnakeKebab,
  cycleCamelCase,
} from "./inflection";

suite("Inflection Test Suite", () => {
  suite("toSnakeCase", () => {
    test("from PascalCase", () => {
      assert.strictEqual(toSnakeCase("FooBar"), "foo_bar");
      assert.strictEqual(toSnakeCase("FooBarBaz"), "foo_bar_baz");
    });

    test("from camelCase", () => {
      assert.strictEqual(toSnakeCase("fooBar"), "foo_bar");
      assert.strictEqual(toSnakeCase("fooBarBaz"), "foo_bar_baz");
    });

    test("from SCREAMING_SNAKE_CASE", () => {
      assert.strictEqual(toSnakeCase("FOO_BAR"), "foo_bar");
    });

    test("from kebab-case", () => {
      assert.strictEqual(toSnakeCase("foo-bar"), "foo_bar");
    });

    test("from Capital_Snake_Case", () => {
      assert.strictEqual(toSnakeCase("Foo_Bar"), "foo_bar");
    });

    test("handles consecutive uppercase", () => {
      assert.strictEqual(toSnakeCase("XMLParser"), "xml_parser");
      assert.strictEqual(toSnakeCase("parseXML"), "parse_xml");
      assert.strictEqual(toSnakeCase("HTMLElement"), "html_element");
    });

    test("handles single word", () => {
      assert.strictEqual(toSnakeCase("foo"), "foo");
      assert.strictEqual(toSnakeCase("FOO"), "foo");
      assert.strictEqual(toSnakeCase("Foo"), "foo");
    });

    test("handles numbers", () => {
      assert.strictEqual(toSnakeCase("foo2Bar"), "foo2_bar");
      assert.strictEqual(toSnakeCase("foo2bar"), "foo2bar");
    });
  });

  suite("toScreamingSnakeCase", () => {
    test("from various cases", () => {
      assert.strictEqual(toScreamingSnakeCase("fooBar"), "FOO_BAR");
      assert.strictEqual(toScreamingSnakeCase("foo_bar"), "FOO_BAR");
      assert.strictEqual(toScreamingSnakeCase("FooBar"), "FOO_BAR");
      assert.strictEqual(toScreamingSnakeCase("foo-bar"), "FOO_BAR");
    });
  });

  suite("toPascalCase", () => {
    test("from various cases", () => {
      assert.strictEqual(toPascalCase("foo_bar"), "FooBar");
      assert.strictEqual(toPascalCase("fooBar"), "FooBar");
      assert.strictEqual(toPascalCase("FOO_BAR"), "FooBar");
      assert.strictEqual(toPascalCase("foo-bar"), "FooBar");
    });

    test("handles single word", () => {
      assert.strictEqual(toPascalCase("foo"), "Foo");
    });
  });

  suite("toCamelCase", () => {
    test("from various cases", () => {
      assert.strictEqual(toCamelCase("foo_bar"), "fooBar");
      assert.strictEqual(toCamelCase("FooBar"), "fooBar");
      assert.strictEqual(toCamelCase("FOO_BAR"), "fooBar");
      assert.strictEqual(toCamelCase("foo-bar"), "fooBar");
    });

    test("handles single word", () => {
      assert.strictEqual(toCamelCase("foo"), "foo");
      assert.strictEqual(toCamelCase("FOO"), "foo");
    });
  });

  suite("toKebabCase", () => {
    test("from various cases", () => {
      assert.strictEqual(toKebabCase("foo_bar"), "foo-bar");
      assert.strictEqual(toKebabCase("fooBar"), "foo-bar");
      assert.strictEqual(toKebabCase("FooBar"), "foo-bar");
      assert.strictEqual(toKebabCase("FOO_BAR"), "foo-bar");
    });
  });

  suite("toCapitalSnakeCase", () => {
    test("from various cases", () => {
      assert.strictEqual(toCapitalSnakeCase("foo_bar"), "Foo_Bar");
      assert.strictEqual(toCapitalSnakeCase("fooBar"), "Foo_Bar");
      assert.strictEqual(toCapitalSnakeCase("FooBar"), "Foo_Bar");
      assert.strictEqual(toCapitalSnakeCase("FOO_BAR"), "Foo_Bar");
      assert.strictEqual(toCapitalSnakeCase("foo-bar"), "Foo_Bar");
    });
  });

  suite("capitalize/upcase/downcase", () => {
    test("capitalize", () => {
      assert.strictEqual(capitalize("foo"), "Foo");
      assert.strictEqual(capitalize("FOO"), "Foo");
      assert.strictEqual(capitalize("fOO"), "Foo");
      assert.strictEqual(capitalize(""), "");
    });

    test("upcase", () => {
      assert.strictEqual(upcase("foo"), "FOO");
      assert.strictEqual(upcase("FooBar"), "FOOBAR");
    });

    test("downcase", () => {
      assert.strictEqual(downcase("FOO"), "foo");
      assert.strictEqual(downcase("FooBar"), "foobar");
    });
  });

  suite("Detection functions", () => {
    test("isSymbol", () => {
      assert.strictEqual(isSymbol("foo"), true);
      assert.strictEqual(isSymbol("foo123"), true);
      assert.strictEqual(isSymbol("foo_bar"), false);
      assert.strictEqual(isSymbol("FooBar"), false);
    });

    test("isSnakeCase", () => {
      assert.strictEqual(isSnakeCase("foo_bar"), true);
      assert.strictEqual(isSnakeCase("foo"), true);
      assert.strictEqual(isSnakeCase("foo_bar_baz"), true);
      assert.strictEqual(isSnakeCase("FooBar"), false);
      assert.strictEqual(isSnakeCase("foo-bar"), false);
    });

    test("isScreamingSnakeCase", () => {
      assert.strictEqual(isScreamingSnakeCase("FOO_BAR"), true);
      assert.strictEqual(isScreamingSnakeCase("FOO"), true);
      assert.strictEqual(isScreamingSnakeCase("foo_bar"), false);
      assert.strictEqual(isScreamingSnakeCase("FooBar"), false);
    });

    test("isPascalCase", () => {
      assert.strictEqual(isPascalCase("FooBar"), true);
      assert.strictEqual(isPascalCase("Foo"), true);
      assert.strictEqual(isPascalCase("fooBar"), false);
      assert.strictEqual(isPascalCase("FOO"), false);
      assert.strictEqual(isPascalCase("foo"), false);
    });

    test("isCamelCase", () => {
      assert.strictEqual(isCamelCase("fooBar"), true);
      assert.strictEqual(isCamelCase("fooBarBaz"), true);
      assert.strictEqual(isCamelCase("FooBar"), false);
      assert.strictEqual(isCamelCase("foo"), false);
      assert.strictEqual(isCamelCase("foo_bar"), false);
    });

    test("isKebabCase", () => {
      assert.strictEqual(isKebabCase("foo-bar"), true);
      assert.strictEqual(isKebabCase("foo"), false);
      assert.strictEqual(isKebabCase("foo_bar"), false);
    });

    test("isCapitalSnakeCase", () => {
      assert.strictEqual(isCapitalSnakeCase("Foo_Bar"), true);
      assert.strictEqual(isCapitalSnakeCase("Foo_Bar_Baz"), true);
      assert.strictEqual(isCapitalSnakeCase("foo_bar"), false);
      assert.strictEqual(isCapitalSnakeCase("FooBar"), false);
    });
  });

  suite("cycle", () => {
    suite("all style", () => {
      test("cycles through all styles", () => {
        // foo_bar => FOO_BAR => FooBar => fooBar => foo-bar => Foo_Bar => foo_bar
        assert.strictEqual(cycle("foo_bar", "all"), "FOO_BAR");
        assert.strictEqual(cycle("FOO_BAR", "all"), "FooBar");
        assert.strictEqual(cycle("FooBar", "all"), "fooBar");
        assert.strictEqual(cycle("fooBar", "all"), "foo-bar");
        assert.strictEqual(cycle("foo-bar", "all"), "Foo_Bar");
        assert.strictEqual(cycle("Foo_Bar", "all"), "foo_bar");
      });

      test("simple symbol starts cycle", () => {
        assert.strictEqual(cycle("foo", "all"), "FOO");
      });
    });

    suite("ruby style", () => {
      test("cycles through ruby styles", () => {
        // foo_bar => FOO_BAR => FooBar => foo_bar
        assert.strictEqual(cycle("foo_bar", "ruby"), "FOO_BAR");
        assert.strictEqual(cycle("FOO_BAR", "ruby"), "FooBar");
        assert.strictEqual(cycle("FooBar", "ruby"), "foo_bar");
      });
    });

    suite("python style", () => {
      test("cycles through python styles (same as ruby)", () => {
        assert.strictEqual(cycle("foo_bar", "python"), "FOO_BAR");
        assert.strictEqual(cycle("FOO_BAR", "python"), "FooBar");
        assert.strictEqual(cycle("FooBar", "python"), "foo_bar");
      });
    });

    suite("elixir style", () => {
      test("cycles through elixir styles", () => {
        // foo_bar => FooBar => foo_bar
        assert.strictEqual(cycle("foo_bar", "elixir"), "FooBar");
        assert.strictEqual(cycle("FooBar", "elixir"), "foo_bar");
      });
    });

    suite("java style", () => {
      test("cycles through java styles", () => {
        // fooBar => FOO_BAR => FooBar => fooBar
        assert.strictEqual(cycle("fooBar", "java"), "FOO_BAR");
        assert.strictEqual(cycle("FOO_BAR", "java"), "FooBar");
        assert.strictEqual(cycle("FooBar", "java"), "fooBar");
      });
    });
  });

  suite("toggle", () => {
    test("toggles between snake/Pascal/camel", () => {
      assert.strictEqual(toggle("foo_bar"), "FooBar");
      assert.strictEqual(toggle("FooBar"), "fooBar");
      assert.strictEqual(toggle("fooBar"), "foo_bar");
    });
  });

  suite("cycleSnakeKebab", () => {
    test("cycles between snake_case and kebab-case", () => {
      assert.strictEqual(cycleSnakeKebab("foo_bar"), "foo-bar");
      assert.strictEqual(cycleSnakeKebab("foo-bar"), "foo_bar");
    });
  });

  suite("cycleCamelCase", () => {
    test("cycles between PascalCase and camelCase", () => {
      assert.strictEqual(cycleCamelCase("FooBar"), "fooBar");
      assert.strictEqual(cycleCamelCase("fooBar"), "FooBar");
    });
  });
});
