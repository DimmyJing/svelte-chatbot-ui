import type { Prompt } from '$lib/types/prompt';
import { writable } from 'svelte/store';

export const prompts = writable<Prompt[]>([]);
