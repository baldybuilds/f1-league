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

	let p1 = $state(untrack(() => data.currentPick?.p1DriverId ?? ''));
	let p2 = $state(untrack(() => data.currentPick?.p2DriverId ?? ''));
	let p3 = $state(untrack(() => data.currentPick?.p3DriverId ?? ''));

	const driverById = $derived(new Map(data.drivers.map((driver) => [driver.id, driver])));

	function driverLabel(id: string | null) {
		if (!id) return 'Unknown driver';
		const driver = driverById.get(id);
		return driver ? `${driver.code} - ${driver.name} (${driver.team})` : 'Unknown driver';
	}
</script>

<div class="flex flex-col gap-6">
	<LeagueNav
		leagueId={data.leagueId}
		leagueName={data.leagueName}
		seasonStatus={data.seasonStatus}
		activePage="picks"
	/>

	{#if !data.season}
		<Alert>
			<AlertDescription>This league's season hasn't been activated yet.</AlertDescription>
		</Alert>
	{:else if !data.round}
		<Alert>
			<AlertDescription>No upcoming round is open for picks right now.</AlertDescription>
		</Alert>
	{:else}
		<Card>
			<CardHeader>
				<CardTitle>Round {data.round.roundNumber} - {data.round.name}</CardTitle>
				<CardDescription>
					Locks {new Date(data.round.lockAt).toLocaleString()}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{#if form?.error}
					<Alert variant="destructive" class="mb-4">
						<AlertDescription>{form.error}</AlertDescription>
					</Alert>
				{:else if form?.success}
					<Alert class="mb-4">
						<AlertDescription>Pick saved.</AlertDescription>
					</Alert>
				{/if}

				<form method="POST" action="?/submitPick" use:enhance class="flex flex-col gap-4">
					<input type="hidden" name="roundId" value={data.round.id} />

					<div class="space-y-2">
						<Label for="p1DriverId">P1</Label>
						<Select type="single" name="p1DriverId" bind:value={p1}>
							<SelectTrigger id="p1DriverId" class="w-full">
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
						<Label for="p2DriverId">P2</Label>
						<Select type="single" name="p2DriverId" bind:value={p2}>
							<SelectTrigger id="p2DriverId" class="w-full">
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
						<Label for="p3DriverId">P3</Label>
						<Select type="single" name="p3DriverId" bind:value={p3}>
							<SelectTrigger id="p3DriverId" class="w-full">
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

					<Button type="submit">Save pick</Button>
				</form>
			</CardContent>
		</Card>
	{/if}

	{#if data.pastPicks.length > 0}
		<Card>
			<CardHeader>
				<CardTitle>Past picks</CardTitle>
			</CardHeader>
			<CardContent class="flex flex-col gap-2">
				{#each data.pastPicks as pick (pick.roundNumber)}
					<div class="flex items-center justify-between text-sm">
						<span>
							Round {pick.roundNumber} - {pick.roundName}: {driverLabel(pick.p1DriverId)}, {driverLabel(
								pick.p2DriverId
							)}, {driverLabel(pick.p3DriverId)}
						</span>
						<span class="text-muted-foreground">
							{pick.points === null ? 'not scored yet' : `${pick.points} pts`}
						</span>
					</div>
				{/each}
			</CardContent>
		</Card>
	{/if}
</div>
