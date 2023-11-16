import { getModels } from '$lib/server/model';

export async function load() {
	return {
		models: await getModels()
	};
}
