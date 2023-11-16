<script lang="ts">
	import { PUBLIC_DEFAULT_TEMPERATURE } from '$env/static/public';
	import { handleUpdateConversation } from '$lib/handlers/handlers';
	import { conversations, selectedConversation } from '$lib/stores/conversation';

	let temperature =
		$conversations[$conversations.length - 1]?.temperature ?? +PUBLIC_DEFAULT_TEMPERATURE;

	function handleChange(e: { currentTarget: HTMLInputElement }) {
		if ($selectedConversation) {
			handleUpdateConversation($selectedConversation, {
				key: 'temperature',
				value: temperature
			});
		}
	}
</script>

<div class="flex flex-col">
	<label for="temperature-slider" class="mb-2 text-left text-neutral-700 dark:text-neutral-400">
		Temperature
	</label>
	<span class="text-[12px] text-black/50 dark:text-white/50 text-sm">
		Higher values like 0.8 will make the output more random, while lower values like 0.2 will make
		it more focused and deterministic.
	</span>
	<span class="mt-2 mb-1 text-center text-neutral-900 dark:text-neutral-100">
		{temperature.toFixed(1)}
	</span>
	<input
		id="temperature-slider"
		class="cursor-pointer"
		type="range"
		min={0}
		max={1}
		step={0.1}
		bind:value={temperature}
		on:change={handleChange}
	/>
	<ul class="w mt-2 pb-8 flex justify-between px-[24px] text-neutral-900 dark:text-neutral-100">
		<li class="flex justify-center">
			<span class="absolute">Precise</span>
		</li>
		<li class="flex justify-center">
			<span class="absolute">Neutral</span>
		</li>
		<li class="flex justify-center">
			<span class="absolute">Creative</span>
		</li>
	</ul>
</div>
