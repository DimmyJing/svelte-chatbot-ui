<script lang="ts">
	import {
		PUBLIC_DEFAULT_MODEL,
		PUBLIC_DEFAULT_SYSTEM_PROMPT,
		PUBLIC_DEFAULT_TEMPERATURE
	} from '$env/static/public';
	import { conversations, selectedConversation } from '$lib/stores/conversation';
	import { folders } from '$lib/stores/folder';
	import { OpenAIModelID, OpenAIModels } from '$lib/types/openai';
	import Icon from '@iconify/svelte';
	import { v4 as uuidv4 } from 'uuid';

	let isConfirming = false;

	function onClearConversations(e: MouseEvent) {
		e.stopPropagation();
		selectedConversation.set({
			id: uuidv4(),
			name: 'New Conversation',
			messages: [],
			model: OpenAIModels[PUBLIC_DEFAULT_MODEL as OpenAIModelID],
			prompt: PUBLIC_DEFAULT_SYSTEM_PROMPT,
			temperature: +PUBLIC_DEFAULT_TEMPERATURE
		});
		conversations.set([]);
		folders.update((folders) => folders.filter((f) => f.type !== 'chat'));
		isConfirming = false;
	}
</script>

{#if isConfirming}
	<div class="flex items-center w-full px-3 py-3 rounded-lg cursor-pointer hover:bg-gray-500/10">
		<Icon icon="tabler:trash" width={18} height={18} />

		<div class="ml-3 flex-1 text-left text-[12.5px] leading-3 text-white">Are you sure?</div>

		<div class="flex w-[40px]">
			<button
				class="ml-auto mr-1 minw-[20px] text-neutral-400 hover:text-neutral-100"
				on:click={onClearConversations}
			>
				<Icon icon="tabler:check" width={18} height={18} />
			</button>

			<button
				class="ml-auto min-w-[20px] text-neutral-400 hover:text-neutral-100"
				on:click={(e) => {
					e.stopPropagation();
					isConfirming = false;
				}}
			>
				<Icon icon="tabler:x" width={18} height={18} />
			</button>
		</div>
	</div>
{:else}
	<button
		class="flex w-full cursor-pointer select-none items-center gap-3 rounded-md py-3 px-3 text-[14px] leading-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
		on:click={() => (isConfirming = true)}
	>
		<div><Icon icon="tabler:trash" height={18} width={18} /></div>
		<span>Clear conversations</span>
	</button>
{/if}
