<script lang="ts">
    import Router from 'svelte-spa-router';
    import routes from './routes.ts';
</script>

<Router {routes} />

<a href="/create">Create Event</a>
<a href="/view">View Events</a>
