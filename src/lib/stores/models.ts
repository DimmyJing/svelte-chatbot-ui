import type { ErrorMessage } from '$lib/types/error';
import type { OpenAIModel } from '$lib/types/openai';
import { writable } from 'svelte/store';

export const models = writable<OpenAIModel[]>([]);
export const modelError = writable<ErrorMessage | undefined>();
