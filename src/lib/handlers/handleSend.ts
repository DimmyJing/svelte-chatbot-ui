import { conversations, selectedConversation, stopConversation } from '$lib/stores/conversation';
import { loading } from '$lib/stores/loading';
import { messageIsStreaming } from '$lib/stores/messageIsStreaming';
import type { ChatBody, Message } from '$lib/types/chat';
import { PluginID, type Plugin } from '$lib/types/plugin';
import toast from 'svelte-french-toast';
import { get } from 'svelte/store';

export function handleSend(message: Message, discardCount: number, plugin?: Plugin) {
	const localSelectedConversation = get(selectedConversation);
	if (!localSelectedConversation) return;

	localSelectedConversation.messages = [
		...(discardCount > 0
			? localSelectedConversation.messages.slice(0, -discardCount)
			: localSelectedConversation.messages),
		message
	];
	selectedConversation.set(localSelectedConversation);
	loading.set(true);
	messageIsStreaming.set(true);
	const chatBody: ChatBody = {
		model: localSelectedConversation.model,
		messages: localSelectedConversation.messages,
		prompt: localSelectedConversation.prompt,
		temperature: localSelectedConversation.temperature
	};
	let endpoint = '/api/chat';
	if (plugin && plugin.id === PluginID.GOOGLE_SEARCH) endpoint = '/api/google';
	const body = JSON.stringify(chatBody);
	const controller = new AbortController();

	fetch(endpoint, {
		method: 'POST',
		signal: controller.signal,
		body
	}).then((resp) => {
		(async () => {
			if (!resp.ok) {
				loading.set(false);
				messageIsStreaming.set(false);
				toast.error(resp.statusText);
				return;
			}
			const data = resp.body;
			if (!data) {
				loading.set(false);
				messageIsStreaming.set(false);
				return;
			}
			if (!plugin) {
				if (localSelectedConversation.messages.length === 1) {
					const { content } = message;
					const customName = content.length > 30 ? content.substring(0, 30) + '...' : content;
					localSelectedConversation.name = customName;
				}
				loading.set(false);
				const reader = data.getReader();
				const decoder = new TextDecoder();
				let done = false;
				let isFirst = true;
				let text = '';
				while (!done) {
					if (get(stopConversation)) {
						controller.abort();
						done = true;
						break;
					}
					const { value, done: doneReading } = await reader.read();
					done = doneReading;
					const chunkValue = decoder.decode(value);
					text += chunkValue;
					if (isFirst) {
						isFirst = false;
						localSelectedConversation.messages.push({ role: 'assistant', content: chunkValue });
					} else {
						localSelectedConversation.messages[
							localSelectedConversation.messages.length - 1
						].content = text;
					}
					selectedConversation.set(localSelectedConversation);
				}
			} else {
				const { answer } = await resp.json();
				localSelectedConversation.messages.push({ role: 'assistant', content: answer });
				selectedConversation.set(localSelectedConversation);
				loading.set(false);
			}
			localStorage.setItem('selectedConversation', JSON.stringify(localSelectedConversation));
			conversations.update((conversations) => {
				const index = conversations.findIndex((el) => el.id === localSelectedConversation.id);
				if (index === -1) conversations.push(localSelectedConversation);
				else conversations[index] = localSelectedConversation;
				localStorage.setItem('conversationHistory', JSON.stringify(conversations));
				return conversations;
			});
			messageIsStreaming.set(false);
		})();
	});

	// TODO: handle send
}
