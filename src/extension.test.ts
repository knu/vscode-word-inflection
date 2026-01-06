import * as assert from "assert";
import * as vscode from "vscode";

async function withEditor(content: string, fn: (editor: vscode.TextEditor) => Thenable<void>) {
  const document = await vscode.workspace.openTextDocument({
    language: "plaintext",
    content,
  });
  const editor = await vscode.window.showTextDocument(document);
  await fn(editor);
}

async function runCommandAndWait(document: vscode.TextDocument, command: string) {
  const changed = new Promise<void>((resolve) => {
    const subscription = vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document !== document) return;
      subscription.dispose();
      resolve();
    });
  });
  await vscode.commands.executeCommand(command);
  await changed;
}

function assertSelections(
  editor: vscode.TextEditor,
  selections: Array<{ startLine: number; startCharacter: number; endLine: number; endCharacter: number }>
) {
  assert.strictEqual(editor.selections.length, selections.length);
  selections.forEach(({ startLine, startCharacter, endLine, endCharacter }, index) => {
    const selection = editor.selections[index];
    assert.strictEqual(selection.start.line, startLine);
    assert.strictEqual(selection.start.character, startCharacter);
    assert.strictEqual(selection.end.line, endLine);
    assert.strictEqual(selection.end.character, endCharacter);
  });
}

suite("Extension commands", () => {
  suiteSetup(async () => {
    const extension = vscode.extensions.getExtension("knu.word-inflection");
    await extension?.activate();
  });

  suite("transform commands", () => {
    test("transforms current word at cursor", async () => {
      const content = "fooBar bazQux";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 1, 0, 1);
        await runCommandAndWait(editor.document, "stringInflection.toSnakeCase");
        assert.strictEqual(editor.document.getText(), "foo_bar bazQux");
      });
    });

    test("transforms selected text", async () => {
      const content = "fooBar bazQux";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 0, 0, 13);
        await runCommandAndWait(editor.document, "stringInflection.toKebabCase");
        assert.strictEqual(editor.document.getText(), "foo-bar baz-qux");
      });
    });

    test("transforms to SCREAMING_SNAKE_CASE", async () => {
      const content = "fooBar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 2, 0, 2);
        await runCommandAndWait(editor.document, "stringInflection.toScreamingSnakeCase");
        assert.strictEqual(editor.document.getText(), "FOO_BAR");
      });
    });

    test("transforms to PascalCase", async () => {
      const content = "foo_bar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 2, 0, 2);
        await runCommandAndWait(editor.document, "stringInflection.toPascalCase");
        assert.strictEqual(editor.document.getText(), "FooBar");
      });
    });

    test("transforms to camelCase", async () => {
      const content = "foo_bar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 2, 0, 2);
        await runCommandAndWait(editor.document, "stringInflection.toCamelCase");
        assert.strictEqual(editor.document.getText(), "fooBar");
      });
    });

    test("transforms to Capital_Snake_Case", async () => {
      const content = "foo_bar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 2, 0, 2);
        await runCommandAndWait(editor.document, "stringInflection.toCapitalSnakeCase");
        assert.strictEqual(editor.document.getText(), "Foo_Bar");
      });
    });

    test("cycles word at cursor", async () => {
      const content = "foo_bar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 2, 0, 2);
        await runCommandAndWait(editor.document, "stringInflection.cycle");
        assert.strictEqual(editor.document.getText(), "FOO_BAR");
      });
    });

    test("cycles through multiple styles in order", async () => {
      const content = "foo_bar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 2, 0, 2);
        await runCommandAndWait(editor.document, "stringInflection.cycle");
        assert.strictEqual(editor.document.getText(), "FOO_BAR");
        await runCommandAndWait(editor.document, "stringInflection.cycle");
        assert.strictEqual(editor.document.getText(), "FooBar");
        await runCommandAndWait(editor.document, "stringInflection.cycle");
        assert.strictEqual(editor.document.getText(), "fooBar");
      });
    });

    test("toggles word at cursor", async () => {
      const content = "foo_bar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 1, 0, 1);
        await runCommandAndWait(editor.document, "stringInflection.toggle");
        assert.strictEqual(editor.document.getText(), "FooBar");
      });
    });

    test("toggles back and forth", async () => {
      const content = "foo_bar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 1, 0, 1);
        await runCommandAndWait(editor.document, "stringInflection.toggle");
        assert.strictEqual(editor.document.getText(), "FooBar");
        await runCommandAndWait(editor.document, "stringInflection.toggle");
        assert.strictEqual(editor.document.getText(), "fooBar");
        await runCommandAndWait(editor.document, "stringInflection.toggle");
        assert.strictEqual(editor.document.getText(), "foo_bar");
      });
    });

    test("cycles ruby style", async () => {
      const content = "foo_bar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 2, 0, 2);
        await runCommandAndWait(editor.document, "stringInflection.cycleRuby");
        assert.strictEqual(editor.document.getText(), "FOO_BAR");
        await runCommandAndWait(editor.document, "stringInflection.cycleRuby");
        assert.strictEqual(editor.document.getText(), "FooBar");
        await runCommandAndWait(editor.document, "stringInflection.cycleRuby");
        assert.strictEqual(editor.document.getText(), "foo_bar");
      });
    });

    test("cycles python style", async () => {
      const content = "foo_bar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 2, 0, 2);
        await runCommandAndWait(editor.document, "stringInflection.cyclePython");
        assert.strictEqual(editor.document.getText(), "FOO_BAR");
        await runCommandAndWait(editor.document, "stringInflection.cyclePython");
        assert.strictEqual(editor.document.getText(), "FooBar");
        await runCommandAndWait(editor.document, "stringInflection.cyclePython");
        assert.strictEqual(editor.document.getText(), "foo_bar");
      });
    });

    test("cycles elixir style", async () => {
      const content = "foo_bar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 2, 0, 2);
        await runCommandAndWait(editor.document, "stringInflection.cycleElixir");
        assert.strictEqual(editor.document.getText(), "FooBar");
        await runCommandAndWait(editor.document, "stringInflection.cycleElixir");
        assert.strictEqual(editor.document.getText(), "foo_bar");
      });
    });

    test("cycles java style", async () => {
      const content = "fooBar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 2, 0, 2);
        await runCommandAndWait(editor.document, "stringInflection.cycleJava");
        assert.strictEqual(editor.document.getText(), "FOO_BAR");
        await runCommandAndWait(editor.document, "stringInflection.cycleJava");
        assert.strictEqual(editor.document.getText(), "FooBar");
        await runCommandAndWait(editor.document, "stringInflection.cycleJava");
        assert.strictEqual(editor.document.getText(), "fooBar");
      });
    });

    test("cycles snake/kebab", async () => {
      const content = "foo_bar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 2, 0, 2);
        await runCommandAndWait(editor.document, "stringInflection.cycleSnakeKebab");
        assert.strictEqual(editor.document.getText(), "foo-bar");
        await runCommandAndWait(editor.document, "stringInflection.cycleSnakeKebab");
        assert.strictEqual(editor.document.getText(), "foo_bar");
      });
    });

    test("cycles camel/pascal", async () => {
      const content = "FooBar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 2, 0, 2);
        await runCommandAndWait(editor.document, "stringInflection.cycleCamelCase");
        assert.strictEqual(editor.document.getText(), "fooBar");
        await runCommandAndWait(editor.document, "stringInflection.cycleCamelCase");
        assert.strictEqual(editor.document.getText(), "FooBar");
      });
    });
  });

  suite("word part commands with selection", () => {
    test("capitalize applies to all words in selection", async () => {
      const content = "foo bar-baz.qux";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 0, 0, content.length);
        await vscode.commands.executeCommand("stringInflection.wordPartCapitalize");
        assert.strictEqual(editor.document.getText(), "Foo Bar-baz.Qux");
        assertSelections(editor, [{ startLine: 0, startCharacter: 0, endLine: 0, endCharacter: content.length }]);
      });
    });

    test("upcase applies to all words in selection", async () => {
      const content = "foo_bar baz-qux";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 0, 0, content.length);
        await vscode.commands.executeCommand("stringInflection.wordPartUpcase");
        assert.strictEqual(editor.document.getText(), "FOO_BAR BAZ-QUX");
        assertSelections(editor, [{ startLine: 0, startCharacter: 0, endLine: 0, endCharacter: content.length }]);
      });
    });

    test("downcase applies to all words across lines in selection", async () => {
      const content = "FOO BAR\nBaz-Qux";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 0, 1, 7);
        await vscode.commands.executeCommand("stringInflection.wordPartDowncase");
        assert.strictEqual(editor.document.getText(), "foo bar\nbaz-qux");
        assertSelections(editor, [{ startLine: 0, startCharacter: 0, endLine: 1, endCharacter: 7 }]);
      });
    });
  });

  suite("word part commands without selection", () => {
    test("moves to next word part when cursor is on whitespace", async () => {
      const content = "  fooBar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 0, 0, 0);
        await vscode.commands.executeCommand("stringInflection.wordPartUpcase");
        assert.strictEqual(editor.document.getText(), "  FOOBar");
        assertSelections(editor, [{ startLine: 0, startCharacter: 5, endLine: 0, endCharacter: 5 }]);
      });
    });

    test("moves to next word part when cursor is at word end", async () => {
      const content = "Foo barBaz";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 3, 0, 3);
        await vscode.commands.executeCommand("stringInflection.wordPartUpcase");
        assert.strictEqual(editor.document.getText(), "Foo BARBaz");
        assertSelections(editor, [{ startLine: 0, startCharacter: 7, endLine: 0, endCharacter: 7 }]);
      });
    });

    test("moves to next word part when cursor is after punctuation", async () => {
      const content = ".fooBar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 0, 0, 0);
        await vscode.commands.executeCommand("stringInflection.wordPartUpcase");
        assert.strictEqual(editor.document.getText(), ".FOOBar");
        assertSelections(editor, [{ startLine: 0, startCharacter: 4, endLine: 0, endCharacter: 4 }]);
      });
    });

    test("skips empty line to next word", async () => {
      const content = "\nFooBar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 0, 0, 0);
        await vscode.commands.executeCommand("stringInflection.wordPartUpcase");
        assert.strictEqual(editor.document.getText(), "\nFOOBar");
        assertSelections(editor, [{ startLine: 1, startCharacter: 3, endLine: 1, endCharacter: 3 }]);
      });
    });

    test("skips symbol-only line to next word", async () => {
      const content = "!!!\nfooBar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 0, 0, 0);
        await vscode.commands.executeCommand("stringInflection.wordPartCapitalize");
        assert.strictEqual(editor.document.getText(), "!!!\nFooBar");
        assertSelections(editor, [{ startLine: 1, startCharacter: 3, endLine: 1, endCharacter: 3 }]);
      });
    });

    test("does nothing and keeps cursor when no next word exists", async () => {
      const content = "!!!";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 0, 0, 0);
        await vscode.commands.executeCommand("stringInflection.wordPartUpcase");
        assert.strictEqual(editor.document.getText(), "!!!");
        assertSelections(editor, [{ startLine: 0, startCharacter: 0, endLine: 0, endCharacter: 0 }]);
      });
    });

    test("skips number-only word to next letter word", async () => {
      const content = "1234 fooBar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 0, 0, 0);
        await vscode.commands.executeCommand("stringInflection.wordPartUpcase");
        assert.strictEqual(editor.document.getText(), "1234 FOOBar");
        assertSelections(editor, [{ startLine: 0, startCharacter: 8, endLine: 0, endCharacter: 8 }]);
      });
    });

    test("moves to next word after completing word end", async () => {
      const content = "hello world";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 0, 0, 0);
        await vscode.commands.executeCommand("stringInflection.wordPartUpcase");
        await vscode.commands.executeCommand("stringInflection.wordPartUpcase");
        assert.strictEqual(editor.document.getText(), "HELLO WORLD");
        assertSelections(editor, [
          { startLine: 0, startCharacter: "HELLO WORLD".length, endLine: 0, endCharacter: "HELLO WORLD".length },
        ]);
      });
    });
  });

  suite("word part commands on word", () => {
    test("transforms current word part when cursor is on word", async () => {
      const content = "fooBar";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 0, 0, 0);
        await vscode.commands.executeCommand("stringInflection.wordPartCapitalize");
        assert.strictEqual(editor.document.getText(), "FooBar");
        assertSelections(editor, [{ startLine: 0, startCharacter: 3, endLine: 0, endCharacter: 3 }]);
      });
    });

    test("transforms later word part when cursor is within camelCase", async () => {
      const content = "fooBarBaz";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 3, 0, 3);
        await vscode.commands.executeCommand("stringInflection.wordPartUpcase");
        assert.strictEqual(editor.document.getText(), "fooBARBaz");
        assertSelections(editor, [{ startLine: 0, startCharacter: 6, endLine: 0, endCharacter: 6 }]);
      });
    });

    test("handles non-ASCII letters in word", async () => {
      const content = "naïveTest";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 0, 0, 0);
        await vscode.commands.executeCommand("stringInflection.wordPartUpcase");
        assert.strictEqual(editor.document.getText(), "NAÏVETest");
        assertSelections(editor, [{ startLine: 0, startCharacter: 5, endLine: 0, endCharacter: 5 }]);
      });
    });

    test("handles Japanese letters in word", async () => {
      const content = "日本語Test";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 0, 0, 0);
        await vscode.commands.executeCommand("stringInflection.wordPartUpcase");
        assert.strictEqual(editor.document.getText(), "日本語TEST");
        assertSelections(editor, [
          {
            startLine: 0,
            startCharacter: "日本語TEST".length,
            endLine: 0,
            endCharacter: "日本語TEST".length,
          },
        ]);
      });
    });

    test("handles dotted İ in word", async () => {
      const content = "İstanbulTest";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 0, 0, 0);
        await vscode.commands.executeCommand("stringInflection.wordPartDowncase");
        assert.strictEqual(editor.document.getText(), "i̇stanbulTest");
        assertSelections(editor, [
          { startLine: 0, startCharacter: "i̇stanbul".length, endLine: 0, endCharacter: "i̇stanbul".length },
        ]);
      });
    });

    test("capitalize handles non-ASCII letters in word", async () => {
      const content = "ábcDef";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 0, 0, 0);
        await vscode.commands.executeCommand("stringInflection.wordPartCapitalize");
        assert.strictEqual(editor.document.getText(), "ÁbcDef");
        assertSelections(editor, [{ startLine: 0, startCharacter: 3, endLine: 0, endCharacter: 3 }]);
      });
    });

    test("downcase handles non-ASCII letters in word", async () => {
      const content = "ÄBCDef";
      await withEditor(content, async (editor) => {
        editor.selection = new vscode.Selection(0, 0, 0, 0);
        await vscode.commands.executeCommand("stringInflection.wordPartDowncase");
        assert.strictEqual(editor.document.getText(), "äbcDef");
        assertSelections(editor, [{ startLine: 0, startCharacter: 3, endLine: 0, endCharacter: 3 }]);
      });
    });
  });

  suite("word part commands with multiple cursors", () => {
    test("applies transform to each cursor independently", async () => {
      const content = "fooBar bazQux";
      await withEditor(content, async (editor) => {
        editor.selections = [new vscode.Selection(0, 0, 0, 0), new vscode.Selection(0, 7, 0, 7)];
        await vscode.commands.executeCommand("stringInflection.wordPartUpcase");
        assert.strictEqual(editor.document.getText(), "FOOBar BAZQux");
        assertSelections(editor, [
          { startLine: 0, startCharacter: 3, endLine: 0, endCharacter: 3 },
          { startLine: 0, startCharacter: 10, endLine: 0, endCharacter: 10 },
        ]);
      });
    });

    test("moves each cursor to next word part when on whitespace", async () => {
      const content = "  fooBar   bazQux";
      await withEditor(content, async (editor) => {
        editor.selections = [new vscode.Selection(0, 0, 0, 0), new vscode.Selection(0, 9, 0, 9)];
        await vscode.commands.executeCommand("stringInflection.wordPartCapitalize");
        assert.strictEqual(editor.document.getText(), "  FooBar   BazQux");
        assertSelections(editor, [
          { startLine: 0, startCharacter: 5, endLine: 0, endCharacter: 5 },
          { startLine: 0, startCharacter: 14, endLine: 0, endCharacter: 14 },
        ]);
      });
    });

    test("prioritizes selections over cursors when mixed", async () => {
      const content = "fooBar bazQux";
      await withEditor(content, async (editor) => {
        editor.selections = [new vscode.Selection(0, 0, 0, 6), new vscode.Selection(0, 7, 0, 7)];
        await vscode.commands.executeCommand("stringInflection.wordPartUpcase");
        assert.strictEqual(editor.document.getText(), "FOOBAR bazQux");
        assertSelections(editor, [
          { startLine: 0, startCharacter: 0, endLine: 0, endCharacter: 6 },
          { startLine: 0, startCharacter: 7, endLine: 0, endCharacter: 7 },
        ]);
      });
    });
  });
});
