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

const WORD_PATTERN = /[\p{L}\p{Nd}_-]+/u;
const WORD_PATTERN_GLOBAL = /[\p{L}\p{Nd}_-]+/gu;
const LETTER_PATTERN = /[\p{L}]/u;

function getWordRangeAtPosition(document: vscode.TextDocument, position: vscode.Position): vscode.Range | undefined {
  return document.getWordRangeAtPosition(position, WORD_PATTERN);
}

function hasLetter(text: string): boolean {
  return LETTER_PATTERN.test(text);
}

type TextEdit = { range: vscode.Range; newText: string };

function applyEdits(editor: vscode.TextEditor, edits: TextEdit[]): Thenable<boolean> | undefined {
  if (edits.length === 0) return;
  return editor.edit((editBuilder) => {
    for (const { range, newText } of edits) {
      editBuilder.replace(range, newText);
    }
  });
}

function isValidWordPosition(document: vscode.TextDocument, position: vscode.Position): boolean {
  const wordRange = getWordRangeAtPosition(document, position);
  if (!wordRange || position.isEqual(wordRange.end)) return false;
  return hasLetter(document.getText(wordRange));
}

function transformWords(text: string, transform: (word: string) => string): string {
  return text.replace(WORD_PATTERN_GLOBAL, (match) => (hasLetter(match) ? transform(match) : match));
}

function collectEdits(
  document: vscode.TextDocument,
  selections: readonly vscode.Selection[],
  transform: (text: string) => string
): TextEdit[] {
  return selections
    .filter((selection) => !selection.isEmpty)
    .map((selection) => {
      const text = document.getText(selection);
      const newText = transform(text);
      return { range: selection, newText, text };
    })
    .filter(({ newText, text }) => newText !== text)
    .map(({ range, newText }) => ({ range, newText }));
}

function findNextWordStart(document: vscode.TextDocument, position: vscode.Position): vscode.Position | undefined {
  const text = document.getText();
  WORD_PATTERN_GLOBAL.lastIndex = document.offsetAt(position);
  let match = WORD_PATTERN_GLOBAL.exec(text);
  while (match) {
    if (hasLetter(match[0])) return document.positionAt(match.index);
    match = WORD_PATTERN_GLOBAL.exec(text);
  }
}

function transformSelection(
  editor: vscode.TextEditor,
  transform: (text: string) => string
): Thenable<boolean> | undefined {
  const { document, selections } = editor;
  const ranges = getSelectionRanges(document, selections);
  const rangeSelections = ranges.map((range) => new vscode.Selection(range.start, range.end));
  const edits = collectEdits(document, rangeSelections, transform);
  return applyEdits(editor, edits);
}

function getSelectionRanges(document: vscode.TextDocument, selections: readonly vscode.Selection[]): vscode.Range[] {
  const ranges: vscode.Range[] = [];
  for (const selection of selections) {
    if (!selection.isEmpty) {
      ranges.push(selection);
      continue;
    }
    const wordRange = getWordRangeAtPosition(document, selection.active);
    if (wordRange) ranges.push(wordRange);
  }
  return ranges;
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

    const { document, selections } = editor;

    const hasSelection = selections.some((s) => !s.isEmpty);

    if (hasSelection) {
      const edits = collectEdits(document, selections, (text) => transformWords(text, transform));
      await applyEdits(editor, edits);
      return;
    }

    const needsMove = selections.some((selection) => !isValidWordPosition(document, selection.active));

    if (needsMove) {
      const nextSelections = selections.map((selection) => {
        const position = selection.active;
        if (isValidWordPosition(document, position)) return selection;
        const nextStart = findNextWordStart(document, position);
        return nextStart ? new vscode.Selection(nextStart, nextStart) : selection;
      });

      editor.selections = nextSelections;
      if (!editor.selections.some((selection) => isValidWordPosition(document, selection.active))) return;
    }

    await vscode.commands.executeCommand("cursorWordPartRightSelect");
    const newSelections = editor.selections;

    const edits = collectEdits(document, newSelections, (text) => (hasLetter(text) ? transform(text) : text));
    await applyEdits(editor, edits);
    editor.selections = editor.selections.map((selection) => new vscode.Selection(selection.active, selection.active));
  };
}

export function deactivate() {}
