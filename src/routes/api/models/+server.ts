import {
	OPENAI_API_HOST,
	OPENAI_API_KEY,
	OPENAI_API_TYPE,
	OPENAI_API_VERSION,
	OPENAI_ORGANIZATION
} from '$env/static/private';
import { OpenAIModels, OpenAIModelID, type OpenAIModel } from '$lib/types/openai';

export async function GET() {
	let url = `${OPENAI_API_HOST}/v1/models`;
	if (OPENAI_API_TYPE === 'azure') {
		url = `${OPENAI_API_HOST}/openai/deployments?api-version=${OPENAI_API_VERSION}`;
	}

	const response = await fetch(url, {
		headers: {
			'Content-Type': 'application/json',
			...(OPENAI_API_TYPE === 'openai' && {
				Authorization: `Bearer ${OPENAI_API_KEY}`
			}),
			...(OPENAI_API_TYPE === 'azure' && {
				'api-key': `${OPENAI_API_KEY}`
			}),
			...(OPENAI_API_TYPE === 'openai' &&
				OPENAI_ORGANIZATION && {
					'OpenAI-Organization': OPENAI_ORGANIZATION
				})
		}
	});

	if (response.status === 401) {
		console.error('OpenAI API key is invalid', response.headers);
		return new Response(JSON.stringify({ message: 'OpenAI API key is invalid' }), { status: 401 });
	} else if (response.status !== 200) {
		console.error(`OpenAI API returned an error ${response.status}: ${await response.text()}`);
		return new Response(
			JSON.stringify({
				message: `OpenAI API returned an error ${response.status}: ${await response.text()}`
			}),
			{ status: 500 }
		);
	}

	const json = await response.json();

	const models: OpenAIModel[] = json.data
		.map((model: { model: string; id: string }) => {
			const model_name = OPENAI_API_TYPE === 'azure' ? model.model : model.id;
			const found = Object.values(OpenAIModelID).find((val) => val === model_name);
			if (!found) return false;
			return { ...OpenAIModels[found], id: model.id };
		})
		.filter(Boolean);

	return new Response(JSON.stringify(models));
}
