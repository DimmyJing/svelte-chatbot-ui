<script lang="ts">
	import remarkGfm from 'remark-gfm';
	import remarkMath from 'remark-math';
	import rehypeMathjax from 'rehype-mathjax/svg';
	import Markdown, {
		type ComponentsMap,
		type HastNode,
		type Plugin,
		type UnistNode
	} from 'svelte-exmarkdown';
	import type { Plugin as UnifiedPlugin } from 'unified';
	import { find, html } from 'property-information';
	import SVG from './SVG.svelte';

	export let md: string;
	export let components: ComponentsMap;

	const transform = (node: HastNode) => {
		const properties = node.properties;
		if (node.type !== 'element' || properties === undefined) return;
		Object.keys(properties).forEach((key) => {
			const fixedKey = find(html, key).attribute;
			if (fixedKey !== key) {
				properties[fixedKey] = properties[key];
				delete properties[key];
			}
		});
	};

	const visit = (visitor: (node: HastNode) => unknown, node: HastNode) => {
		visitor(node);
		node.children?.forEach((child) => visit(visitor, child));
	};

	const rehypeConvertProperty: UnifiedPlugin = () => {
		return (node: UnistNode, _file, done) => {
			try {
				visit(transform, node as HastNode);
				done();
			} catch (e) {
				if (e instanceof Error) return done(e);
				return done(new Error(String(e)));
			}
		};
	};

	const plugins: Plugin[] = [
		{ remarkPlugin: [remarkGfm] },
		{ remarkPlugin: [remarkMath] },
		{ rehypePlugin: [rehypeMathjax] },
		{ rehypePlugin: [rehypeConvertProperty] },
		{ renderer: { ...components, svg: SVG } }
	];
</script>

{#key md}
	<Markdown {md} {plugins} />
{/key}
