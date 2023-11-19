import { writable, type Updater } from 'svelte/store';
import { parse, type BaseSchema, type Input } from 'valibot';

export function storable<TSchema extends BaseSchema>(
	name: string,
	schema: TSchema,
	defaultData: Input<TSchema>
) {
	let localData: Input<TSchema> = defaultData;
	const { subscribe, set, update } = writable(localData);
	let initted = false;

	function init() {
		initted = true;
		try {
			const item = localStorage.getItem(name);
			if (item) localData = parse(schema, JSON.parse(item));
			set(localData);
		} catch (e) {
			console.error(e);
		}
	}

	return {
		subscribe,
		set: (n: Input<TSchema>) => {
			if (typeof window !== undefined && initted) {
				localStorage.setItem(name, JSON.stringify(n));
			}
			set(n);
		},
		update: (fn: Updater<Input<TSchema>>) => {
			update((n) => {
				const updated = fn(n);
				if (typeof window !== undefined && initted) {
					localStorage.setItem(name, JSON.stringify(updated));
				}
				return updated;
			});
		},
		init
	};
}
