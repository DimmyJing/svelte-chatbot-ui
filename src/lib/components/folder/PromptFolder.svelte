<script lang="ts">
	import type { FolderInterface } from '$lib/types/folder';
	import Icon from '@iconify/svelte';
	import { promptSearchTerm } from '$lib/stores/searchTerm';
	import { prompts } from '$lib/stores/prompt';
	import PromptComponent from '../promptbar/components/PromptComponent.svelte';
	import { folders } from '$lib/stores/folder';

	export let currentFolder: FolderInterface;

	let isRenaming = false;
	let isOpen = false;
	let isDeleting = false;
	let renameValue = '';

	function handleEnterDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			folders.update((folders) =>
				folders.map((f) => {
					if (f.id === currentFolder.id) return { ...f, name: renameValue };
					return f;
				})
			);
			renameValue = '';
			isRenaming = false;
		}
	}

	function localHandeDrop(e: DragEvent) {
		if (e.dataTransfer) {
			isOpen = false;
			const prompt = JSON.parse(e.dataTransfer.getData('prompt'));
			prompts.update((prompts) =>
				prompts.map((p) => (p.id === prompt.id ? { ...prompt, folderID: currentFolder.id } : p))
			);
			(e.target as HTMLButtonElement).style.background = 'none';
		}
	}

	function handleRename() {
		folders.update((folders) =>
			folders.map((f) => {
				if (f.id === currentFolder.id) return { ...f, name: renameValue };
				return f;
			})
		);
		renameValue = '';
		isRenaming = false;
	}

	function allowDrop(e: DragEvent) {
		e.preventDefault();
	}

	const highlightDrop = (e: DragEvent) => {
		(e.target as HTMLButtonElement).style.background = '#343541';
	};

	const removeHighlight = (e: DragEvent) => {
		(e.target as HTMLButtonElement).style.background = 'none';
	};

	$: filteredPrompts = $prompts.filter((prompt) => prompt.folderID === currentFolder.id);

	$: isOpen = $promptSearchTerm !== '';
</script>

<div class="relative flex items-center">
	{#if isRenaming}
		<div class="flex w-full items-center gap-3 bg-[#343541]/90 p-3">
			{#if isOpen}
				<Icon icon="tabler:caret-down" height={18} width={18} />
			{:else}
				<Icon icon="tabler:caret-right" height={18} width={18} />
			{/if}
			<input
				class="mr-12 flex-1 overflow-hidden overflow-ellipsis border-neutral-400 bg-transparent text-left text-[12.5px] leading-3 text-white outline-none focus:border-neutral-100"
				type="text"
				bind:value={renameValue}
				on:keydown={handleEnterDown}
			/>
		</div>
	{:else}
		<button
			class="flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200 hover:bg-[#343541]/90"
			on:click={() => (isOpen = !isOpen)}
			on:drop={localHandeDrop}
			on:dragover={allowDrop}
			on:dragenter={highlightDrop}
			on:dragleave={removeHighlight}
		>
			{#if isOpen}
				<Icon icon="tabler:caret-down" height={18} width={18} />
			{:else}
				<Icon icon="tabler:caret-right" height={18} width={18} />
			{/if}

			<div
				class="relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all text-left text-[12.5px] leading-3"
			>
				{currentFolder.name}
			</div>
		</button>
	{/if}

	{#if isDeleting || isRenaming}
		<div class="absolute z-10 flex text-gray-300 right-1">
			<button
				class="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
				on:click={(e) => {
					e.stopPropagation();

					if (isDeleting) {
						folders.update((folders) => folders.filter((f) => f.id !== currentFolder.id));
						prompts.update((prompts) =>
							prompts.map((p) => {
								if (p.folderID === currentFolder.id) return { ...p, folderID: undefined };
								return p;
							})
						);
					} else if (isRenaming) handleRename();

					isDeleting = false;
					isRenaming = false;
				}}
			>
				<Icon icon="tabler:check" width={18} height={18} />
			</button>
			<button
				class="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
				on:click={(e) => {
					e.stopPropagation();
					isDeleting = false;
					isRenaming = false;
				}}
			>
				<Icon icon="tabler:x" width={18} height={18} />
			</button>
		</div>
	{/if}

	{#if !isDeleting && !isRenaming}
		<div class="absolute z-10 flex text-gray-300 right-1">
			<button
				class="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
				on:click={(e) => {
					e.stopPropagation();
					isRenaming = true;
					isDeleting = false;
					renameValue = currentFolder.name;
				}}
			>
				<Icon icon="tabler:pencil" width={18} height={18} />
			</button>
			<button
				class="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
				on:click={(e) => {
					e.stopPropagation();
					isDeleting = true;
					isRenaming = false;
				}}
			>
				<Icon icon="tabler:trash" width={18} height={18} />
			</button>
		</div>
	{/if}
</div>

{#if isOpen}
	{#each filteredPrompts as prompt}
		<div class="gap-2 pl-2 ml-5 border-1">
			<PromptComponent {prompt} />
		</div>
	{/each}
{/if}
