import { writable } from 'svelte/store';
import { storable } from './localStorage';
import { array, literal, number, object, string, undefined_, union } from 'valibot';

export const model = object({
	id: string(),
	name: string(),
	maxLength: number(),
	tokenLimit: number()
});

const conversation = object({
	id: string(),
	name: string(),
	messages: array(
		object({ role: union([literal('assistant'), literal('user')]), content: string() })
	),
	model: model,
	prompt: string(),
	temperature: number(),
	folderID: union([string(), undefined_()])
});

export const selectedConversation = storable(
	'selectedConversation',
	union([conversation, undefined_()]),
	undefined
);
export const conversations = storable('conversationHistory', array(conversation), []);
export const stopConversation = writable(false);
