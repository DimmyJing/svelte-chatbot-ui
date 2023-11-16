<script lang="ts">
	import type { Prompt } from '$lib/types/prompt';

	export let prompts: Prompt[];
	export let activePromptIndex: number;
	export let onSelect: () => void;
	export let onMouseOver: (index: number) => void;
	export let promptListRef: HTMLUListElement;
</script>

<ul
	bind:this={promptListRef}
	class="z-10 max-h-52 w-full overflow-scroll rounded border border-black/10 bg-white shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:border-neutral-500 dark:bg-[#343541] dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]"
>
	{#each prompts as prompt, index}
		<li
			class={`${
				index === activePromptIndex ? 'bg-gray-200 dark:bg-[#202123] dark:text-black' : ''
			} cursor-pointer px-3 py-2 text-sm text-black dark:text-white`}
			on:click={(e) => {
				e.preventDefault();
				e.stopPropagation();
				onSelect();
			}}
			on:keydown={(e) => {
				e.preventDefault();
				e.stopPropagation();
				onSelect();
			}}
			on:mouseenter={() => onMouseOver(index)}
		>
			{prompt.name}
		</li>
	{/each}
</ul>
