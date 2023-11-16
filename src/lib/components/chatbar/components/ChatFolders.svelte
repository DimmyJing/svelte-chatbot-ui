<script lang="ts">
	import { folders } from '$lib/stores/folder';
	import Folder from '$lib/components/folder/Folder.svelte';

	$: filteredFolders = $folders
		.filter((folder) => (folder.type = 'chat'))
		.sort((a, b) => a.name.localeCompare(b.name));
</script>

<div class="flex flex-col w-full pt-2">
	{#each filteredFolders as folder}
		<Folder currentFolder={folder} />
	{/each}
</div>
