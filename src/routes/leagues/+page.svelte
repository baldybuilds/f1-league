<script lang="ts">
	import { resolve } from '$app/paths';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-semibold tracking-tight">My leagues</h1>
		<Button href={resolve('/leagues/new')}>Create a league</Button>
	</div>

	{#if data.leagues.length === 0}
		<p class="text-muted-foreground text-sm">
			You're not in any leagues yet. Create one, or ask a friend for an invite link.
		</p>
	{:else}
		<div class="flex flex-col gap-3">
			{#each data.leagues as league (league.leagueId)}
				<a href={resolve('/leagues/[id]', { id: league.leagueId })}>
					<Card class="hover:bg-muted/50 transition-colors">
						<CardHeader class="flex-row items-center justify-between space-y-0">
							<CardTitle>{league.leagueName}</CardTitle>
							<div class="flex gap-2">
								<Badge variant="outline">{league.role}</Badge>
								{#if league.status === 'pending'}
									<Badge variant="secondary">pending approval</Badge>
								{/if}
							</div>
						</CardHeader>
						<CardContent>
							<p class="text-muted-foreground text-sm">
								{league.seasonYear} season - {league.seasonStatus}
							</p>
						</CardContent>
					</Card>
				</a>
			{/each}
		</div>
	{/if}
</div>
