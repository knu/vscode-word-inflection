# Word Inflection for VS Code

Convert symbol names between different naming conventions.

This is a port of [string-inflection](https://github.com/akicho8/string-inflection) for Emacs.

## Features

Convert the word at cursor (or selected text) between the following naming conventions:

- `snake_case`
- `SCREAMING_SNAKE_CASE` (a.k.a. `UPPER_SNAKE_CASE`)
- `PascalCase` (a.k.a. `UpperCamelCase`)
- `camelCase` (a.k.a. `lowerCamelCase`)
- `kebab-case` (a.k.a. `lisp-case`)
- `Capital_Snake_Case`

Unicode letters are supported in case conversions and detection.

## Commands

### Cycle Commands

Language-specific cycling through common naming conventions:

| Command | Cycle |
|---------|-------|
| `Word Inflection: Cycle (All Styles)` | `foo_bar` → `FOO_BAR` → `FooBar` → `fooBar` → `foo-bar` → `Foo_Bar` → `foo_bar` |
| `Word Inflection: Cycle (Ruby Style)` | `foo_bar` → `FOO_BAR` → `FooBar` → `foo_bar` |
| `Word Inflection: Cycle (Python Style)` | `foo_bar` → `FOO_BAR` → `FooBar` → `foo_bar` |
| `Word Inflection: Cycle (Elixir Style)` | `foo_bar` → `FooBar` → `foo_bar` |
| `Word Inflection: Cycle (Java Style)` | `fooBar` → `FOO_BAR` → `FooBar` → `fooBar` |
| `Word Inflection: Cycle (snake_case ⇔ kebab-case)` | `foo_bar` ⇔ `foo-bar` |
| `Word Inflection: Cycle (PascalCase ⇔ camelCase)` | `FooBar` ⇔ `fooBar` |

### Direct Transform Commands

Convert directly to a specific naming convention:

- `Word Inflection: To snake_case`
- `Word Inflection: To SCREAMING_SNAKE_CASE`
- `Word Inflection: To PascalCase`
- `Word Inflection: To camelCase`
- `Word Inflection: To kebab-case`
- `Word Inflection: To Capital_Snake_Case`

### Toggle Command

- `Word Inflection: Toggle` - Toggles between `snake_case` ↔ `PascalCase` ↔ `camelCase`

### Word Part Commands

Transform word parts (subwords).  These commands follow VS Code's WordPart navigation behavior (via `cursorWordPartRight`/`cursorWordPartRightSelect`).  They also search forward when the cursor is not on a word part and move to the end of the transformed part, matching Emacs `subword-capitalize`, `subword-upcase`, and `subword-downcase`.

- `Word Inflection: Word Part Capitalize` - Capitalize the word part (e.g., `NICE|Symbol` → `Nice|Symbol`)
- `Word Inflection: Word Part Upcase` - Upcase the word part (e.g., `nice|Symbol` → `NICE|Symbol`)
- `Word Inflection: Word Part Downcase` - Downcase the word part (e.g., `NICE|Symbol` → `nice|Symbol`)

The cursor moves to the end of the word part after transformation.

## Usage

1. Place the cursor on a symbol name, or select text
2. Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
3. Type "Word Inflection" and select the desired command

## Recommended Keybindings

Add these to your `keybindings.json` for quick access:

```json
{
  "key": "ctrl+shift+u",
  "command": "stringInflection.cycle",
  "when": "editorTextFocus"
}
```

## License

MIT

## Credits

This extension is a port of [string-inflection](https://github.com/akicho8/string-inflection) by akicho8.
