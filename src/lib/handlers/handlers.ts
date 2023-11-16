import {
	PUBLIC_DEFAULT_MODEL,
	PUBLIC_DEFAULT_SYSTEM_PROMPT,
	PUBLIC_DEFAULT_TEMPERATURE
} from '$env/static/public';
import { conversations, selectedConversation } from '$lib/stores/conversation';
import { folders } from '$lib/stores/folder';
import { loading } from '$lib/stores/loading';
import { prompts } from '$lib/stores/prompt';
import { searchTerm } from '$lib/stores/searchTerm';
import { showChatbar, showPromptbar } from '$lib/stores/showChatbar';
import type { Conversation } from '$lib/types/chat';
import type { KeyValuePair } from '$lib/types/data';
import type { FolderInterface, FolderType } from '$lib/types/folder';
import { OpenAIModelID, OpenAIModels } from '$lib/types/openai';
import type { Prompt } from '$lib/types/prompt';
import { get } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

export function handleSelectConversation(conversation: Conversation) {
	selectedConversation.set(conversation);
	localStorage.setItem('selectedConversation', JSON.stringify(conversation));
}

export function handleCreateFolder(name: string, type: FolderType) {
	const newFolder: FolderInterface = {
		id: uuidv4(),
		name,
		type
	};

	folders.update((folders) => {
		const newFolders = [...folders, newFolder];
		localStorage.setItem('folders', JSON.stringify(newFolders));
		return newFolders;
	});
}

export function handleDeleteFolder(folderID: string) {
	folders.update((folders) => {
		const newFolders = folders.filter((f) => f.id !== folderID);
		localStorage.setItem('folders', JSON.stringify(newFolders));
		return newFolders;
	});

	conversations.update((conversations) => {
		const newConversations = conversations.map((c) => {
			if (c.folderID === folderID) return { ...c, folderID: undefined };
			return c;
		});
		localStorage.setItem('conversationHistory', JSON.stringify(newConversations));
		return newConversations;
	});

	prompts.update((prompts) => {
		const newPrompts = prompts.map((p) => {
			if (p.folderID === folderID) return { ...p, folderID: undefined };
			return p;
		});
		localStorage.setItem('prompts', JSON.stringify(newPrompts));
		return newPrompts;
	});
}

export function handleUpdateFolder(folderID: string, name: string) {
	folders.update((folders) => {
		const newFolders = folders.map((f) => {
			if (f.id === folderID) return { ...f, name };
			return f;
		});
		localStorage.setItem('folders', JSON.stringify(newFolders));
		return newFolders;
	});
}

export function handleNewConversation() {
	const convs = get(conversations);
	const lastConversation = convs[convs.length - 1];
	const newConversation: Conversation = {
		id: uuidv4(),
		name: 'New Conversation',
		messages: [],
		model: lastConversation?.model ?? OpenAIModels[PUBLIC_DEFAULT_MODEL as OpenAIModelID],
		prompt: PUBLIC_DEFAULT_SYSTEM_PROMPT,
		temperature: lastConversation?.temperature ?? PUBLIC_DEFAULT_TEMPERATURE
	};

	conversations.update((conversations) => {
		const newConversations = [...conversations, newConversation];
		localStorage.setItem('conversationHistory', JSON.stringify(newConversations));
		return newConversations;
	});
	selectedConversation.set(newConversation);
	localStorage.setItem('selectedConversation', JSON.stringify(newConversation));

	loading.set(false);
}

export function handleUpdateConversation(conversation: Conversation, data: KeyValuePair) {
	const updatedConversation = {
		...conversation,
		[data.key]: data.value
	};

	conversations.update((conversations) => {
		const newConversations = conversations.map((c) => {
			if (c.id === conversation.id) return updatedConversation;
			return c;
		});
		localStorage.setItem('conversationHistory', JSON.stringify(newConversations));
		return newConversations;
	});
	selectedConversation.set(updatedConversation);
	localStorage.setItem('selectedConversation', JSON.stringify(updatedConversation));
}

export function handleExportData() {
	let history = localStorage.getItem('conversationHistory');
	let folders = localStorage.getItem('folders');
	let prompts = localStorage.getItem('prompts');

	if (history) {
		history = JSON.parse(history);
	}

	if (folders) {
		folders = JSON.parse(folders);
	}

	if (prompts) {
		prompts = JSON.parse(prompts);
	}

	const data = {
		version: 4,
		history: history || [],
		folders: folders || [],
		prompts: prompts || []
	};

	const date = new Date();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const currentDate = `${month}-${day}`;

	const blob = new Blob([JSON.stringify(data, null, 2)], {
		type: 'application/json'
	});
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.download = `chatbot_ui_history_${currentDate}.json`;
	link.href = url;
	link.style.display = 'none';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export interface ExportFormatV4 {
	version: 4;
	history: Conversation[];
	folders: FolderInterface[];
	prompts: Prompt[];
}

export function handleImportConversations(data: ExportFormatV4) {
	const { history, folders: localFolders, prompts: localPrompts } = data;

	const oldConversations = localStorage.getItem('conversationHistory');
	const oldConversationsParsed = oldConversations ? JSON.parse(oldConversations) : [];

	const newHistory: Conversation[] = [...oldConversationsParsed, ...history].filter(
		(conversation, index, self) => index === self.findIndex((c) => c.id === conversation.id)
	);
	localStorage.setItem('conversationHistory', JSON.stringify(newHistory));
	if (newHistory.length > 0) {
		localStorage.setItem('selectedConversation', JSON.stringify(newHistory[newHistory.length - 1]));
	} else {
		localStorage.removeItem('selectedConversation');
	}

	const oldFolders = localStorage.getItem('folders');
	const oldFoldersParsed = oldFolders ? JSON.parse(oldFolders) : [];
	const newFolders: FolderInterface[] = [...oldFoldersParsed, ...localFolders].filter(
		(folder, index, self) => index === self.findIndex((f) => f.id === folder.id)
	);
	localStorage.setItem('folders', JSON.stringify(newFolders));

	const oldPrompts = localStorage.getItem('prompts');
	const oldPromptsParsed = oldPrompts ? JSON.parse(oldPrompts) : [];
	const newPrompts: Prompt[] = [...oldPromptsParsed, ...localPrompts].filter(
		(prompt, index, self) => index === self.findIndex((p) => p.id === prompt.id)
	);
	localStorage.setItem('prompts', JSON.stringify(newPrompts));

	conversations.set(history);
	selectedConversation.set(history[history.length - 1]);
	folders.set(localFolders);
	prompts.set(localPrompts);

	window.location.reload();
}

export function handleClearConversations() {
	selectedConversation.set({
		id: uuidv4(),
		name: 'New Conversation',
		messages: [],
		model: OpenAIModels[PUBLIC_DEFAULT_MODEL as OpenAIModelID],
		prompt: PUBLIC_DEFAULT_SYSTEM_PROMPT,
		temperature: +PUBLIC_DEFAULT_TEMPERATURE
	});
	conversations.set([]);
	localStorage.removeItem('conversationHistory');
	localStorage.removeItem('selectedConversation');
	folders.update((folders) => {
		const newFolders = folders.filter((f) => f.type !== 'chat');
		localStorage.setItem('folders', JSON.stringify(newFolders));
		return newFolders;
	});
}

export function handleDeleteConversation(conversation: Conversation) {
	let localConversations: Conversation[] = [];
	conversations.update((conversations) => {
		const newConversations = conversations.filter((c) => c.id !== conversation.id);
		localStorage.setItem('conversationHistory', JSON.stringify(newConversations));
		localConversations = newConversations;
		return newConversations;
	});
	searchTerm.set('');
	if (localConversations.length > 0) {
		selectedConversation.set(localConversations[localConversations.length - 1]);
		localStorage.setItem(
			'selectedConversation',
			JSON.stringify(localConversations[localConversations.length - 1])
		);
	} else {
		selectedConversation.set({
			id: uuidv4(),
			name: 'New Conversation',
			messages: [],
			model: OpenAIModels[PUBLIC_DEFAULT_MODEL as OpenAIModelID],
			prompt: PUBLIC_DEFAULT_SYSTEM_PROMPT,
			temperature: +PUBLIC_DEFAULT_TEMPERATURE
		});
		localStorage.removeItem('selectedConversation');
	}
}

export function handleToggleChatbar() {
	showChatbar.update((showChatbar) => {
		const newShowChatbar = !showChatbar;
		localStorage.setItem('showChatbar', JSON.stringify(newShowChatbar));
		return newShowChatbar;
	});
}

export function handleDrop(e: DragEvent) {
	if (e.dataTransfer) {
		const conversation = JSON.parse(e.dataTransfer.getData('conversation'));
		handleUpdateConversation(conversation, { key: 'folderID', value: 0 });
		searchTerm.set('');
		(e.target as HTMLDivElement).style.background = 'none';
	}
}

export function handleTogglePromptbar() {
	showPromptbar.update((showPromptbar) => {
		const newShowPomptbar = !showPromptbar;
		localStorage.setItem('showPromptbar', JSON.stringify(newShowPomptbar));
		return newShowPomptbar;
	});
}

export function handleCreatePrompt() {
	const newPrompt: Prompt = {
		id: uuidv4(),
		name: `Prompt ${get(prompts).length + 1}`,
		description: '',
		content: '',
		model: OpenAIModels[PUBLIC_DEFAULT_MODEL as OpenAIModelID]
	};
	prompts.update((prompts) => {
		const newPrompts = [...prompts, newPrompt];
		localStorage.setItem('prompts', JSON.stringify(newPrompts));
		return newPrompts;
	});
}

export function handleDeletePrompt(prompt: Prompt) {
	prompts.update((prompts) => {
		const newPrompts = prompts.filter((p) => p.id !== prompt.id);
		localStorage.setItem('prompts', JSON.stringify(newPrompts));
		return newPrompts;
	});
}

export function handleUpdatePrompt(prompt: Prompt) {
	prompts.update((prompts) => {
		const newPrompts = prompts.map((p) => {
			if (p.id === prompt.id) return prompt;
			return p;
		});
		localStorage.setItem('prompts', JSON.stringify(newPrompts));
		return newPrompts;
	});
}

export function handleDropPrompt(e: DragEvent) {
	if (e.dataTransfer) {
		const prompt = JSON.parse(e.dataTransfer.getData('prompt'));
		handleUpdatePrompt({ ...prompt, folderID: (e.target as HTMLDivElement).dataset.folderID });
		(e.target as HTMLDivElement).style.background = 'none';
	}
}
