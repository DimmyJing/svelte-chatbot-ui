import {
	OPENAI_API_HOST,
	OPENAI_API_KEY,
	OPENAI_API_TYPE,
	OPENAI_ORGANIZATION
} from '$env/static/private';
import {
	PUBLIC_DEFAULT_MODEL,
	PUBLIC_DEFAULT_SYSTEM_PROMPT,
	PUBLIC_DEFAULT_TEMPERATURE
} from '$env/static/public';
import type { Message } from '$lib/types/chat.js';
import { OpenAIModelID, OpenAIModels, type OpenAIModel } from '$lib/types/openai.js';
import { type ParsedEvent, type ReconnectInterval, createParser } from 'eventsource-parser';

class OpenAIError extends Error {
	type: string;
	param: string;
	code: string;

	constructor(message: string, type: string, param: string, code: string) {
		super(message);
		this.name = 'OpenAIError';
		this.type = type;
		this.param = param;
		this.code = code;
	}
}

async function OpenAIStream(
	model: OpenAIModel,
	systemPrompt: string,
	temperature: number,
	messages: Message[]
) {
	const url = `${OPENAI_API_HOST}/v1/chat/completions`;
	/*
	if (OPENAI_API_TYPE === 'azure')
		url = `${OPENAI_API_HOST}/openai/deployments/${AZURE_DEPLOYMENT_ID}/chat/completions?api-version=${OPENAI_API_VERSION}`;
  */
	const res = await fetch(url, {
		headers: {
			'Content-Type': 'application/json',
			...(OPENAI_API_TYPE === 'openai' && { Authorization: `Bearer ${OPENAI_API_KEY}` }),
			...(OPENAI_API_TYPE === 'azure' && { 'api-key': `${OPENAI_API_KEY}` }),
			...(OPENAI_API_TYPE === 'openai' &&
				OPENAI_ORGANIZATION && { 'OpenAI-Organization': OPENAI_ORGANIZATION })
		},
		method: 'POST',
		body: JSON.stringify({
			...(OPENAI_API_TYPE === 'openai' && { model: model.id }),
			messages: [{ role: 'system', content: systemPrompt }, ...messages],
			max_tokens: 1000,
			temperature: temperature,
			stream: true
		})
	});

	const encoder = new TextEncoder();
	const decoder = new TextDecoder();

	if (res.status !== 200) {
		const result = await res.json();
		if (result.error) {
			throw new OpenAIError(
				result.error.message,
				result.error.type,
				result.error.param,
				result.error.code
			);
		} else {
			throw new Error(
				`OpenAI API returned an error: ${decoder.decode(result?.value) || result.statusText}`
			);
		}
	}

	const stream = new ReadableStream({
		async start(controller) {
			const onParse = (event: ParsedEvent | ReconnectInterval) => {
				if (event.type === 'event') {
					const data = event.data;

					try {
						const json = JSON.parse(data);
						if (json.choices[0].finish_reason != null) {
							controller.close();
							return;
						}
						const text = json.choices[0].delta.content;
						const queue = encoder.encode(text);
						controller.enqueue(queue);
					} catch (e) {
						controller.error(e);
					}
				}
			};

			const parser = createParser(onParse);

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			for await (const chunk of res.body as any) {
				parser.feed(decoder.decode(chunk));
			}
		}
	});

	return stream;
}

export async function POST({ request }) {
	const { model, messages, prompt, temperature } = await request.json();

	let promptToSend: string = prompt;
	if (!promptToSend) promptToSend = PUBLIC_DEFAULT_SYSTEM_PROMPT;

	let temperatureToUse = temperature;
	if (!temperatureToUse) temperatureToUse = PUBLIC_DEFAULT_TEMPERATURE;

	let charCount = promptToSend.length;
	let messagesToSend: Message[] = [];

	let actModel = OpenAIModels[PUBLIC_DEFAULT_MODEL as OpenAIModelID];
	if (model) actModel = model;

	if (messages && messages.length > 0) {
		for (let i = messages.length - 1; i >= 0; i--) {
			const message = messages[i] as Message;
			const tokens = message.content;

			if (charCount + tokens.length + 1000 > actModel.maxLength) break;

			charCount += tokens.length;
			messagesToSend = [message, ...messagesToSend];
		}
	}

	const stream = await OpenAIStream(actModel, promptToSend, temperatureToUse, messagesToSend);

	return new Response(stream as ReadableStream<string>);
}
