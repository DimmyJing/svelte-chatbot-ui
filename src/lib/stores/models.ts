import type { OpenAIModel } from '$lib/types/openai';
import { writable } from 'svelte/store';

export const models = writable<OpenAIModel[]>([]);
