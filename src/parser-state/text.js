import { decode_character_references } from "svelte/compiler/parse-utils/html.js";

export default function text(parser) {
	const start = parser.index++;

	let is_multiline, data = '';

	if (parser.match('#"')) {
		parser.index += 2;
		is_multiline = true;
	}

	while (parser.index < parser.template.length && !parser.match('"')) {
		parser.match('\\') && parser.index++;
		data += parser.template[parser.index++];
	}

	/** @type {ReturnType<typeof parser.append<import('svelte/compiler').Text>>} */
	parser.append({
		type: 'Text',
		start,
		end: parser.index++,
		raw: data,
		data: decode_character_references(data, false),
	});

	try {
		is_multiline && parser.eat('#', true);
	} catch(e) {
		e.message = `Expected MULTILINE_STRING_TERMINATION ("#) but found (${parser.template.slice(parser.index - 1, parser.index + 2)})`;
		throw e;
	}
}
