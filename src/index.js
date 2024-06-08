import element from './parser-state/element.js';
import text from './parser-state/text.js';
import blade from './parser-state/blade.js';

export default function plugin() {
    return {
        state(parser) {
            parser.allow_whitespace();

            if (parser.match('<')) {
                return;
            }

            if (parser.match('"') || parser.match('r#"')) {
                return text;
            }

            if (parser.match('@') || parser.match('(')) {
                return blade;
            }

            if (parser.match('{')) {
                parser.index++;
            }

            return element;
        },
    }
}
