<script lang="ts">
	import { PUBLIC_DEFAULT_MODEL } from '$env/static/public';
	import { handleUpdateConversation } from '$lib/handlers/handlers';
	import { selectedConversation } from '$lib/stores/conversation';
	import { models } from '$lib/stores/models';
	import Icon from '@iconify/svelte';

	function handleChange(e: { currentTarget: HTMLSelectElement }) {
		if ($selectedConversation) {
			handleUpdateConversation($selectedConversation, {
				key: 'model',
				value: $models.find((model) => model.id === e.currentTarget.value)
			});
		}
	}
</script>

<div class="flex flex-col">
	<label for="select-model" class="mb-2 text-left text-neutral-700 dark:text-neutral-400">
		Model
	</label>
	<div
		class="w-full pr-2 bg-transparent border rounded-lg border-neutral-200 text-neutral-900 dark:border-neutral-600 dark:text-white"
	>
		<select
			id="select-model"
			class="w-full p-2 bg-transparent"
			placeholder="Select a model"
			value={$selectedConversation?.model?.id || PUBLIC_DEFAULT_MODEL}
			on:change={handleChange}
		>
			{#each $models as model}
				<option value={model.id} class="dark:bg-[#343541] dark:text-white">
					{model.id === PUBLIC_DEFAULT_MODEL ? `Default (${model.name})` : model.name}
				</option>
			{/each}
		</select>
	</div>
	<div class="flex items-center w-full mt-3 text-left text-neutral-700 dark:text-neutral-400">
		<a href="https://platform.openai.com/account/usage" target="_blank" class="flex items-center">
			<Icon icon="tabler:external-link" width={18} height={18} class="inline mr-1" />
			View Account Usage
		</a>
	</div>
</div>
