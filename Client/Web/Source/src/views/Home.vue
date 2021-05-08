<template>
    <EventListByDay/>
</template>

<script>

import axios from "axios"
import EventListByDay from "../main/event-list-by-day";

export default {
    name: "Home",

    components: {
        EventListByDay
    },

    created() {
        axios.get(
            "api/langs"
        ).then(
            (response) => {
                this.$store.dispatch("updateLangs", response.data)
            }
        )
    }
}

</script>
