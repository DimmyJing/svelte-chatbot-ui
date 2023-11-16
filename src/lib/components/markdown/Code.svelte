<script lang="ts">
	import { messageIsStreaming } from '$lib/stores/messageIsStreaming';
	import Icon from '@iconify/svelte';
	import { getContext, onMount } from 'svelte';
	import { HighlightAuto } from 'svelte-highlight';

	let spanRef: HTMLSpanElement;
	let spanContent: string = '';
	let language: string = '';
	let extraClasses: string = '';
	const inPre = getContext('inPre') === true;

	let isCopied = false;

	const programmingLanguages: Record<string, string> = {
		javascript: '.js',
		python: '.py',
		java: '.java',
		c: '.c',
		cpp: '.cpp',
		'c++': '.cpp',
		'c#': '.cs',
		ruby: '.rb',
		php: '.php',
		swift: '.swift',
		'objective-c': '.m',
		kotlin: '.kt',
		typescript: '.ts',
		go: '.go',
		perl: '.pl',
		rust: '.rs',
		scala: '.scala',
		haskell: '.hs',
		lua: '.lua',
		shell: '.sh',
		sql: '.sql',
		html: '.html',
		css: '.css'
		// add more file extensions here, make sure the key is same as language prop in CodeBlock.tsx component
	};

	export const generateRandomString = (length: number, lowercase = false) => {
		const chars = 'ABCDEFGHJKLMNPQRSTUVWXY3456789'; // excluding similar looking characters like Z, 2, I, 1, O, 0
		let result = '';
		for (let i = 0; i < length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return lowercase ? result.toLowerCase() : result;
	};

	onMount(() => {
		spanContent = spanRef.innerHTML;
		if (spanContent[0] !== '▍') spanContent = spanContent.replace('`▍`', '▍');
		if ($$props.class) {
			const match = /language-(\w+)/.exec($$props.class || '');
			language = (match && match[1]) || '';
			extraClasses = $$props.class;
			delete $$props.class;
		}
	});

	function copyToClipboard() {
		if (!navigator.clipboard || !navigator.clipboard.writeText) {
			return;
		}

		navigator.clipboard.writeText(spanContent).then(() => {
			isCopied = true;

			setTimeout(() => {
				isCopied = false;
			}, 2000);
		});
	}

	function downloadAsFile() {
		const fileExtension = programmingLanguages[language] || '.file';
		const suggestedFileName = `file-${generateRandomString(3, true)}${fileExtension}`;
		const fileName = window.prompt('Enter file name' || '', suggestedFileName);

		if (!fileName) {
			// user pressed cancel on prompt
			return;
		}

		const blob = new Blob([spanContent], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.download = fileName;
		link.href = url;
		link.style.display = 'none';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
</script>

<span class="hidden" bind:this={spanRef}>
	<slot />
</span>
{#if spanContent[0] === '▍'}
	<span class="mt-1 cursor-default animate-pulse {extraClasses}" {...$$props}>▍</span>
{/if}
{#if inPre}
	<div class="codeblock relative font-sans text-[16px]">
		<div class="flex items-center justify-between py-1.5 px-4">
			<span class="text-xs text-white lowercase">{language}</span>
			<div class="flex items-center">
				<button
					class="flex gap-1.5 items-center rounded bg-none p-1 text-xs text-white"
					on:click={copyToClipboard}
				>
					{#if isCopied}
						<Icon icon="tabler:check" width={18} height={18} />
						{'Copied!'}
					{:else}
						<Icon icon="tabler:clipboard" width={18} height={18} />
						{'Copy code'}
					{/if}
				</button>
				<button
					class="flex items-center p-1 text-xs text-white rounded bg-none"
					on:click={downloadAsFile}
				>
					<Icon icon="tabler:download" width={18} height={18} />
				</button>
			</div>
		</div>
		<HighlightAuto code={spanContent} class="p-0 m-0" />
	</div>
{:else}
	<code class={extraClasses} {...$$props}><slot /></code>
{/if}
