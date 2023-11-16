import { writable } from 'svelte/store';

export const lightMode = writable<'light' | 'dark'>('dark');
