import type { Conversation } from '$lib/types/chat';
import { writable } from 'svelte/store';

export const selectedConversation = writable<Conversation | undefined>();
export const conversations = writable<Conversation[]>([]);
export const stopConversation = writable(false);
