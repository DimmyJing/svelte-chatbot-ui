<script lang="ts">
	import { conversations } from '$lib/stores/conversation';
	import { searchTerm } from '$lib/stores/searchTerm';
	import Sidebar from '../sidebar/Sidebar.svelte';

	$: filteredConversations = $searchTerm
		? $conversations.filter((conversation) => {
				const searchable =
					conversation.name.toLocaleLowerCase() +
					' ' +
					conversation.messages.map((message) => message.content).join(' ');
				return searchable.toLowerCase().includes($searchTerm.toLowerCase());
		  })
		: $conversations;
</script>

<Sidebar items={filteredConversations} />
