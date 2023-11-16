import { getModels } from '$lib/server/models';

export async function GET() {
	return new Response(JSON.stringify(getModels()));
}
