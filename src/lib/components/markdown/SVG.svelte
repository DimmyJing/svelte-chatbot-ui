<script lang="ts">
	import { onMount } from 'svelte';

	let svgRef: SVGElement;

	onMount(() => {
		const html = svgRef.innerHTML;
		svgRef.innerHTML = html;
	});
</script>

<svg {...$$props} bind:this={svgRef}>
	<slot />
</svg>
