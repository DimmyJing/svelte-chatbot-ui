import type { FolderInterface } from '$lib/types/folder';
import { writable } from 'svelte/store';

export const folders = writable<FolderInterface[]>([]);
