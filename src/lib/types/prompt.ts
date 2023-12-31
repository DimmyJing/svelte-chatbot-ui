import type { OpenAIModel } from './openai';

export interface Prompt {
	id: string;
	name: string;
	description: string;
	content: string;
	model: OpenAIModel;
	folderID?: string;
}
