import parserPlugin from "../src/index.js";
import { compile } from "svelte/compiler";
import { Parser } from "./node_modules/svelte/src/compiler/phases/1-parse";
import { c as createServer } from "./node_modules/vite/dist/node/chunks/dep-DEPSZ3SS.js";
import { walk } from "zimmerframe";
import { readFileSync } from "fs";


const render_method = 'mount'; // hydrate|mount
const entry_scipt = `${import.meta.dirname}/src/index.maud`;


/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		{
			name: 'main-server',
			async configureServer(vite) {
				if (!Bun.env.SECONDARY_SERVER) {
					Bun.env.SECONDARY_SERVER = true
					const secondary_server = await createServer({})

					Bun.argv.find((arg) => {
						if (arg.startsWith('--port=')) {
							secondary_server.port = arg.split('=')[1] - 0
							return true
						}
						if (arg.startsWith('--port')) {
							Bun.argv.port = true
							return
						}
						if (Bun.argv.port) {
							secondary_server.port = arg - 0
							return true
						}
					})

					secondary_server.listen((secondary_server.port || 5173) + 1)

					vite.middlewares.use(async (req, res) => {

						if (req.url.endsWith('.maud')) {
							const result = compile(await Bun.file(import.meta.dirname + req.url).text(), {
								parserPlugin,
								generate: render_method === 'mount' ? 'client' : 'server',
								modernAst: true,
								runes: true,
								// dev: false,
							})

							res.setHeader('content-type', 'text/javascript')
							res.end(
								result.js.code
									.replace('svelte/internal/disclose-version', `/@fs${import.meta.dirname}/node_modules/svelte/src/internal/disclose-version.js`)
									.replace('svelte/internal/client', `/@fs${import.meta.dirname}/node_modules/svelte/src/internal/client/index.js`)
									.replace('svelte/internal/server', `/@fs${import.meta.dirname}/node_modules/svelte/src/internal/server/index.js`)
							)
							return;
						}

						if (req.url.length > 1) {
							return secondary_server.middlewares(req, res)
						}

						const source = readFileSync(entry_scipt, { encoding: 'utf8' })

						res.setHeader('content-type', 'text/html')
						res.end(parseMaud(source))
					})
				}
			}
		}
	],
};

export default config;


function parseMaud(source) {
	const parser = new Parser(source, {
		plugin: parserPlugin
	})

	const identifiers = {}

	const content = walk(parser.root, {}, {
		Fragment(node, { next }) {
			return next().nodes.join('')
		},
		ExpressionTag(node, { next }) {
			return next().expression;
		},
		Identifier(node, { next }) {
			return identifiers[node.name] || next()
		},
		RegularElement(node, { next }) {
			return `<${node.name}>${next().fragment}</${node.name}>`;
		},
		Text(node, { next }) {
			return node.data;
		},
	})

	const src = parser.root.instance.attributes.find((x) => x.name === 'src').value[0].raw
	const target = parser.root.instance.attributes.find((x) => x.name === 'target').value[0].raw

	return `<!DOCTYPE html><html>\n${content.fragment}\n<script type="module" src="/@vite/client"></script>\n<script type="module">
		import { ${render_method} as render } from '/@fs${import.meta.dirname}/node_modules/svelte/src/index-client.js';
		import app from '${src}';
		render(app, { target: ${target} });\n</script></html>`;
}