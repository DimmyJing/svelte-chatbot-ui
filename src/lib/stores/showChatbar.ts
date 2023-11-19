import { storable } from './localStorage';
import { boolean } from 'valibot';

export const showChatbar = storable('showChatbar', boolean(), true);
export const showPromptbar = storable('showPromptbar', boolean(), true);
