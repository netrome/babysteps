<script lang="ts">
  import type { Event, EventType } from './event';

  let event: Event = {
    event_type: { "Meal": { quantity: 100, food_type: "BreastMilk" } },
    event_time: new Date().toISOString(),
    created_at: new Date().toISOString()
  };
</script>

<main>
  <h1>Your Event</h1>
  <p>Type: {event.event_type.Meal ? 'Meal' : 'Other'}</p>
  <p>Event Time: {event.event_time}</p>
  <p>Created At: {event.created_at}</p>

  {#if event.event_type.Meal}
    <h2>Meal Details</h2>
    <p>Quantity: {event.event_type.Meal.quantity}ml</p>
    <p>Food Type: {event.event_type.Meal.food_type}</p>
  {/if}
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>

