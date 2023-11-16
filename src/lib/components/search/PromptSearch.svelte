<script lang="ts">
	import { promptSearchTerm } from '$lib/stores/searchTerm';
	import Icon from '@iconify/svelte';

	export let placeholder: string;
</script>

<div class="relative flex items-center">
	<input
		class="w-full flex-1 rounded-md border border-neutral-600 bg-[#202123] px-4 py-3 pr-10 text-[14px] leading-3 text-white"
		type="text"
		{placeholder}
		bind:value={$promptSearchTerm}
	/>

	{#if $promptSearchTerm}
		<button
			class="absolute right-4 text-neutral-300 hover:text-neutral-400"
			on:click={() => promptSearchTerm.set('')}
		>
			<Icon icon="tabler:x" width={18} height={18} />
		</button>
	{/if}
</div>
