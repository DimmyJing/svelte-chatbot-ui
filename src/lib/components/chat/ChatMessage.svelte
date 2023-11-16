<script lang="ts">
	import { conversations, selectedConversation } from '$lib/stores/conversation';
	import type { Message } from '$lib/types/chat';
	import Icon from '@iconify/svelte';
	import Markdown from '../markdown/Markdown.svelte';
	import Table from '../markdown/Table.svelte';
	import Th from '../markdown/Th.svelte';
	import Td from '../markdown/Td.svelte';
	import { messageIsStreaming } from '$lib/stores/messageIsStreaming';
	import Code from '../markdown/Code.svelte';
	import Pre from '../markdown/Pre.svelte';

	export let message: Message;
	export let messageIndex: number;
	export let onEdit: (editedMessage: Message) => void;

	let isEditing = false;
	let isTyping = false;
	let messageContent = message.content;
	let messageCopied = false;

	let textareaRef: HTMLTextAreaElement;

	function toggleEditing() {
		isEditing = !isEditing;
	}

	$: {
		isEditing;
		messageContent;
		if (textareaRef) {
			textareaRef.style.height = 'inherit';
			textareaRef.style.height = `${textareaRef.scrollHeight}px`;
		}
	}

	function handleEditMessage() {
		if (message.content != messageContent) {
			if ($selectedConversation && onEdit) {
				onEdit({ ...message, content: messageContent });
			}
		}
		isEditing = false;
	}

	function handleDeleteMessage() {
		if (!$selectedConversation) return;

		const { messages } = $selectedConversation;
		const findIndex = messages.findIndex((elm) => elm === message);

		if (findIndex < 0) return;

		if (findIndex < messages.length - 1 && messages[findIndex + 1].role === 'assistant') {
			messages.splice(findIndex, 2);
		} else {
			messages.splice(findIndex, 1);
		}
		const updatedConversation = {
			...$selectedConversation,
			messages
		};

		const updatedConversations = $conversations.map((c) => {
			if (c.id === updatedConversation.id) return updatedConversation;
			return c;
		});

		localStorage.setItem('selectedConversation', JSON.stringify(updatedConversation));
		localStorage.setItem('conversationHistory', JSON.stringify(updatedConversations));

		selectedConversation.set(updatedConversation);
		conversations.set(updatedConversations);
	}

	function handlePressEnter(e: KeyboardEvent) {
		if (e.key === 'Enter' && !isTyping && !e.shiftKey) {
			e.preventDefault();
			handleEditMessage();
		}
	}

	function copyOnClick() {
		if (!navigator.clipboard) return;

		navigator.clipboard.writeText(message.content).then(() => {
			messageCopied = true;
			setTimeout(() => {
				messageCopied = false;
			}, 2000);
		});
	}

	$: messageContent = message.content;
</script>

<div
	class={`group md:px-4 ${
		message.role === 'assistant'
			? 'border-b border-black/10 bg-gray-50 text-gray-800 dark:border-gray-900/50 dark:bg-[#444654] dark:text-gray-100'
			: 'border-b border-black/10 bg-white text-gray-800 dark:border-gray-900/50 dark:bg-[#343541] dark:text-gray-100'
	}`}
	style="overflow-wrap:anywhere"
>
	<div
		class="relative flex p-4 m-auto text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl"
	>
		<div class="min-w-[40px] text-right font-bold">
			{#if message.role === 'assistant'}
				<Icon icon="tabler:robot" width={30} height={30} />
			{:else}
				<Icon icon="tabler:user" width={30} height={30} />
			{/if}
		</div>

		<div class="prose mt-[-2px] w-full dark:prose-invert">
			{#if message.role === 'user'}
				<div class="flex w-full">
					{#if isEditing}
						<div class="flex flex-col w-full">
							<textarea
								bind:this={textareaRef}
								class="w-full resize-none whitespace-pre-wrap border-none dark:bg-[#343541] p-0 m-0 overflow-hidden"
								bind:value={messageContent}
								on:keydown={handlePressEnter}
								on:compositionstart={() => (isTyping = true)}
								on:compositionend={() => (isTyping = false)}
								style="font-family:inherit;font-size:inherit;line-height:inherit"
							/>

							<div class="flex justify-center mt-10 space-x-4">
								<button
									class="h-[40px] rounded-md bg-blue-500 px-4 py-1 text-sm font-medium text-white enabled:hover:bg-blue-600 disabled:opacity-50"
									on:click={handleEditMessage}
									disabled={messageContent.trim().length <= 0}
								>
									Save & Submit
								</button>
								<button
									class="h-[40px] rounded-md border border-neutral-300 px-4 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
									on:click={() => {
										messageContent = message.content;
										isEditing = false;
									}}
								>
									Cancel
								</button>
							</div>
						</div>
					{:else}
						<div class="flex-1 prose whitespace-pre-wrap dark:prose-invert">
							{message.content}
						</div>

						<div
							class="flex flex-col items-center justify-end gap-4 ml-1 md:-mr-8 md:ml-0 md:flex-row md:gap-1 md:items-start md:justify-start"
						>
							<button
								class="invisible text-gray-500 group-hover:visible focus:visible hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
								on:click={toggleEditing}
							>
								<Icon icon="tabler:edit" width={20} height={20} />
							</button>
							<button
								class="invisible text-gray-500 group-hover:visible focus:visible hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
								on:click={handleDeleteMessage}
							>
								<Icon icon="tabler:trash" width={20} height={20} />
							</button>
						</div>
					{/if}
				</div>
			{:else}
				<div class="flex flex-row">
					<div class="flex-1 prose dark:prose-invert">
						<Markdown
							md={`${message.content}${
								$messageIsStreaming &&
								messageIndex == ($selectedConversation?.messages.length ?? 0) - 1
									? '▍'
									: ''
							}`}
							components={{
								table: Table,
								th: Th,
								td: Td,
								code: Code,
								pre: Pre
							}}
						/>
					</div>
					<div
						class="flex flex-col items-center justify-end gap-4 ml-1 md:-mr-8 md:ml-0 md:flex-row md:gap-1 md:items-start md:justify-start"
					>
						{#if messageCopied}
							<Icon
								icon="tabler:check"
								width={20}
								height={20}
								class="text-green-500 dark:text-green-400"
							/>
						{:else}
							<button
								class="invisible text-gray-500 group-hover:visible focus:visible hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
								on:click={copyOnClick}
							>
								<Icon icon="tabler:copy" width={20} height={20} />
							</button>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
