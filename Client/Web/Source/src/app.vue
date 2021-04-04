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

.app-wrapper {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
}
</style>
