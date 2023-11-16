<script lang="ts">
	import { lightMode } from '$lib/stores/lightMode';
	import { onMount } from 'svelte';

	export let onClose: () => void;

	function handleSave() {
		localStorage.setItem(
			'settings',
			JSON.stringify({
				theme: $lightMode
			})
		);
	}

	let modalRef: HTMLDivElement;

	onMount(() => {
		const handleMouseDown = (e: MouseEvent) => {
			if (modalRef && !modalRef.contains(e.target as Node)) {
				window.addEventListener('mouseup', handleMouseUp);
			}
		};

		const handleMouseUp = () => {
			window.removeEventListener('mouseup', handleMouseUp);
			onClose();
		};

		window.addEventListener('mousedown', handleMouseDown);

		return () => {
			window.removeEventListener('mousedown', handleMouseDown);
		};
	});
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
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
				<div class="pb-4 text-lg font-bold text-black dark:text-neutral-200">Settings</div>

				<div class="mb-2 text-sm font-bold text-black dark:text-neutral-200">Theme</div>

				<select
					class="w-full p-2 bg-transparent cursor-pointer text-neutral-700 dark:text-neutral-200"
					bind:value={$lightMode}
				>
					<option value="dark">Dark mode</option>
					<option value="light">Light mode</option>
				</select>

				<button
					type="button"
					class="w-full px-4 py-2 mt-6 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
					on:click={() => {
						handleSave();
						onClose();
					}}
				>
					Save
				</button>
			</div>
		</div>
	</div>
</div>
