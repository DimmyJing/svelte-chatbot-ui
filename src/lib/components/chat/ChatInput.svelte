<script lang="ts">
	import { selectedConversation } from '$lib/stores/conversation';
	import { messageIsStreaming } from '$lib/stores/messageIsStreaming';
	import { prompts } from '$lib/stores/prompt';
	import type { Message } from '$lib/types/chat';
	import type { Plugin } from '$lib/types/plugin';
	import type { Prompt } from '$lib/types/prompt';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import PromptList from './PromptList.svelte';
	import VariableModal from './VariableModal.svelte';
	import PluginSelect from './PluginSelect.svelte';

	export let onSend: (message: Message, plugin?: Plugin) => void;
	export let onRegenerate: () => void;
	export let onScrollDownClick: () => void;
	export let textareaRef: HTMLTextAreaElement;
	export let showScrollDownButton: boolean;
	export let stopConversation: boolean;

	let content = '';
	let isTyping = false;
	let showPromptList = false;
	let activePromptIndex = 0;
	let promptInputValue = '';
	let variables: string[] = [];
	let isModalVisible = false;
	let showPluginSelect = false;
	let plugin: Plugin | undefined = undefined;

	let promptListRef: HTMLUListElement;

	const filteredPrompts = $prompts.filter((prompt) =>
		prompt.name.toLowerCase().includes(promptInputValue.toLowerCase())
	);

	$: {
		const maxLength = $selectedConversation?.model.maxLength;

		if (maxLength && content.length > maxLength) {
			alert(
				`Message limit is ${maxLength} characters. You have entered ${content.length} characters.`
			);
		} else {
			updatePromptListVisibility(content);
		}
	}

	function handleSend() {
		if ($messageIsStreaming) return;
		if (!content) {
			alert('Please enter a message');
			return;
		}

		onSend({ role: 'user', content }, plugin);
		content = '';
		plugin = undefined;

		if (window.innerWidth < 640 && textareaRef) {
			textareaRef.blur();
		}
	}

	function handleStopConversation() {
		stopConversation = true;
		setTimeout(() => (stopConversation = false), 1000);
	}

	function isMobile() {
		const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
		const mobileRegex =
			/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
		return mobileRegex.test(userAgent);
	}

	function handleInitModal() {
		const selectedPrompt = filteredPrompts[activePromptIndex];
		if (selectedPrompt) {
			content = content.replace(/\/\w*$/, selectedPrompt.content);
			handlePromptSelect(selectedPrompt);
		}
		showPromptList = false;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (showPromptList) {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				if (activePromptIndex < $prompts.length - 1) activePromptIndex = activePromptIndex + 1;
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				if (activePromptIndex > 0) activePromptIndex = activePromptIndex - 1;
			} else if (e.key === 'Tab') {
				e.preventDefault();
				if (activePromptIndex < $prompts.length - 1) activePromptIndex = activePromptIndex + 1;
				else activePromptIndex = 0;
			} else if (e.key === 'Enter') {
				e.preventDefault();
				handleInitModal();
			} else if (e.key === 'Escape') {
				e.preventDefault();
				showPromptList = false;
			} else {
				activePromptIndex = 0;
			}
		} else if (e.key === 'Enter' && !isTyping && !isMobile() && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		} else if (e.key === '/' && e.metaKey) {
			e.preventDefault();
			showPluginSelect = !showPluginSelect;
		}
	}

	function parseVariables(content: string) {
		const regex = /{{(.*?)}}/g;
		const foundVariables = [];
		let match;

		while ((match = regex.exec(content)) !== null) {
			foundVariables.push(match[1]);
		}

		return foundVariables;
	}

	function updatePromptListVisibility(text: string) {
		const match = text.match(/\/\w*$/);
		if (match) {
			showPromptList = true;
			promptInputValue = match[0].slice(1);
		} else {
			showPromptList = false;
			promptInputValue = '';
		}
	}

	function handlePromptSelect(prompt: Prompt) {
		variables = parseVariables(prompt.content);

		if (variables.length > 0) {
			isModalVisible = true;
		} else {
			content = content.replace(/\/\w*$/, prompt.content);
		}
	}

	function handleSubmit(updatedVariables: string[]) {
		content = content.replace(/{{(.*?)}}/g, (_, variable) => {
			const index = variables.indexOf(variable);
			return updatedVariables[index];
		});

		if (textareaRef) textareaRef.focus();
	}

	$: if (promptListRef) promptListRef.scrollTop = activePromptIndex * 30;

	$: {
		content;
		if (textareaRef) {
			textareaRef.style.height = 'inherit';
			textareaRef.style.height = `${textareaRef?.scrollHeight}px`;
			textareaRef.style.overflow = `${textareaRef?.scrollHeight > 400 ? 'auto' : 'hidden'}`;
		}
	}

	onMount(() => {
		function handleOutsideClick(e: MouseEvent) {
			if (promptListRef && !promptListRef.contains(e.target as Node)) showPromptList = false;
		}
		window.addEventListener('click', handleOutsideClick);
		return () => window.removeEventListener('click', handleOutsideClick);
	});
</script>

<div
	class="absolute bottom-0 left-0 w-full border-transparent bg-gradient-to-b from-transparent via-white to-white pt-6 dark:border-white/20 dark:via-[#343541] dark:to-[#343541] md:pt-2"
>
	<div
		class="stretch mx-2 mt-4 flex flex-row gap-3 last:mb-2 md:mx-4 md:mt-[52px] md:last:mb-6 lg:mx-auto lg:max-w-3xl"
	>
		{#if $messageIsStreaming}
			<button
				class="absolute top-0 left-0 right-0 mx-auto mb-3 flex w-fit items-center gap-3 rounded border border-neutral-200 bg-white py-2 px-4 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white md:mb-0 md:mt-2"
				on:click={handleStopConversation}
			>
				<Icon icon="tabler:player-stop" width={16} height={16} />
				Stop Generating
			</button>
		{/if}

		{#if !$messageIsStreaming && $selectedConversation && $selectedConversation.messages.length > 0}
			<button
				class="absolute top-0 left-0 right-0 mx-auto mb-3 flex w-fit items-center gap-3 rounded border border-neutral-200 bg-white py-2 px-4 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white md:mb-0 md:mt-2"
				on:click={onRegenerate}
			>
				<Icon icon="tabler:repeat" width={16} height={16} />
				Regenerate response
			</button>
		{/if}

		<div
			class="relative mx-2 flex w-full flex-grow flex-col rounded-md border border-black/10 bg-white shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:border-gray-900/50 dark:bg-[#40414F] dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)] sm:mx-4"
		>
			<button
				class="absolute p-1 rounded-sm left-2 top-2 text-neutral-800 opacity-60 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200"
				on:click={() => (showPluginSelect = !showPluginSelect)}
			>
				{#if plugin}
					<Icon icon="tabler:brand-google" width={20} height={20} />
				{:else}
					<Icon icon="tabler:bolt" width={20} height={20} />
				{/if}
			</button>

			{#if showPluginSelect}
				<div class="absolute left-0 bottom-14 rounded bg-white dark:bg-[#343541]">
					<PluginSelect
						{plugin}
						onKeyDown={(e) => {
							if (e.key === 'Escape') {
								e.preventDefault();
								showPluginSelect = false;
								textareaRef?.focus();
							}
						}}
						onPluginChange={(newPlugin) => {
							plugin = newPlugin;
							showPluginSelect = false;
							textareaRef?.focus();
						}}
					/>
				</div>
			{/if}

			<textarea
				bind:this={textareaRef}
				class="w-full p-0 py-2 pl-10 pr-8 m-0 text-black bg-transparent border-0 resize-none dark:bg-transparent dark:text-white md:py-3 md:pl-10 max-h-[400px]"
				style={`bottom:${textareaRef?.scrollHeight}px;overflow:${
					textareaRef && textareaRef.scrollHeight > 400 ? 'auto' : 'hidden'
				}`}
				placeholder={'Type a message or type "/" to select a prompt...'}
				bind:value={content}
				rows={1}
				on:compositionstart={() => (isTyping = true)}
				on:compositionend={() => (isTyping = false)}
				on:keydown={handleKeyDown}
			/>

			<button
				class="absolute p-1 rounded-sm right-2 top-2 text-neutral-800 opacity-60 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200"
				on:click={handleSend}
			>
				{#if $messageIsStreaming}
					<div
						class="w-4 h-4 border-t-2 rounded-full animate-spin border-neutral-800 opacity-60 dark:border-neutral-100"
					/>
				{:else}
					<Icon icon="tabler:send" width={18} height={18} />
				{/if}
			</button>

			{#if showScrollDownButton}
				<div class="absolute right-0 bottom-12 lg:bottom-0 lg:-right-10">
					<button
						class="flex items-center justify-center text-gray-800 rounded-full shadow-md h-7 w-7 bg-neutral-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-neutral-200"
						on:click={onScrollDownClick}
					>
						<Icon icon="tabler:arrow-down" width={18} height={18} />
					</button>
				</div>
			{/if}

			{#if showPromptList && filteredPrompts.length > 0}
				<div class="absolute w-full bottom-12">
					<PromptList
						{activePromptIndex}
						prompts={filteredPrompts}
						onSelect={handleInitModal}
						onMouseOver={(index) => (activePromptIndex = index)}
						{promptListRef}
					/>
				</div>
			{/if}

			{#if isModalVisible}
				<VariableModal
					prompt={filteredPrompts[activePromptIndex]}
					{variables}
					onSubmit={handleSubmit}
					onClose={() => (isModalVisible = false)}
				/>
			{/if}
		</div>
	</div>
	<div
		class="px-3 pt-2 pb-3 text-center text-[12px] text-black/50 dark:text-white/50 md:px-4 md:pt-3 md:pb-6"
	>
		<a
			href="https://github.com/mckaywrigley/chatbot-ui"
			target="_blank"
			rel="noreferrer"
			class="underline">ChatBot UI</a
		>. Chatbot UI is an advanced chatbot kit for OpenAI's chat models aiming to mimic ChatGPT's
		interface and functionality.
	</div>
</div>
