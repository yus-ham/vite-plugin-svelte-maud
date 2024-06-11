import { Parser as AcornParser } from 'acorn';

export function read_script(parser, start, attributes) {
    const acorn = new AcornParser({
		ecmaVersion: 'latest',
		allowImportExportEverywhere: true,
	}, parser.template.slice(parser.index - 1))
    // start token
    acorn.getToken();

    const ast = acorn.parseBlock();
    ast.type = 'Program';
	ast.start = parser.index;
	ast.end += parser.index - 2; // remove outer braces
	return {
		type: 'Script',
		start,
		end: ast.end,
		content: ast,
		parent: null,
		// @ts-ignore
		attributes,
	}
}
