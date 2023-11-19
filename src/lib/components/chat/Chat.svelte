<script lang="ts">
	import { conversations, selectedConversation, stopConversation } from '$lib/stores/conversation';
	import Spinner from '../spinner/Spinner.svelte';
	import { models } from '$lib/stores/models';
	import ModelSelect from './ModelSelect.svelte';
	import SystemPrompt from './SystemPrompt.svelte';
	import ChatLoader from './ChatLoader.svelte';
	import TemperatureSlider from './TemperatureSlider.svelte';
	import Icon from '@iconify/svelte';
	import ChatInput from './ChatInput.svelte';
	import type { Message } from '$lib/types/chat';
	import { throttle } from '$lib/data/throttle';
	import { onMount } from 'svelte';
	import ChatMessage from './ChatMessage.svelte';
	import { handleSend } from '$lib/handlers/handleSend';
	import type { ErrorMessage as ErrorMessageType } from '$lib/types/error';
	import ErrorMessage from './ErrorMessage.svelte';

	let autoScrollEnabled = true;
	let showScrollDownButton = false;
	let showSettings = false;
	let loading = false;
	let currentMessage: Message;

	let chatContainerRef: HTMLDivElement;
	let messagesEndRef: HTMLDivElement;
	let textareaRef: HTMLTextAreaElement;

	const handleScroll = () => {
		if (chatContainerRef) {
			const { scrollTop, scrollHeight, clientHeight } = chatContainerRef;
			const bottomTolerance = 30;

			if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
				autoScrollEnabled = false;
				showScrollDownButton = true;
			} else {
				autoScrollEnabled = true;
				showScrollDownButton = false;
			}
		}
	};

	function handleSettings() {
		showSettings = !showSettings;
	}

	function onClearAll() {
		if (confirm('Are you sure you want to clear all messages?') && $selectedConversation) {
			conversations.update((conversations) =>
				conversations.map((c) => (c.id === $selectedConversation?.id ? { ...c, messages: [] } : c))
			);
			selectedConversation.set({ ...$selectedConversation, messages: [] });
		}
	}

	function handleScrollDown() {
		chatContainerRef?.scrollTo({
			top: chatContainerRef.scrollHeight,
			behavior: 'smooth'
		});
	}

	function scrollDown() {
		if (autoScrollEnabled) messagesEndRef?.scrollIntoView(true);
	}

	const throttledScrollDown = throttle(scrollDown, 250);

	$: {
		throttledScrollDown();
		if ($selectedConversation) {
			currentMessage = $selectedConversation.messages[$selectedConversation.messages.length - 2];
		}
	}

	let isModelsLoading = false;
	let modelError: ErrorMessageType | undefined;

	onMount(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				autoScrollEnabled = entry.isIntersecting;
				if (entry.isIntersecting) textareaRef?.focus();
			},
			{ root: null, threshold: 0.5 }
		);
		if (messagesEndRef) observer.observe(messagesEndRef);
		return () => {
			if (messagesEndRef) observer.unobserve(messagesEndRef);
		};
	});
</script>

<div class="relative flex-1 overflow-hidden bg-white dark:bg-[#343541]">
	{#if isModelsLoading}
		<div class="flex items-center justify-center w-full h-full">
			<Spinner />
		</div>
	{:else if modelError === undefined}
		<div class="max-h-full overflow-x-hidden" bind:this={chatContainerRef} on:scroll={handleScroll}>
			{#if $selectedConversation?.messages.length === 0}
				<div
					class="mx-auto flex flex-col space-y-5 md:space-y-10 px-3 pt-5 md:pt-12 sm:max-w-[600px]"
				>
					<div class="text-3xl font-semibold text-center text-gray-800 dark:text-gray-100">
						{#if $models.length === 0}
							<div>
								<Spinner />
							</div>
						{:else}
							Chatbot UI
						{/if}
					</div>

					{#if $models.length > 0}
						<div
							class="flex flex-col h-full p-4 space-y-4 border rounded-lg border-neutral-200 dark:border-neutral-600"
						>
							<ModelSelect />

							<SystemPrompt />

							<TemperatureSlider />
						</div>
					{/if}
				</div>
			{:else}
				<div
					class="sticky top-0 z-10 flex justify-center border border-b-neutral-300 bg-neutral-100 py-2 text-sm text-neutral-500 dark:border-none dark:bg-[#444654] dark:text-neutral-200"
				>
					Model: {$selectedConversation?.model.name} | Temp:{' '}
					{$selectedConversation?.temperature} |
					<button class="ml-2 cursor-pointer hover:opacity-50" on:click={handleSettings}>
						<Icon icon="tabler:settings" width={18} height={18} />
					</button>
					<button class="ml-2 cursor-pointer hover:opacity-50" on:click={onClearAll}>
						<Icon icon="tabler:clear-all" width={18} height={18} />
					</button>
				</div>
				{#if showSettings}
					<div
						class="flex flex-col space-y-10 md:mx-auto md:max-w-xl md:gap-6 md:py-3 md:pt-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl"
					>
						<div
							class="flex flex-col h-full p-4 space-y-4 border-b border-neutral-200 dark:border-neutral-600 md:rounded-lg md:border"
						>
							<ModelSelect />
						</div>
					</div>
				{/if}

				{#each $selectedConversation?.messages ?? [] as message, index}
					<ChatMessage
						{message}
						messageIndex={index}
						onEdit={(editedMessage) => {
							currentMessage = editedMessage;
							// discard edited message and the ones that come after then resend
							handleSend(editedMessage, ($selectedConversation?.messages.length ?? 0) - index);
						}}
					/>
				{/each}

				{#if loading}
					<ChatLoader />
				{/if}

				<div class="h-[162px] bg-white dark:bg-[#343541]" bind:this={messagesEndRef} />
			{/if}
		</div>

		<ChatInput
			bind:stopConversation={$stopConversation}
			bind:textareaRef
			onSend={(message, plugin) => {
				currentMessage = message;
				handleSend(message, 0, plugin);
			}}
			onScrollDownClick={handleScrollDown}
			onRegenerate={() => {
				if (currentMessage) {
					handleSend(currentMessage, 2);
				}
			}}
			{showScrollDownButton}
		/>
	{:else}
		<ErrorMessage error={modelError} />
	{/if}
</div>
