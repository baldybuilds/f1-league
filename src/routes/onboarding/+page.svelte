<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageProps } from './$types';

	let { data, form }: PageProps & { form: ActionData } = $props();
</script>

<h1>Set up your profile</h1>

<form method="POST" use:enhance>
	<label for="displayName">Display name</label>
	<input id="displayName" name="displayName" type="text" minlength="2" maxlength="30" required />

	<label for="avatarColour">Avatar colour</label>
	<select id="avatarColour" name="avatarColour" required>
		{#each data.avatarColours as colour (colour)}
			<option value={colour}>{colour}</option>
		{/each}
	</select>

	<label for="timezone">Timezone</label>
	<select id="timezone" name="timezone" required>
		{#each data.timezones as tz (tz)}
			<option value={tz}>{tz}</option>
		{/each}
	</select>

	<label for="reminderPreference">Reminders</label>
	<select id="reminderPreference" name="reminderPreference" required>
		{#each data.reminderPreferences as pref (pref)}
			<option value={pref}>{pref}</option>
		{/each}
	</select>

	<label>
		<input name="ageConfirmed" type="checkbox" required />
		I confirm I am 18 or over.
	</label>

	<label>
		<input name="termsAccepted" type="checkbox" required />
		I accept the terms (draft).
	</label>

	<label>
		<input name="privacyAccepted" type="checkbox" required />
		I accept the privacy notice (draft).
	</label>

	<button type="submit">Finish setup</button>
</form>

{#if form?.error}
	<p role="alert">{form.error}</p>
{/if}
