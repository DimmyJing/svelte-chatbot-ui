<script lang="ts">
	import {
		PUBLIC_DEFAULT_MODEL,
		PUBLIC_DEFAULT_SYSTEM_PROMPT,
		PUBLIC_DEFAULT_TEMPERATURE
	} from '$env/static/public';
	import { conversations, selectedConversation } from '$lib/stores/conversation';
	import { loading } from '$lib/stores/loading';
	import type { Conversation } from '$lib/types/chat';
	import { OpenAIModelID, OpenAIModels } from '$lib/types/openai';
	import Icon from '@iconify/svelte';
	import { v4 as uuidv4 } from 'uuid';

	function onNewConversation() {
		const lastConversation = $conversations[$conversations.length - 1];
		const newConversation: Conversation = {
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
	}
</script>

<nav class="flex w-full justify-between bg-[#202123] py-3 px-4 items-center">
	<div class="mr-4" />

	<div class="max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap">
		{$selectedConversation?.name ?? 'Empty Conversation'}
	</div>

	<Icon
		icon="tabler:plus"
		class="mr-8 cursor-pointer hover:text-neutral-400"
		on:click={onNewConversation}
		width={24}
		height={24}
	/>
</nav>
