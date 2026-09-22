<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<h1>Create a league</h1>

<form method="POST" use:enhance>
	<label for="name">League name</label>
	<input id="name" name="name" type="text" minlength="2" maxlength="60" required />
	<button type="submit">Create</button>
</form>

{#if form?.error}
	<p role="alert">{form.error}</p>
{/if}
