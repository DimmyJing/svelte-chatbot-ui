<script lang="ts">
	import {
		PUBLIC_DEFAULT_MODEL,
		PUBLIC_DEFAULT_SYSTEM_PROMPT,
		PUBLIC_DEFAULT_TEMPERATURE
	} from '$env/static/public';
	import { conversations, selectedConversation } from '$lib/stores/conversation';
	import { messageIsStreaming } from '$lib/stores/loading';
	import { searchTerm } from '$lib/stores/searchTerm';
	import type { Conversation } from '$lib/types/chat';
	import { OpenAIModelID, OpenAIModels } from '$lib/types/openai';
	import Icon from '@iconify/svelte';
	import { v4 as uuidv4 } from 'uuid';

	export let conversation: Conversation;

	let isRenaming = false;
	let isDeleting = false;

	let renameValue = '';

	function handleEnterDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			if ($selectedConversation) handleRename(conversation);
		}
	}

	function handleDragStart(e: DragEvent) {
		if (e.dataTransfer) {
			e.dataTransfer.setData('conversation', JSON.stringify(conversation));
		}
	}

	function handleRename(conversation: Conversation) {
		if (renameValue.trim().length > 0) {
			conversations.update((conversations) =>
				conversations.map((c) =>
					c.id === conversation.id
						? {
								...c,
								name: renameValue
						  }
						: c
				)
			);
			selectedConversation.set({
				...conversation,
				name: renameValue
			});
			renameValue = '';
			isRenaming = false;
		}
	}

	function handleConfirm(e: MouseEvent) {
		e.stopPropagation();
		if (isDeleting) {
			conversations.update((conversations) =>
				conversations.filter((c) => c.id !== conversation.id)
			);
			searchTerm.set('');
			if ($conversations.length > 0)
				selectedConversation.set($conversations[$conversations.length - 1]);
			else
				selectedConversation.set({
					id: uuidv4(),
					name: 'New Conversation',
					messages: [],
					model: OpenAIModels[PUBLIC_DEFAULT_MODEL as OpenAIModelID],
					prompt: PUBLIC_DEFAULT_SYSTEM_PROMPT,
					temperature: +PUBLIC_DEFAULT_TEMPERATURE
				});
		} else if (isRenaming) handleRename(conversation);
		isDeleting = false;
		isRenaming = false;
	}

	function handleCancel(e: MouseEvent) {
		e.stopPropagation();
		isDeleting = false;
		isRenaming = false;
	}

	function handleOpenRenameModal(e: MouseEvent) {
		e.stopPropagation();
		isRenaming = true;
		isDeleting = false;
		if ($selectedConversation) renameValue = $selectedConversation.name;
	}

	function handleOpenDeleteModal(e: MouseEvent) {
		e.stopPropagation();
		isDeleting = true;
		isRenaming = false;
	}
</script>

<div class="relative flex items-center">
	{#if isRenaming && $selectedConversation?.id === conversation.id}
		<div class="flex w-full items-center gap-3 rounded-lg bg-[#343541]/90 p-3">
			<Icon icon="tabler:message" width={18} height={18} />
			<input
				class="mr-12 flex-1 overflow-hidden overflow-ellipsis border-neutral-400 bg-transparent text-left text-[12.5px] leading-3 text-white outline-none focus:border-neutral-100"
				type="text"
				bind:value={renameValue}
				on:keydown={handleEnterDown}
			/>
		</div>
	{:else}
		<button
			class={`flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200 hover:bg-[#343541]/90 ${
				$messageIsStreaming ? 'disabled:cursor-not-allowed' : ''
			} ${$selectedConversation?.id === conversation.id ? 'bg-[#343541]/90' : ''}`}
			on:click={() => selectedConversation.set(conversation)}
			disabled={$messageIsStreaming}
			draggable="true"
			on:dragstart={handleDragStart}
		>
			<Icon icon="tabler:message" width={18} height={18} />
			<div
				class={`relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all text-left text-[12.5px] leading-3 ${
					$selectedConversation?.id === conversation.id ? 'pr-12' : 'pr-1'
				}`}
			>
				{conversation.name}
			</div>
		</button>
	{/if}

	{#if (isDeleting || isRenaming) && $selectedConversation?.id === conversation.id}
		<div class="absolute z-10 flex text-gray-300 right-1">
			<button
				class="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
				on:click={handleConfirm}
			>
				<Icon icon="tabler:check" width={18} height={18} />
			</button>
			<button
				class="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
				on:click={handleCancel}
			>
				<Icon icon="tabler:x" width={18} height={18} />
			</button>
		</div>
	{/if}

	{#if $selectedConversation?.id === conversation.id && !isDeleting && !isRenaming}
		<div class="absolute z-10 flex text-gray-300 right-1">
			<button
				class="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
				on:click={handleOpenRenameModal}
			>
				<Icon icon="tabler:pencil" width={18} height={18} />
			</button>
			<button
				class="min-w-[20px] p-1 text-neutral-400 hover:text-neutral-100"
				on:click={handleOpenDeleteModal}
			>
				<Icon icon="tabler:trash" width={18} height={18} />
			</button>
		</div>
	{/if}
</div>
