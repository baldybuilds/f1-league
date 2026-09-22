<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="flex flex-col gap-8">
	<div class="space-y-2">
		<h1 class="text-3xl font-semibold tracking-tight">Paddock Picks</h1>
		<p class="text-muted-foreground">
			A low-effort, season-long predictions league for your friend group. Pre-launch, targeting the
			2027 season.
		</p>
	</div>

	<Card>
		<CardHeader>
			<CardTitle>{data.user ? 'Welcome back' : 'Get started'}</CardTitle>
			<CardDescription>
				{data.user
					? `Signed in as ${data.user.email}.`
					: 'Sign in if you already have an account, or use an invite link to join a league.'}
			</CardDescription>
		</CardHeader>
		<CardContent class="flex gap-3">
			{#if data.user}
				<Button href={resolve('/leagues/new')}>Create a league</Button>
			{:else}
				<Button href={resolve('/login')}>Sign in</Button>
			{/if}
		</CardContent>
	</Card>
</div>
