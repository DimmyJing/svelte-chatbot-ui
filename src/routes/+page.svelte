<script lang="ts">
	import { conversations, selectedConversation } from '$lib/stores/conversation';
	import { folders } from '$lib/stores/folder';
	import { prompts } from '$lib/stores/prompt';
	import { OpenAIModelID, OpenAIModels } from '$lib/types/openai';
	import { v4 as uuidv4 } from 'uuid';
	import {
		PUBLIC_DEFAULT_MODEL,
		PUBLIC_DEFAULT_SYSTEM_PROMPT,
		PUBLIC_DEFAULT_TEMPERATURE
	} from '$env/static/public';
	import { showChatbar, showPromptbar } from '$lib/stores/showChatbar';
	import { onMount } from 'svelte';
	import type { Settings } from '$lib/types/settings';
	import Navbar from '$lib/components/mobile/Navbar.svelte';
	import Chatbar from '$lib/components/chatbar/Chatbar.svelte';
	import Promptbar from '$lib/components/promptbar/Promptbar.svelte';
	import Chat from '$lib/components/chat/Chat.svelte';
	import type { PageData } from './$types';
	import { models } from '$lib/stores/models';
	import { settings } from '$lib/stores/settings';

	export let data: PageData;

	models.set(data.models);

	onMount(() => {
		selectedConversation.init();
		conversations.init();
		folders.init();
		prompts.init();
		settings.init();
		showChatbar.init();
		showPromptbar.init();

		if (window.innerWidth < 640) {
			showChatbar.set(false);
			showPromptbar.set(false);
		}

		if (!$selectedConversation) {
			const lastConversation = $conversations[$conversations.length - 1];
			selectedConversation.set({
				id: uuidv4(),
				name: 'New Conversation',
				messages: [],
				model: lastConversation?.model ?? OpenAIModels[PUBLIC_DEFAULT_MODEL as OpenAIModelID],
				prompt: PUBLIC_DEFAULT_SYSTEM_PROMPT,
				temperature: lastConversation?.temperature ?? +PUBLIC_DEFAULT_TEMPERATURE,
				folderID: undefined
			});
		}
	});
</script>

{#if selectedConversation}
	<main
		class={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${$settings.theme}`}
	>
		<div class="fixed top-0 w-full sm:hidden">
			<Navbar />
		</div>

		<div class="flex h-full w-full pt-[48px] sm:pt-0">
			<Chatbar />

			<div class="flex flex-1">
				<Chat />
			</div>

			<Promptbar />
		</div>
	</main>
{/if}
