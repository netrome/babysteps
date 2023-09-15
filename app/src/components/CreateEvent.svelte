<script>
    let eventData = {
        type: "",
        time: "",
        //... other fields
    };

    function handleSubmit() {
        // Submit to backend
    }
</script>

<h2>Create Event</h2>

<form on:submit|preventDefault={handleSubmit}>
    <!-- Input fields for event data -->
    <button type="submit">Create</button>
</form>

<a href="/view">View events</a>
