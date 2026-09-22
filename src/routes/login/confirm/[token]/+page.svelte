<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
</script>

<Card class="mx-auto max-w-sm">
	<CardHeader>
		<CardTitle>Finish signing in</CardTitle>
		<CardDescription>
			Click below to complete sign-in. This does nothing until you click it, so it's safe if an
			email scanner opened this page for you.
		</CardDescription>
	</CardHeader>
	<CardContent>
		<form method="POST">
			<Button type="submit" class="w-full">Sign in</Button>
		</form>
	</CardContent>
</Card>
