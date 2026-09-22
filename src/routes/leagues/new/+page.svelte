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
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<Card class="mx-auto max-w-sm">
	<CardHeader>
		<CardTitle>Create a league</CardTitle>
		<CardDescription>You'll be the owner - invite friends once it's set up.</CardDescription>
	</CardHeader>
	<CardContent>
		<form method="POST" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="name">League name</Label>
				<Input id="name" name="name" type="text" minlength={2} maxlength={60} required />
			</div>
			<Button type="submit" class="w-full">Create</Button>
		</form>
		{#if form?.error}
			<Alert variant="destructive" class="mt-4">
				<AlertDescription>{form.error}</AlertDescription>
			</Alert>
		{/if}
	</CardContent>
</Card>
