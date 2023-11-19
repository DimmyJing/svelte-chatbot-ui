<script lang="ts">
	import { promptSearchTerm } from '$lib/stores/searchTerm';
	import { showPromptbar } from '$lib/stores/showChatbar';
	import Icon from '@iconify/svelte';
	import PromptFolders from '../promptbar/components/PromptFolders.svelte';
	import PromptSearch from '../search/PromptSearch.svelte';
	import type { Prompt } from '$lib/types/prompt';
	import PromptComponent from '../promptbar/components/PromptComponent.svelte';
	import { folders } from '$lib/stores/folder';
	import { v4 as uuidv4 } from 'uuid';
	import { prompts } from '$lib/stores/prompt';
	import { OpenAIModelID, OpenAIModels } from '$lib/types/openai';
	import { PUBLIC_DEFAULT_MODEL } from '$env/static/public';

	export let items: Prompt[];

	function allowDrop(e: DragEvent) {
		e.preventDefault();
	}

	function highlightDrop(e: DragEvent) {
		(e.target as HTMLDivElement).style.background = '#343541';
	}

	function removeHighlight(e: DragEvent) {
		(e.target as HTMLDivElement).style.background = 'none';
	}

	function onDrop(e: DragEvent) {
		if (e.dataTransfer) {
			const prompt = JSON.parse(e.dataTransfer.getData('prompt'));
			prompts.update((pt) =>
				pt.map((p) =>
					p.id === prompt.id
						? { ...prompt, folderID: (e.target as HTMLDivElement).dataset.folderID }
						: p
				)
			);
			promptSearchTerm.set('');
			(e.target as HTMLDivElement).style.background = 'none';
		}
	}

	function onTogglePromptbar() {
		showPromptbar.update((showPromptbar) => !showPromptbar);
	}

	function onCreatePrompt() {
		prompts.update((pt) => [
			...pt,
			{
				id: uuidv4(),
				name: `Prompt ${$prompts.length + 1}`,
				description: '',
				content: '',
				model: OpenAIModels[PUBLIC_DEFAULT_MODEL as OpenAIModelID]
			}
		]);
		promptSearchTerm.set('');
	}

	$: localPrompts = items.slice().reverse();
</script>

{#if $showPromptbar}
	<div>
		<div
			class={`fixed top-0 right-0 z-40 flex h-full w-[260px] flex-none flex-col space-y-2 bg-[#202123] p-2 text-[14px] transition-all sm:relative sm:top-0`}
		>
			<div class="flex items-center">
				<button
					class="text-sidebar flex w-[190px] flex-shrink-0 cursor-pointer select-none items-center gap-3 rounded-md border border-white/20 p-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
					on:click={onCreatePrompt}
				>
					<Icon icon="tabler:plus" height={16} width={16} />
					New prompt
				</button>

				<button
					class="flex items-center flex-shrink-0 gap-3 p-3 ml-2 text-sm text-white transition-colors duration-200 border rounded-md cursor-pointer border-white/20 hover:bg-gray-500/10"
					on:click={() =>
						folders.update((folders) => [
							...folders,
							{ id: uuidv4(), name: 'New folder', type: 'prompt' }
						])}
				>
					<Icon icon="tabler:folder-plus" height={16} width={16} />
				</button>
			</div>
			<PromptSearch placeholder={'Search...'} />

			<div class="flex-grow overflow-auto">
				{#if items.length > 0}
					<div class="flex pb-2 border-b border-white/20">
						<PromptFolders />
					</div>

					<div
						class="pt-2"
						on:drop={onDrop}
						on:dragover={allowDrop}
						on:dragenter={highlightDrop}
						on:dragleave={removeHighlight}
					>
						<div class="flex flex-col w-full gap-1">
							{#each localPrompts as prompt}
								<PromptComponent {prompt} />
							{/each}
						</div>
					</div>
				{:else}
					<div class="mt-8 text-center text-white opacity-50 select-none">
						<Icon icon="tabler:mist-off" class="mx-auto mb-3" width={24} height={24} />
						<span class="text-[14px] leading-normal">No data.</span>
					</div>
				{/if}
			</div>
		</div>
		<button
			class="fixed top-5 right-[270px] z-50 h-7 w-7 hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:right-[270px] sm:h-8 sm:w-8 sm:text-neutral-700"
			on:click={onTogglePromptbar}
		>
			<Icon icon="tabler:arrow-bar-right" width={24} height={24} />
		</button>
		<div
			on:click={onTogglePromptbar}
			on:keydown={onTogglePromptbar}
			class="absolute top-0 left-0 z-10 w-full h-full bg-black opacity-70 sm:hidden"
		/>
	</div>
{:else}
	<button
		class="fixed top-2.5 right-2 z-50 h-7 w-7 text-white hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:right-2 sm:h-8 sm:w-8 sm:text-neutral-700"
		on:click={onTogglePromptbar}
	>
		<Icon icon="tabler:arrow-bar-left" width={24} height={24} />
	</button>
{/if}
