import CreateEvent from './components/CreateEvent.svelte';
import ViewEvents from './components/ViewEvents.svelte';

const routes = {
    '/create': CreateEvent,
    '/view': ViewEvents,
    '*': ViewEvents  // default route
};

export default routes;
