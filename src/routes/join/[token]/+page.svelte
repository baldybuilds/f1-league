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
	import type { ActionData, PageProps } from './$types';

	let { data, form }: PageProps & { form: ActionData } = $props();
</script>

<Card class="mx-auto max-w-sm">
	<CardHeader>
		<CardTitle>Join {data.leagueName}</CardTitle>
		<CardDescription>Invited by {data.ownerDisplayName}.</CardDescription>
	</CardHeader>
	<CardContent>
		{#if data.signedIn}
			<form method="POST" action="?/joinNow" use:enhance>
				<Button type="submit" class="w-full">Join league</Button>
			</form>
		{:else if form?.sent}
			<p class="text-sm">Check your email for a sign-in link. It expires in 15 minutes.</p>
		{:else}
			<form method="POST" action="?/sendLink" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input id="email" name="email" type="email" required autocomplete="email" />
				</div>
				<Button type="submit" class="w-full">Send sign-in link</Button>
			</form>
		{/if}
		{#if form?.error}
			<Alert variant="destructive" class="mt-4">
				<AlertDescription>{form.error}</AlertDescription>
			</Alert>
		{/if}
	</CardContent>
</Card>
