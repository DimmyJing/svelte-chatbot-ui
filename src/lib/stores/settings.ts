import { storable } from './localStorage';
import { literal, object, union } from 'valibot';

export const settings = storable(
	'settings',
	object({ theme: union([literal('light'), literal('dark')]) }),
	{ theme: 'dark' }
);
