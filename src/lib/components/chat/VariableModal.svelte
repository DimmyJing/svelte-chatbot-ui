<script lang="ts">
	import type { Prompt } from '$lib/types/prompt';
	import { onMount } from 'svelte';

	export let prompt: Prompt;
	export let variables: string[];
	export let onSubmit: (updatedVariables: string[]) => void;
	export let onClose: () => void;

	let updatedVariables: { key: string; value: string }[] = variables
		.map((variable) => ({
			key: variable,
			value: ''
		}))
		.filter((item, index, array) => array.findIndex((t) => t.key === item.key) === index);

	let modalRef: HTMLDivElement;
	let nameInputRef: HTMLTextAreaElement;

	function handleChange(index: number, value: string) {
		updatedVariables[index].value = value;
		updatedVariables = updatedVariables;
	}

	function handleSubmit() {
		if (updatedVariables.some((variable) => variable.value === '')) {
			alert('Please fill out all variables');
			return;
		}

		onSubmit(updatedVariables.map((variable) => variable.value));
		onClose();
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		} else if (e.key === 'Escape') {
			onClose();
		}
	}

	onMount(() => {
		if (nameInputRef) nameInputRef.focus();

		function handleOutsideClick(e: MouseEvent) {
			if (modalRef && !modalRef.contains(e.target as Node)) onClose();
		}

		window.addEventListener('click', handleOutsideClick);

		return () => window.removeEventListener('click', handleOutsideClick);
	});
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
	on:keydown={handleKeyDown}
>
	<div
		bind:this={modalRef}
		class="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
		role="dialog"
	>
		<div class="mb-4 text-xl font-bold text-black dark:text-neutral-200">
			{prompt.name}
		</div>

		<div class="mb-4 text-sm italic text-black dark:text-neutral-200">
			{prompt.description}
		</div>

		{#each updatedVariables as variable, index}
			<div class="mb-4">
				<div class="mb-2 text-sm font-bold text-neutral-200">
					{variable.key}
				</div>

				{#if index === 0}
					<textarea
						bind:this={nameInputRef}
						class="mt-1 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100 resize-none"
						placeholder={`Enter a value for ${variable.key}...`}
						bind:value={variable.value}
						rows={3}
					/>
				{:else}
					<textarea
						class="mt-1 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100 resize-none"
						placeholder={`Enter a value for ${variable.key}...`}
						bind:value={variable.value}
						rows={3}
					/>
				{/if}
			</div>
		{/each}

		<button
			class="w-full px-4 py-2 mt-6 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
			on:click={handleSubmit}
		>
			Submit
		</button>
	</div>
</div>
