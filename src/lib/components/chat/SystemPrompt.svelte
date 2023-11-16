<script lang="ts">
	import { PUBLIC_DEFAULT_SYSTEM_PROMPT } from '$env/static/public';
	import { handleUpdateConversation } from '$lib/handlers/handlers';
	import { selectedConversation } from '$lib/stores/conversation';
	import { prompts } from '$lib/stores/prompt';
	import type { Prompt } from '$lib/types/prompt';
	import { onMount } from 'svelte';
	import PromptList from './PromptList.svelte';
	import VariableModal from './VariableModal.svelte';

	let value = '';
	let activePromptIndex = 0;
	let showPromptList = false;
	let promptInputValue = '';
	let variables: string[] = [];
	let isModalVisible = false;

	let textareaRef: HTMLTextAreaElement;
	let promptListRef: HTMLUListElement;

	$: filteredPrompts = $prompts.filter((prompt) =>
		prompt.name.toLowerCase().includes(promptInputValue.toLowerCase())
	);

	function handleInitModal() {
		const selectedPrompt = filteredPrompts[activePromptIndex];
		value = value.replace(/\/\w*$/, selectedPrompt.content);
		handlePromptSelect(selectedPrompt);
		showPromptList = false;
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

	function handlePromptSelect(prompt: Prompt) {
		variables = parseVariables(prompt.content);

		if (variables.length > 0) {
			isModalVisible = true;
		} else {
			const updatedContent = value?.replace(/\/\w*$/, prompt.content);

			value = updatedContent;
		}
	}

	function handleSubmit(updatedVariables: string[]) {
		const newContent = value?.replace(/{{(.*?)}}/g, (_, variable) => {
			const index = variables.indexOf(variable);
			return updatedVariables[index];
		});

		value = newContent;

		if (textareaRef) textareaRef.focus();
	}

	$: {
		if ($selectedConversation && $selectedConversation.model.maxLength < value.length) {
			alert(
				`Prompt limit is ${$selectedConversation.model.maxLength} characters. You have entered ${value.length} characters.`
			);
		} else if ($selectedConversation) {
			const match = value.match(/\/\w*$/);
			if (match) {
				showPromptList = true;
				promptInputValue = match[0].slice(1);
			} else {
				showPromptList = false;
				promptInputValue = '';
			}

			if (value.length > 0)
				handleUpdateConversation($selectedConversation, {
					key: 'prompt',
					value: prompt
				});
		}
	}

	function handleKeyDown(e: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) {
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
		}
	}

	$: {
		value;
		if (textareaRef) {
			textareaRef.style.height = 'inherit';
			textareaRef.style.height = `${textareaRef.scrollHeight}px`;
		}
	}

	onMount(() => {
		if ($selectedConversation?.prompt) value = $selectedConversation.prompt;
		else value = PUBLIC_DEFAULT_SYSTEM_PROMPT;

		function handleOutsideClick(e: MouseEvent) {
			if (promptListRef && !promptListRef.contains(e.target as Node)) showPromptList = false;
		}

		window.addEventListener('click', handleOutsideClick);

		return () => {
			window.removeEventListener('click', handleOutsideClick);
		};
	});
</script>

<div class="flex flex-col">
	<label for="system-prompt-textarea" class="mb-2 text-left text-neutral-700 dark:text-neutral-400">
		System Prompt
	</label>
	<textarea
		id="system-prompt-textarea"
		bind:this={textareaRef}
		class="w-full px-4 py-3 bg-transparent border rounded-lg resize-none border-neutral-200 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100 max-h-[300px]"
		style={`overflow: ${textareaRef && textareaRef.scrollHeight > 400 ? 'auto' : 'hidden'}`}
		placeholder={`Enter a prompt or type "/" to select a prompt...` || ''}
		bind:value
		rows={1}
		on:keydown={handleKeyDown}
	/>

	{#if showPromptList && filteredPrompts.length > 0}
		<div>
			<PromptList
				{activePromptIndex}
				prompts={filteredPrompts}
				onSelect={handleInitModal}
				onMouseOver={(index) => (activePromptIndex = index)}
				bind:promptListRef
			/>
		</div>
	{/if}

	{#if isModalVisible}
		<VariableModal
			prompt={$prompts[activePromptIndex]}
			{variables}
			onSubmit={handleSubmit}
			onClose={() => (isModalVisible = false)}
		/>
	{/if}
</div>
