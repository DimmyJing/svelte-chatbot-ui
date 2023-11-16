import { getModels } from '$lib/server/models';

export async function load() {
	return {
		models: getModels()
	};
}
