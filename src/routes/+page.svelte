<script lang="ts">
	import { conversations, selectedConversation } from '$lib/stores/conversation';
	import { folders } from '$lib/stores/folder';
	import { models, modelError } from '$lib/stores/models';
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
	import { lightMode } from '$lib/stores/lightMode';
	import Navbar from '$lib/components/mobile/Navbar.svelte';
	import { handleNewConversation } from '$lib/handlers/handlers';
	import Chatbar from '$lib/components/chatbar/Chatbar.svelte';
	import Promptbar from '$lib/components/promptbar/Promptbar.svelte';
	import Chat from '$lib/components/chat/Chat.svelte';
	import type { PageData } from './$types.js';

	export let data: PageData;

	onMount(() => {
		models.set(data.models);

		let settings: Settings = {
			theme: 'dark'
		};
		const settingsJson = localStorage.getItem('settings');
		if (settingsJson) {
			try {
				const savedSettings = JSON.parse(settingsJson) as Settings;
				settings = { ...settings, ...savedSettings };
			} catch (e) {
				console.error(e);
			}
		}
		lightMode.set(settings.theme);
		if (window.innerWidth < 640) {
			showChatbar.set(false);
			showPromptbar.set(false);
		}

		const localShowChatbar = localStorage.getItem('showChatbar');
		if (localShowChatbar) showChatbar.set(localShowChatbar === 'true');

		const localShowPromptbar = localStorage.getItem('showPromptbar');
		if (localShowPromptbar) showPromptbar.set(localShowPromptbar === 'true');

		const localFolders = localStorage.getItem('folders');
		if (localFolders) folders.set(JSON.parse(localFolders));

		const localPrompts = localStorage.getItem('prompts');
		if (localPrompts) prompts.set(JSON.parse(localPrompts));

		const localConversationHistory = localStorage.getItem('conversationHistory');
		if (localConversationHistory) conversations.set(JSON.parse(localConversationHistory));

		const localSelectedConversation = localStorage.getItem('selectedConversation');
		if (localSelectedConversation) selectedConversation.set(JSON.parse(localSelectedConversation));
		else {
			const lastConversation = $conversations[$conversations.length - 1];
			selectedConversation.set({
				id: uuidv4(),
				name: 'New Conversation',
				messages: [],
				model: lastConversation?.model ?? OpenAIModels[PUBLIC_DEFAULT_MODEL as OpenAIModelID],
				prompt: PUBLIC_DEFAULT_SYSTEM_PROMPT,
				temperature: lastConversation?.temperature ?? PUBLIC_DEFAULT_TEMPERATURE,
				folderID: undefined
			});
		}
	});
</script>

{#if selectedConversation}
	<main class={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${$lightMode}`}>
		<div class="fixed top-0 w-full sm:hidden">
			<Navbar
				selectedConversation={$selectedConversation}
				onNewConversation={handleNewConversation}
			/>
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
