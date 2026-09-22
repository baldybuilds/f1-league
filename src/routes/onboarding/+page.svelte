<script lang="ts">
	import { enhance } from '$app/forms';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue
	} from '$lib/components/ui/select';
	import type { ActionData, PageProps } from './$types';

	let { data, form }: PageProps & { form: ActionData } = $props();

	let avatarColour = $state('');
	let timezone = $state('');
	let reminderPreference = $state('');
	let ageConfirmed = $state(false);
	let termsAccepted = $state(false);
	let privacyAccepted = $state(false);
</script>

<Card class="mx-auto max-w-md">
	<CardHeader>
		<CardTitle>Set up your profile</CardTitle>
		<CardDescription>This only happens once.</CardDescription>
	</CardHeader>
	<CardContent>
		<form method="POST" use:enhance class="space-y-5">
			<div class="space-y-2">
				<Label for="displayName">Display name</Label>
				<Input
					id="displayName"
					name="displayName"
					type="text"
					minlength={2}
					maxlength={30}
					required
				/>
			</div>

			<div class="space-y-2">
				<Label for="avatarColour">Avatar colour</Label>
				<Select type="single" name="avatarColour" bind:value={avatarColour}>
					<SelectTrigger id="avatarColour" class="w-full">
						<span class="flex items-center gap-2">
							{#if avatarColour}
								<span
									class="border-border inline-block size-3 rounded-full border"
									style:background-color={avatarColour}
								></span>
							{/if}
							<SelectValue placeholder="Choose a colour" />
						</span>
					</SelectTrigger>
					<SelectContent>
						{#each data.avatarColours as colour (colour)}
							<SelectItem value={colour}>
								<span class="flex items-center gap-2">
									<span
										class="border-border inline-block size-3 rounded-full border"
										style:background-color={colour}
									></span>
									{colour}
								</span>
							</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</div>

			<div class="space-y-2">
				<Label for="timezone">Timezone</Label>
				<Select type="single" name="timezone" bind:value={timezone}>
					<SelectTrigger id="timezone" class="w-full">
						<SelectValue placeholder="Choose a timezone" />
					</SelectTrigger>
					<SelectContent class="max-h-64">
						{#each data.timezones as tz (tz)}
							<SelectItem value={tz}>{tz}</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</div>

			<div class="space-y-2">
				<Label for="reminderPreference">Reminders</Label>
				<Select type="single" name="reminderPreference" bind:value={reminderPreference}>
					<SelectTrigger id="reminderPreference" class="w-full">
						<SelectValue placeholder="Choose a reminder preference" />
					</SelectTrigger>
					<SelectContent>
						{#each data.reminderPreferences as pref (pref)}
							<SelectItem value={pref}>{pref}</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</div>

			<div class="space-y-3 pt-2">
				<div class="flex items-start gap-2">
					<Checkbox id="ageConfirmed" name="ageConfirmed" required bind:checked={ageConfirmed} />
					<Label for="ageConfirmed" class="text-sm font-normal">I confirm I am 18 or over.</Label>
				</div>
				<div class="flex items-start gap-2">
					<Checkbox id="termsAccepted" name="termsAccepted" required bind:checked={termsAccepted} />
					<Label for="termsAccepted" class="text-sm font-normal">I accept the terms (draft).</Label>
				</div>
				<div class="flex items-start gap-2">
					<Checkbox
						id="privacyAccepted"
						name="privacyAccepted"
						required
						bind:checked={privacyAccepted}
					/>
					<Label for="privacyAccepted" class="text-sm font-normal">
						I accept the privacy notice (draft).
					</Label>
				</div>
			</div>

			<Button type="submit" class="w-full">Finish setup</Button>
		</form>

		{#if form?.error}
			<Alert variant="destructive" class="mt-4">
				<AlertDescription>{form.error}</AlertDescription>
			</Alert>
		{/if}
	</CardContent>
</Card>
