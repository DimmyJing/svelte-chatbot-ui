<script lang="ts">
	import { folders } from '$lib/stores/folder';
	import PromptFolder from '$lib/components/folder/PromptFolder.svelte';

	$: filteredFolders = $folders
		.filter((folder) => (folder.type = 'prompt'))
		.sort((a, b) => a.name.localeCompare(b.name));
</script>

<div class="flex flex-col w-full pt-2">
	{#each filteredFolders as folder}
		<PromptFolder currentFolder={folder} />
	{/each}
</div>
