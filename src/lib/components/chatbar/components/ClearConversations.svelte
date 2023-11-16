<script lang="ts">
	import { handleClearConversations } from '$lib/handlers/handlers';
	import Icon from '@iconify/svelte';

	let isConfirming = false;

	function localHandleClearConversations() {
		handleClearConversations();
		isConfirming = false;
	}
</script>

{#if isConfirming}
	<div class="flex items-center w-full px-3 py-3 rounded-lg cursor-pointer hover:bg-gray-500/10">
		<Icon icon="tabler:trash" width={18} height={18} />

		<div class="ml-3 flex-1 text-left text-[12.5px] leading-3 text-white">Are you sure?</div>

		<div class="flex w-[40px]">
			<button
				class="ml-auto mr-1 minw-[20px] text-neutral-400 hover:text-neutral-100"
				on:click={(e) => {
					e.stopPropagation();
					localHandleClearConversations();
				}}
			>
				<Icon icon="tabler:check" width={18} height={18} />
			</button>

			<button
				class="ml-auto min-w-[20px] text-neutral-400 hover:text-neutral-100"
				on:click={(e) => {
					e.stopPropagation();
					isConfirming = false;
				}}
			>
				<Icon icon="tabler:x" width={18} height={18} />
			</button>
		</div>
	</div>
{:else}
	<button
		class="flex w-full cursor-pointer select-none items-center gap-3 rounded-md py-3 px-3 text-[14px] leading-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
		on:click={() => (isConfirming = true)}
	>
		<div><Icon icon="tabler:trash" height={18} width={18} /></div>
		<span>Clear conversations</span>
	</button>
{/if}
