<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>F1 Predictions League</h1>
<p>Pre-launch. Targeting the 2027 season.</p>

{#if data.user}
	<p>Signed in as {data.user.email}.</p>
	<form method="POST" action="/logout">
		<button type="submit">Sign out</button>
	</form>
{:else}
	<a href={resolve('/login')}>Sign in</a>
{/if}
