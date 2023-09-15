<script>
    let events = [];

    onMount(async () => {
        // Fetch events from backend
    });
</script>

<h2>Recent Events</h2>
<ul>
    {#each events as event}
        <li>{event.type} - {event.time}</li>
    {/each}
</ul>

<a href="/create">Create an event</a>
