import axios from "axios"
import { createStore } from "vuex"


export default createStore({
    state: {
        date: null,
        events: []
    },

    getters: {

    },

    mutations: {
        updateDate(state, date) {
            state.date = date
        },

        updateEvents(state, events) {
            state.events = events
        }
    },

    actions: {
        updateDate(context, date) {
            context.commit("updateDate", date)

            const d = new Date()
            d.setHours(12)
            d.setMinutes(0)
            d.setSeconds(0)
            d.setMilliseconds(0)
            
            if (context.state.date) {
                let s = context.state.date.split("/")
                d.setFullYear(parseInt(s[0]))
                d.setMonth(parseInt(s[1]) - 1)
                d.setDate(parseInt(s[2]))
            }

            axios.get(
                "api/events?" +
                "window_start=" + Math.round(d.getTime() / 1000) +
                "&time_zone=" + Intl.DateTimeFormat().resolvedOptions().timeZone
            ).then(
                function(response) {
                    context.commit("updateEvents", response.data)
                }
            )
        }
    }
})
