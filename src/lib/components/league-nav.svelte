<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';

	type ActivePage = 'dashboard' | 'picks' | 'season-pick' | 'standings' | 'my-season';

	let {
		leagueId,
		leagueName,
		seasonStatus,
		activePage
	}: {
		leagueId: string;
		leagueName: string;
		seasonStatus: 'setup' | 'open' | 'active' | 'archived' | null;
		activePage: ActivePage;
	} = $props();

	const items = $derived([
		{
			page: 'dashboard' as const,
			label: 'Dashboard',
			href: resolve('/leagues/[id]', { id: leagueId })
		},
		...(seasonStatus === 'active'
			? [
					{
						page: 'picks' as const,
						label: 'Make your pick',
						href: resolve('/leagues/[id]/picks', { id: leagueId })
					},
					{
						page: 'season-pick' as const,
						label: 'Season pick',
						href: resolve('/leagues/[id]/season-pick', { id: leagueId })
					}
				]
			: []),
		...(seasonStatus === 'active' || seasonStatus === 'archived'
			? [
					{
						page: 'standings' as const,
						label: 'Standings',
						href: resolve('/leagues/[id]/standings', { id: leagueId })
					},
					{
						page: 'my-season' as const,
						label: 'My season',
						href: resolve('/leagues/[id]/my-season', { id: leagueId })
					}
				]
			: [])
	] satisfies { page: ActivePage; label: string; href: string }[]);
</script>

<div class="mb-6 flex flex-col gap-3">
	<a href={resolve('/leagues')} class="text-muted-foreground w-fit text-sm hover:underline">
		&larr; My leagues
	</a>
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-2xl font-semibold tracking-tight">{leagueName}</h1>
		<div class="flex flex-wrap gap-2">
			{#each items as item (item.page)}
				<Button
					href={item.href}
					size="sm"
					variant={item.page === activePage ? 'default' : 'outline'}
				>
					{item.label}
				</Button>
			{/each}
		</div>
	</div>
</div>
