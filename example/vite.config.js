import { svelte } from "@sveltejs/vite-plugin-svelte";
import parserPlugin from "../src/index.js";


Bun.env.VITE_RENDER_METHOD = 'mount'; // hydrate|mount

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [svelte({
		extensions: ['.maud'],
		compilerOptions: {
			parserPlugin,
			generate: Bun.env.VITE_RENDER_METHOD === 'hydrate' ? 'server' : 'client',
			modernAst: true,
			runes: true,
		},	
	})],
	optimizeDeps: {
		exclude: ['svelte']
	}
};

export default config;
