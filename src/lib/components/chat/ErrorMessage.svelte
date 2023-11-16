<script lang="ts">
	import type { ErrorMessage } from '$lib/types/error';
	import Icon from '@iconify/svelte';

	export let error: ErrorMessage;
</script>

<div class="flex flex-col items-center justify-center h-full mx-6 text-red-500">
	<div class="mb-5">
		<Icon icon="tabler:x" width={36} height={36} />
	</div>
	<div class="mb-3 text-2xl font-medium">{error.title}</div>
	{#each error.messageLines as line}
		<div class="text-center">
			{' '}
			{line}{' '}
		</div>
	{/each}
	<div class="mt-4 text-xs opacity-50 dark:text-red-400">
		{#if error.code}
			<i>Code: {error.code}</i>
		{/if}
	</div>
</div>
