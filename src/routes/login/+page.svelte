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
		<CardTitle>Sign in</CardTitle>
		{#if !form?.sent}
			<CardDescription>We'll email you a link to sign in - no password needed.</CardDescription>
		{/if}
	</CardHeader>
	<CardContent>
		{#if form?.sent}
			<p class="text-sm">Check your email for a sign-in link. It expires in 15 minutes.</p>
		{:else}
			<form method="POST" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input id="email" name="email" type="email" required autocomplete="email" />
				</div>
				<Button type="submit" class="w-full">Send sign-in link</Button>
			</form>
			{#if form?.error}
				<Alert variant="destructive" class="mt-4">
					<AlertDescription>{form.error}</AlertDescription>
				</Alert>
			{/if}
		{/if}
	</CardContent>
</Card>
