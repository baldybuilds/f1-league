<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageProps } from './$types';

	let { data, form }: PageProps & { form: ActionData } = $props();
</script>

<h1>Join {data.leagueName}</h1>
<p>Invited by {data.ownerDisplayName}.</p>

{#if data.signedIn}
	<form method="POST" action="?/joinNow" use:enhance>
		<button type="submit">Join league</button>
	</form>
{:else if form?.sent}
	<p>Check your email for a sign-in link. It expires in 15 minutes.</p>
{:else}
	<form method="POST" action="?/sendLink" use:enhance>
		<label for="email">Email</label>
		<input id="email" name="email" type="email" required autocomplete="email" />
		<button type="submit">Send sign-in link</button>
	</form>
{/if}

{#if form?.error}
	<p role="alert">{form.error}</p>
{/if}
