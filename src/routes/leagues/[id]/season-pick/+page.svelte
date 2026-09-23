<script lang="ts">
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';
	import LeagueNav from '$lib/components/league-nav.svelte';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
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

	let wdcDriverId = $state(untrack(() => data.currentPick?.wdcDriverId ?? ''));
	let wccTeam = $state(untrack(() => data.currentPick?.wccTeam ?? ''));
</script>

<div class="flex flex-col gap-6">
	<LeagueNav
		leagueId={data.leagueId}
		leagueName={data.leagueName}
		seasonStatus={data.seasonStatus}
		activePage="season-pick"
	/>
	<p class="text-muted-foreground -mt-4 text-sm">
		Pick the drivers' and constructors' champions for the season. Locks when round 1 starts.
	</p>

	{#if !data.season}
		<Alert>
			<AlertDescription>This league's season hasn't been activated yet.</AlertDescription>
		</Alert>
	{:else if data.locked}
		<Alert>
			<AlertDescription>
				Season picks are locked - round 1 has started.
				{#if data.currentPick}
					Your pick is locked in.
				{/if}
			</AlertDescription>
		</Alert>
	{:else}
		<Card>
			<CardHeader>
				<CardTitle>Your pick</CardTitle>
				<CardDescription>You can change this until round 1 locks.</CardDescription>
			</CardHeader>
			<CardContent>
				{#if form?.error}
					<Alert variant="destructive" class="mb-4">
						<AlertDescription>{form.error}</AlertDescription>
					</Alert>
				{:else if form?.success}
					<Alert class="mb-4">
						<AlertDescription>Season pick saved.</AlertDescription>
					</Alert>
				{/if}

				<form method="POST" use:enhance class="flex flex-col gap-4">
					<div class="space-y-2">
						<Label for="wdcDriverId">WDC winner</Label>
						<Select type="single" name="wdcDriverId" bind:value={wdcDriverId}>
							<SelectTrigger id="wdcDriverId" class="w-full">
								<SelectValue placeholder="Choose a driver" />
							</SelectTrigger>
							<SelectContent>
								{#each data.drivers as driver (driver.id)}
									<SelectItem value={driver.id}
										>{driver.code} - {driver.name} ({driver.team})</SelectItem
									>
								{/each}
							</SelectContent>
						</Select>
					</div>

					<div class="space-y-2">
						<Label for="wccTeam">WCC winner</Label>
						<Select type="single" name="wccTeam" bind:value={wccTeam}>
							<SelectTrigger id="wccTeam" class="w-full">
								<SelectValue placeholder="Choose a team" />
							</SelectTrigger>
							<SelectContent>
								{#each data.teams as team (team)}
									<SelectItem value={team}>{team}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</div>

					<Button type="submit">Save season pick</Button>
				</form>
			</CardContent>
		</Card>
	{/if}
</div>
