// Serialise the content model back into a js/data/content.js module.
// Runs in the browser (editor) and in Node (round-trip test).
//
// Output rules, to match the hand-authored file:
//   * multi-line strings use backtick literals; single-line use single quotes
//   * empty strings, nulls and empty arrays are omitted
//   * false booleans are omitted (they default to false on the site)
//   * short all-scalar objects and arrays are written on one line

const ind = (n) => '  '.repeat(n);

function strLit(s) {
  if (s.includes('\n')) {
    return '`' + s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`';
  }
  return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function isEmpty(v) {
  return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0) || v === false;
}

function entries(obj) {
  return Object.entries(obj).filter(([, v]) => !isEmpty(v));
}

function value(v, depth) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean' || typeof v === 'number') return String(v);
  if (typeof v === 'string') return strLit(v);
  if (Array.isArray(v)) return array(v, depth);
  return object(v, depth);
}

function array(a, depth) {
  if (!a.length) return '[]';
  const scalar = a.every((x) => typeof x === 'string' && !x.includes('\n'));
  if (scalar) {
    const inline = '[' + a.map((x) => strLit(x)).join(', ') + ']';
    if (inline.length < 92) return inline;
  }
  return '[\n' + a.map((x) => ind(depth + 1) + value(x, depth + 1) + ',').join('\n') + '\n' + ind(depth) + ']';
}

function object(o, depth) {
  const es = entries(o);
  if (!es.length) return '{}';
  const flat = es.every(([, v]) => typeof v !== 'object' || v === null) && !es.some(([, v]) => typeof v === 'string' && v.includes('\n'));
  if (flat) {
    const inline = '{ ' + es.map(([k, v]) => `${key(k)}: ${value(v, depth)}`).join(', ') + ' }';
    if (inline.length < 100) return inline;
  }
  return '{\n' + es.map(([k, v]) => `${ind(depth + 1)}${key(k)}: ${value(v, depth + 1)},`).join('\n') + '\n' + ind(depth) + '}';
}

const IDENT = /^[a-zA-Z_$][\w$]*$/;
const key = (k) => (IDENT.test(k) ? k : strLit(k));

function exportArray(name, arr) {
  if (!arr.length) return `export const ${name} = [];\n`;
  return `export const ${name} = [\n` + arr.map((o) => ind(1) + object(o, 1) + ',').join('\n') + `\n];\n`;
}

function exportObject(name, obj) {
  const es = Object.entries(obj);
  if (!es.length) return `export const ${name} = {};\n`;
  return `export const ${name} = {\n` + es.map(([k, v]) => `${ind(1)}${key(k)}: ${value(v, 1)},`).join('\n') + `\n};\n`;
}

const HEADER = `// ============================================================================
// Hexworks LLC — site content
//
// Edited with the content editor (open editor.html on the local dev server),
// or by hand. To publish, save this file and push.
//   * long text fields are Markdown
//   * put images in assets/ and reference them as 'assets/your-image.jpg'
//   * everything here is public — it ships to every visitor's browser
// See README.md → "Adding content".
// ============================================================================
`;

export function serializeModule(data) {
  return [
    HEADER,
    exportArray('categories', data.categories || []),
    exportObject('technologies', data.technologies || {}),
    exportArray('projects', data.projects || []),
    exportArray('products', data.products || []),
    exportArray('ideas', data.ideas || []),
    exportArray('notes', data.notes || []),
  ].join('\n');
}
