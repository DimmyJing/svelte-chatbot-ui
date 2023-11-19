<script lang="ts">
	import { searchTerm } from '$lib/stores/searchTerm';
	import { showChatbar } from '$lib/stores/showChatbar';
	import Icon from '@iconify/svelte';
	import Search from '../search/Search.svelte';
	import ChatFolders from '../chatbar/components/ChatFolders.svelte';
	import { conversations, selectedConversation } from '$lib/stores/conversation';
	import Conversation from '../chatbar/components/Conversation.svelte';
	import type { Conversation as ConversationType } from '$lib/types/chat';
	import ChatbarSettings from '../chatbar/components/ChatbarSettings.svelte';
	import { folders } from '$lib/stores/folder';
	import { v4 as uuidv4 } from 'uuid';
	import { OpenAIModelID, OpenAIModels } from '$lib/types/openai';
	import {
		PUBLIC_DEFAULT_MODEL,
		PUBLIC_DEFAULT_SYSTEM_PROMPT,
		PUBLIC_DEFAULT_TEMPERATURE
	} from '$env/static/public';
	import { loading } from '$lib/stores/loading';

	export let items: ConversationType[];

	function allowDrop(e: DragEvent) {
		e.preventDefault();
	}

	function highlightDrop(e: DragEvent) {
		(e.target as HTMLDivElement).style.background = '#343541';
	}

	function removeHighlight(e: DragEvent) {
		(e.target as HTMLDivElement).style.background = 'none';
	}

	function onNewConversation() {
		const lastConversation = $conversations[$conversations.length - 1];
		const newConversation: ConversationType = {
			id: uuidv4(),
			name: 'New Conversation',
			messages: [],
			model: lastConversation?.model ?? OpenAIModels[PUBLIC_DEFAULT_MODEL as OpenAIModelID],
			prompt: PUBLIC_DEFAULT_SYSTEM_PROMPT,
			temperature: lastConversation?.temperature ?? +PUBLIC_DEFAULT_TEMPERATURE
		};
		conversations.update((conversations) => [...conversations, newConversation]);
		selectedConversation.set(newConversation);
		loading.set(false);
		searchTerm.set('');
	}

	function onToggleChatbar() {
		showChatbar.update((showChatbar) => !showChatbar);
	}

	function onDrop(e: DragEvent) {
		if (e.dataTransfer) {
			const conversation = JSON.parse(e.dataTransfer.getData('conversation'));
			conversations.update((conversations) =>
				conversations.map((c) => (c.id === conversation.id ? { ...c, folderID: '0' } : c))
			);
			selectedConversation.set({ ...conversation, folderID: '0' });
			searchTerm.set('');
			(e.target as HTMLDivElement).style.background = 'none';
		}
	}

	$: localConversations = $conversations
		.filter((conversation) => !conversation.folderID)
		.slice()
		.reverse();
</script>

{#if $showChatbar}
	<div>
		<div
			class={`fixed top-0 left-0 z-40 flex h-full w-[260px] flex-none flex-col space-y-2 bg-[#202123] p-2 text-[14px] transition-all sm:relative sm:top-0`}
		>
			<div class="flex items-center">
				<button
					class="text-sidebar flex w-[190px] flex-shrink-0 cursor-pointer select-none items-center gap-3 rounded-md border border-white/20 p-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
					on:click={onNewConversation}
				>
					<Icon icon="tabler:plus" height={16} width={16} />
					New chat
				</button>

				<button
					class="flex items-center flex-shrink-0 gap-3 p-3 ml-2 text-sm text-white transition-colors duration-200 border rounded-md cursor-pointer border-white/20 hover:bg-gray-500/10"
					on:click={() =>
						folders.update((folders) => [
							...folders,
							{ id: uuidv4(), name: 'New folder', type: 'chat' }
						])}
				>
					<Icon icon="tabler:folder-plus" height={16} width={16} />
				</button>
			</div>
			<Search placeholder={'Search...'} />

			<div class="flex-grow overflow-auto">
				{#if items.length > 0}
					<div class="flex pb-2 border-b border-white/20">
						<ChatFolders />
					</div>

					<div
						class="pt-2"
						on:drop={onDrop}
						on:dragover={allowDrop}
						on:dragenter={highlightDrop}
						on:dragleave={removeHighlight}
					>
						<div class="flex flex-col w-full gap-1">
							{#each localConversations as conversation}
								<Conversation {conversation} />
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
			<ChatbarSettings />
		</div>
		<button
			class="fixed top-5 left-[270px] z-50 h-7 w-7 hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:left-[270px] sm:h-8 sm:w-8 sm:text-neutral-700"
			on:click={onToggleChatbar}
		>
			<Icon icon="tabler:arrow-bar-left" width={24} height={24} />
		</button>
		<div
			on:click={onToggleChatbar}
			on:keydown={onToggleChatbar}
			class="absolute top-0 left-0 z-10 w-full h-full bg-black opacity-70 sm:hidden"
		/>
	</div>
{:else}
	<button
		class="fixed top-2.5 left-2 z-50 h-7 w-7 text-white hover:text-gray-400 dark:text-white dark:hover:text-gray-300 sm:top-0.5 sm:left-2 sm:h-8 sm:w-8 sm:text-neutral-700"
		on:click={onToggleChatbar}
	>
		<Icon icon="tabler:arrow-bar-right" width={24} height={24} />
	</button>
{/if}
