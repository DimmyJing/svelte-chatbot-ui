<script lang="ts">
	import type { Conversation } from '$lib/types/chat';
	import Icon from '@iconify/svelte';

	export let selectedConversation: Conversation | undefined;
	export let onNewConversation: () => void;
</script>

<nav class="flex w-full justify-between bg-[#202123] py-3 px-4 items-center">
	<div class="mr-4" />

	<div class="max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap">
		{selectedConversation?.name ?? 'Empty Conversation'}
	</div>

	<Icon
		icon="tabler:plus"
		class="mr-8 cursor-pointer hover:text-neutral-400"
		on:click={onNewConversation}
		width={24}
		height={24}
	/>
</nav>
