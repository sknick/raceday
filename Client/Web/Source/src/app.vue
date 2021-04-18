<template>
    <div class="app-wrapper">

        <EventListByDay/>

    </div>
</template>


<script>

import EventListByDay from "./main/event-list-by-day.vue"

export default {
    name: "App",

    components: {
        EventListByDay
    }
}

</script>


<style>

:root {
    --dp-border-radius: 6px;
    --dp-child-border-md: 4px;
    --dp-child-border-sm: 4px;
    --button-background: var(--dark);
    --button-background-hover: var(--primary);
    --button-text-color: var(--light);
    --button-text-color-hover: var(--secondary);
    --button-shadow: 0 3px 6px rgba(39, 43, 48, 0.8), 0 3px 6px rgba(0, 0, 0, 0.9);
}

.app-wrapper {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
}
@import "css/datepicker.css";

</style>
