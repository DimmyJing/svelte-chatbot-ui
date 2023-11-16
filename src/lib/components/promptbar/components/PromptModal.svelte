<script lang="ts">
	import type { Prompt } from '$lib/types/prompt';
	import { onMount } from 'svelte';

	export let prompt: Prompt;
	export let onClose: () => void;
	export let onUpdatePrompt: (prompt: Prompt) => void;

	function handleEnter(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			onUpdatePrompt({ ...prompt, content: prompt.content.trim() });
			onClose();
		}
	}

	let modalRef: HTMLDivElement;
	let nameInputRef: HTMLInputElement;

	onMount(() => {
		function handleMouseDown(e: MouseEvent) {
			if (modalRef && !modalRef.contains(e.target as Node)) {
				window.addEventListener('mouseup', handleMouseUp);
			}
		}

		const handleMouseUp = () => {
			window.removeEventListener('mouseup', handleMouseUp);
			onClose();
		};

		window.addEventListener('mousedown', handleMouseDown);

		return () => {
			window.removeEventListener('mousedown', handleMouseDown);
		};

		nameInputRef.focus();
	});
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
	on:keydown={handleEnter}
>
	<div class="fixed inset-0 z-10 overflow-hidden">
		<div
			class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
		>
			<div class="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true" />

			<div
				bind:this={modalRef}
				class="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
				role="dialog"
			>
				<div class="text-sm font-bold text-black dark:text-neutral-200">Name</div>
				<input
					bind:this={nameInputRef}
					class="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
					placeholder="A name for your prompt."
					bind:value={prompt.name}
				/>

				<div class="mt-6 text-sm font-bold text-black dark:text-neutral-200">Description</div>
				<textarea
					class="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100 resize-none"
					placeholder="A description for your prompt."
					bind:value={prompt.description}
					rows={3}
				/>

				<div class="mt-6 text-sm font-bold text-black dark:text-neutral-200">Prompt</div>
				<textarea
					class="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100 resize-none"
					placeholder={'Prompt content. Use {{}} to denote a variable. Ex: {{name}} is a {{adjective}} {{noun}}'}
					bind:value={prompt.content}
					rows={10}
				/>

				<button
					type="button"
					class="w-full px-4 py-2 mt-6 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
					on:click={() => {
						onUpdatePrompt({ ...prompt, content: prompt.content.trim() });
						onClose();
					}}
				>
					Save
				</button>
			</div>
		</div>
	</div>
</div>
