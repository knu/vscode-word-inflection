import * as vscode from "vscode";
import {
  toSnakeCase,
  toScreamingSnakeCase,
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toCapitalSnakeCase,
  cycle,
  toggle,
  cycleSnakeKebab,
  cycleCamelCase,
  capitalize,
  upcase,
  downcase,
  InflectionStyle,
} from "./inflection";

const WORD_PATTERN = /[\w-]+/;

function getWordRangeAtPosition(document: vscode.TextDocument, position: vscode.Position): vscode.Range | undefined {
  return document.getWordRangeAtPosition(position, WORD_PATTERN);
}

function transformSelection(
  editor: vscode.TextEditor,
  transform: (text: string) => string
): Thenable<boolean> | undefined {
  const document = editor.document;
  const selections = editor.selections;

  const edits: { range: vscode.Range; newText: string }[] = [];

  for (const selection of selections) {
    let range: vscode.Range;
    if (selection.isEmpty) {
      const wordRange = getWordRangeAtPosition(document, selection.active);
      if (!wordRange) continue;
      range = wordRange;
    } else {
      range = selection;
    }

    const text = document.getText(range);
    const newText = transform(text);
    if (newText !== text) {
      edits.push({ range, newText });
    }
  }

  if (edits.length === 0) return;

  return editor.edit((editBuilder) => {
    for (const { range, newText } of edits) {
      editBuilder.replace(range, newText);
    }
  });
}

function createCycleCommand(style: InflectionStyle) {
  return () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    transformSelection(editor, (text) => cycle(text, style));
  };
}

function createTransformCommand(transform: (text: string) => string) {
  return () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    transformSelection(editor, transform);
  };
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("stringInflection.cycle", createCycleCommand("all")),
    vscode.commands.registerCommand("stringInflection.cycleRuby", createCycleCommand("ruby")),
    vscode.commands.registerCommand("stringInflection.cyclePython", createCycleCommand("python")),
    vscode.commands.registerCommand("stringInflection.cycleElixir", createCycleCommand("elixir")),
    vscode.commands.registerCommand("stringInflection.cycleJava", createCycleCommand("java")),
    vscode.commands.registerCommand("stringInflection.cycleSnakeKebab", createTransformCommand(cycleSnakeKebab)),
    vscode.commands.registerCommand("stringInflection.cycleCamelCase", createTransformCommand(cycleCamelCase)),
    vscode.commands.registerCommand("stringInflection.toSnakeCase", createTransformCommand(toSnakeCase)),
    vscode.commands.registerCommand(
      "stringInflection.toScreamingSnakeCase",
      createTransformCommand(toScreamingSnakeCase)
    ),
    vscode.commands.registerCommand("stringInflection.toPascalCase", createTransformCommand(toPascalCase)),
    vscode.commands.registerCommand("stringInflection.toCamelCase", createTransformCommand(toCamelCase)),
    vscode.commands.registerCommand("stringInflection.toKebabCase", createTransformCommand(toKebabCase)),
    vscode.commands.registerCommand("stringInflection.toCapitalSnakeCase", createTransformCommand(toCapitalSnakeCase)),
    vscode.commands.registerCommand("stringInflection.toggle", createTransformCommand(toggle)),
    vscode.commands.registerCommand("stringInflection.wordPartCapitalize", createWordPartCommand(capitalize)),
    vscode.commands.registerCommand("stringInflection.wordPartUpcase", createWordPartCommand(upcase)),
    vscode.commands.registerCommand("stringInflection.wordPartDowncase", createWordPartCommand(downcase))
  );
}

function createWordPartCommand(transform: (text: string) => string) {
  return async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const document = editor.document;
    const selections = editor.selections;

    const hasSelection = selections.some((s) => !s.isEmpty);

    if (hasSelection) {
      const edits: { range: vscode.Range; newText: string }[] = [];
      for (const selection of selections) {
        if (selection.isEmpty) continue;
        const text = document.getText(selection);
        const newText = transform(text);
        if (newText !== text) {
          edits.push({ range: selection, newText });
        }
      }
      if (edits.length > 0) {
        await editor.edit((editBuilder) => {
          for (const { range, newText } of edits) {
            editBuilder.replace(range, newText);
          }
        });
      }
      return;
    }

    const positions = selections.map((s) => s.active);
    const needsMove = positions.some((position) => {
      const wordRange = getWordRangeAtPosition(document, position);
      return !wordRange || position.isEqual(wordRange.end);
    });

    if (needsMove) {
      await vscode.commands.executeCommand("cursorWordPartRight");
      const movedPositions = editor.selections.map((s) => s.active);
      const validPositions = movedPositions.filter((position) => {
        const wordRange = getWordRangeAtPosition(document, position);
        return wordRange && !position.isEqual(wordRange.end);
      });
      if (validPositions.length === 0) return;
    }

    await vscode.commands.executeCommand("cursorWordPartRightSelect");
    const newSelections = editor.selections;

    const edits: { range: vscode.Range; newText: string }[] = [];
    for (const selection of newSelections) {
      const partText = document.getText(selection);
      const newText = transform(partText);
      if (newText !== partText) {
        edits.push({ range: selection, newText });
      }
    }

    if (edits.length > 0) {
      await editor.edit((editBuilder) => {
        for (const { range, newText } of edits) {
          editBuilder.replace(range, newText);
        }
      });
    }
  };
}

export function deactivate() {}
