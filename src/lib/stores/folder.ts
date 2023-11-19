import { array, literal, object, string, union } from 'valibot';
import { storable } from './localStorage';

const folder = object({
	id: string(),
	name: string(),
	type: union([literal('chat'), literal('prompt')])
});
export const folders = storable('folders', array(folder), []);
