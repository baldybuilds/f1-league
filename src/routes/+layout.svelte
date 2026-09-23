<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<header class="border-border border-b">
		<div class="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
			<a href={resolve('/')} class="text-lg font-semibold tracking-tight">Paddock Picks</a>
			{#if data.user}
				<div class="flex min-w-0 items-center gap-3">
					<Button href={resolve('/career')} variant="ghost" size="sm">Career</Button>
					<span class="text-muted-foreground hidden max-w-[10rem] truncate text-sm sm:inline"
						>{data.user.email}</span
					>
					<form method="POST" action={resolve('/logout')}>
						<Button type="submit" variant="ghost" size="sm">Sign out</Button>
					</form>
				</div>
			{:else}
				<Button href={resolve('/login')} variant="ghost" size="sm">Sign in</Button>
			{/if}
		</div>
	</header>

	<main class="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
		{@render children()}
	</main>

	<footer class="border-border border-t">
		<p class="text-muted-foreground mx-auto max-w-2xl px-4 py-6 text-xs">
			Paddock Picks is unofficial and not affiliated with Formula 1 companies.
		</p>
	</footer>
</div>
