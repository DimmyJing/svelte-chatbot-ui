<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-french-toast';
	import 'svelte-highlight/styles/onedark.css';
</script>

<main class="font-sans">
	<Toaster />
	<slot />
</main>
