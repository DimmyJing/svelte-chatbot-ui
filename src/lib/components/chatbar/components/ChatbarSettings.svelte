<script lang="ts">
	import { conversations, selectedConversation } from '$lib/stores/conversation';
	import Icon from '@iconify/svelte';
	import ClearConversations from './ClearConversations.svelte';
	import SettingDialog from '$lib/components/settings/SettingDialog.svelte';
	import { folders } from '$lib/stores/folder';
	import { prompts } from '$lib/stores/prompt';
	import type { Conversation } from '$lib/types/chat';
	import type { FolderInterface } from '$lib/types/folder';
	import type { Prompt } from '$lib/types/prompt';

	function onExportData() {
		const data = {
			version: 4,
			history: $conversations || [],
			folders: $folders || [],
			prompts: $prompts || []
		};

		const date = new Date();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const currentDate = `${month}-${day}`;

		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: 'application/json'
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.download = `chatbot_ui_history_${currentDate}.json`;
		link.href = url;
		link.style.display = 'none';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	let importInputRef: HTMLInputElement;
	let isSettingDialog = false;

	interface ExportFormatV4 {
		version: 4;
		history: Conversation[];
		folders: FolderInterface[];
		prompts: Prompt[];
	}

	function onImportConversations(data: ExportFormatV4) {
		const { history, folders: localFolders, prompts: localPrompts } = data;

		const newHistory: Conversation[] = [...$conversations, ...history].filter(
			(conversation, index, self) => index === self.findIndex((c) => c.id === conversation.id)
		);
		conversations.set(newHistory);
		if (newHistory.length > 0) selectedConversation.set(newHistory[newHistory.length - 1]);
		else selectedConversation.set(undefined);

		const newFolders: FolderInterface[] = [...$folders, ...localFolders].filter(
			(folder, index, self) => index === self.findIndex((f) => f.id === folder.id)
		);
		folders.set(newFolders);

		const newPrompts: Prompt[] = [...$prompts, ...localPrompts].filter(
			(prompt, index, self) => index === self.findIndex((p) => p.id === prompt.id)
		);
		prompts.set(newPrompts);

		window.location.reload();
	}

	function localOnImport(e: { currentTarget: HTMLInputElement }) {
		if (!e.currentTarget.files?.length) return;

		const file = e.currentTarget.files[0];
		const reader = new FileReader();
		reader.onload = (e) => {
			const json = JSON.parse(e.target?.result as string);
			onImportConversations(json);
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
		on:click={onExportData}
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
