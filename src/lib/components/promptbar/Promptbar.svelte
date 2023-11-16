<script lang="ts">
	import { prompts } from '$lib/stores/prompt';
	import { promptSearchTerm } from '$lib/stores/searchTerm';
	import PromptSidebar from '../sidebar/PromptSidebar.svelte';

	$: filteredPrompts =
		$promptSearchTerm !== ''
			? $prompts.filter((prompt) => {
					const searchable =
						prompt.name.toLowerCase() +
						' ' +
						prompt.description.toLowerCase() +
						' ' +
						prompt.content.toLowerCase();
					return searchable.includes($promptSearchTerm.toLowerCase());
			  })
			: $prompts;
</script>

<PromptSidebar items={filteredPrompts} />
