<script lang="ts">
	import { promptSearchTerm } from '$lib/stores/searchTerm';
	import type { Prompt } from '$lib/types/prompt';
	import Icon from '@iconify/svelte';
	import PromptModal from './PromptModal.svelte';
	import { prompts } from '$lib/stores/prompt';

	export let prompt: Prompt;

	let showModal = false;
	let isRenaming = false;
	let isDeleting = false;
	let renameValue = '';

	function handleUpdate(prompt: Prompt) {
		prompts.update((prompts) => prompts.map((p) => (p.id === prompt.id ? prompt : p)));
		promptSearchTerm.set('');
	}

	function handleOpenDeleteModal(e: MouseEvent) {
		e.stopPropagation();
		isDeleting = true;
		isRenaming = false;
	}

	function handleDelete(e: MouseEvent) {
		e.stopPropagation();

		if (isDeleting) {
			prompts.update((prompts) => prompts.filter((p) => p.id !== prompt.id));
			promptSearchTerm.set('');
		}

		isDeleting = false;
	}

	function handleCancelDelete(e: MouseEvent) {
		e.stopPropagation();
		isDeleting = false;
	}

	function handleDragStart(e: DragEvent) {
		if (e.dataTransfer) e.dataTransfer.setData('prompt', JSON.stringify(prompt));
	}
</script>

<div class="relative flex items-center">
	<button
		class="flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200 hover:bg-[#343541]/90"
		draggable="true"
		on:click={(e) => {
			e.stopPropagation();
			showModal = true;
		}}
		on:dragstart={handleDragStart}
		on:mouseleave={() => {
			isDeleting = false;
			isRenaming = false;
			renameValue = '';
		}}
	>
		<Icon icon="tabler:bulb-filled" width={18} height={18} />

		<div
			class="relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all pr-4 text-left text-[12.5px] leading-3"
		>
			{prompt.name}
		</div>
	</button>

	{#if isDeleting || isRenaming}
		<div class="absolute z-10 flex text-gray-300 right-1">
			<button
				class="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
				on:click={handleDelete}
			>
				<Icon icon="tabler:check" width={18} height={18} />
			</button>
			<button
				class="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
				on:click={handleCancelDelete}
			>
				<Icon icon="tabler:x" width={18} height={18} />
			</button>
		</div>
	{/if}

	{#if !isDeleting && !isRenaming}
		<div class="absolute z-10 flex text-gray-300 right-1">
			<button
				class="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
				on:click={handleOpenDeleteModal}
			>
				<Icon icon="tabler:trash" width={18} height={18} />
			</button>
		</div>
	{/if}

	{#if showModal}
		<PromptModal {prompt} onClose={() => (showModal = false)} onUpdatePrompt={handleUpdate} />
	{/if}
</div>
