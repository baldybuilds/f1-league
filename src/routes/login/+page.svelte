<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<h1>Sign in</h1>

{#if form?.sent}
	<p>Check your email for a sign-in link. It expires in 15 minutes.</p>
{:else}
	<form method="POST" use:enhance>
		<label for="email">Email</label>
		<input id="email" name="email" type="email" required autocomplete="email" />
		<button type="submit">Send sign-in link</button>
	</form>
	{#if form?.error}
		<p role="alert">{form.error}</p>
	{/if}
{/if}
