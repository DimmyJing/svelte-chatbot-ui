import { array, object, string, undefined_, union } from 'valibot';
import { model } from './conversation';
import { storable } from './localStorage';

const prompt = object({
	id: string(),
	name: string(),
	description: string(),
	content: string(),
	model: model,
	folderID: union([string(), undefined_()])
});

export const prompts = storable('prompts', array(prompt), []);
