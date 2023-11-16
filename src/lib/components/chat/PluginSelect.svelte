<script lang="ts">
	import { type Plugin, PluginList } from '$lib/types/plugin';
	import { onMount } from 'svelte';

	export let plugin: Plugin | undefined = undefined;
	export let onPluginChange: (plugin: Plugin) => void;
	export let onKeyDown: (e: KeyboardEvent) => void;

	let selectRef: HTMLSelectElement;

	function handleKeyDown(e: KeyboardEvent) {
		const optionCount = selectRef.options.length || 0;

		if (e.key === '/' && e.shiftKey && e.metaKey) {
			e.preventDefault();
			if (selectRef) {
				selectRef.selectedIndex = (selectRef.selectedIndex - 1 + optionCount) % optionCount;
				selectRef.dispatchEvent(new Event('change'));
			}
		} else if (e.key === '/' && e.metaKey) {
			e.preventDefault();
			if (selectRef) {
				selectRef.selectedIndex = (selectRef.selectedIndex + 1) % optionCount;
				selectRef.dispatchEvent(new Event('change'));
			}
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (selectRef) {
				selectRef.dispatchEvent(new Event('change'));
			}

			onPluginChange(
				PluginList.find(
					(plugin) => plugin.name === selectRef?.selectedOptions[0].innerText
				) as Plugin
			);
		} else {
			onKeyDown(e);
		}
	}

	function handleChange(e: { currentTarget: HTMLSelectElement }) {
		const plugin = PluginList.find((plugin) => plugin.id === e.currentTarget.value);
		onPluginChange(plugin as Plugin);
	}

	onMount(() => {
		if (selectRef) selectRef.focus();
	});
</script>

<div class="flex flex-col">
	<div
		class="w-full pr-2 mb-1 bg-transparent border rounded border-neutral-200 text-neutral-900 dark:border-neutral-600 dark:text-white"
	>
		<select
			bind:this={selectRef}
			class="w-full p-2 bg-transparent cursor-pointer"
			placeholder="Select a plugin"
			value={plugin?.id || 'chatgpt'}
			on:change={handleChange}
			on:keydown={(e) => {
				handleKeyDown(e);
			}}
		>
			<option value="chatgpt" class="dark:bg-[#343541] dark:text-white"> ChatGPT </option>

			{#each PluginList as plugin (plugin.id)}
				<option value={plugin.id} class="dark:bg-[#343541] dark:text-white">
					{plugin.name}
				</option>
			{/each}
		</select>
	</div>
</div>
