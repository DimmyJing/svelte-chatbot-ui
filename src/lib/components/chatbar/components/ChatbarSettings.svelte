<script lang="ts">
	import { conversations } from '$lib/stores/conversation';
	import Icon from '@iconify/svelte';
	import ClearConversations from './ClearConversations.svelte';
	import { handleExportData, handleImportConversations } from '$lib/handlers/handlers';
	import SettingDialog from '$lib/components/settings/SettingDialog.svelte';

	let importInputRef: HTMLInputElement;
	let isSettingDialog = false;

	function localOnImport(e: { currentTarget: HTMLInputElement }) {
		if (!e.currentTarget.files?.length) return;

		const file = e.currentTarget.files[0];
		const reader = new FileReader();
		reader.onload = (e) => {
			const json = JSON.parse(e.target?.result as string);
			handleImportConversations(json);
		};
		reader.readAsText(file);
	}
</script>

<div class="flex flex-col items-center pt-1 space-y-1 text-sm border-t border-white/20">
	{#if $conversations.length > 0}
		<ClearConversations />
	{/if}

	<input
		id="import-file"
		class="sr-only"
		tabindex={-1}
		type="file"
		accept=".json"
		on:change={localOnImport}
		bind:this={importInputRef}
	/>

	<button
		class="flex w-full cursor-pointer select-none items-center gap-3 rounded-md py-3 px-3 text-[14px] leading-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
		on:click={() => importInputRef.click()}
	>
		<div><Icon icon="tabler:file-import" width={18} height={18} /></div>
		<span>Import data</span>
	</button>

	<button
		class="flex w-full cursor-pointer select-none items-center gap-3 rounded-md py-3 px-3 text-[14px] leading-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
		on:click={handleExportData}
	>
		<div><Icon icon="tabler:file-export" width={18} height={18} /></div>
		<span>Export data</span>
	</button>

	<button
		class="flex w-full cursor-pointer select-none items-center gap-3 rounded-md py-3 px-3 text-[14px] leading-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
		on:click={() => (isSettingDialog = true)}
	>
		<div><Icon icon="tabler:settings" width={18} height={18} /></div>
		<span>Settings</span>
	</button>

	{#if isSettingDialog}
		<SettingDialog onClose={() => (isSettingDialog = false)} />
	{/if}
</div>
