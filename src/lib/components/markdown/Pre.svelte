<script lang="ts">
	import { setContext } from 'svelte';

	setContext('inPre', true);
</script>

<pre {...$$props}><slot /></pre>
