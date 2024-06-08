import read_expression from 'svelte/compiler/parse-read/expression.js';


export default function blade(parser) {
	let start = parser.index;

	if (parser.eat('@')) {
		const control = parser.read_until(/ /)
		switch (control) {
			case 'html':
				const expression = read_expression(parser);
				parser.allow_whitespace();
		
				/** @type {ReturnType<typeof parser.append<import('svelte/compiler').HtmlTag>>} */
				parser.append({
					type: 'HtmlTag',
					start,
					end: parser.index,
					expression,
				});
				return;
		}
	}

	const expression = read_expression(parser);

	parser.allow_whitespace();
	/** @type {ReturnType<typeof parser.append<import('svelte/compiler').ExpressionTag>>} */
	parser.append({
		type: 'ExpressionTag',
		start,
		end: parser.index,
		expression,
		metadata: {
			contains_call_expression: false,
			dynamic: false
		}
	});
}


