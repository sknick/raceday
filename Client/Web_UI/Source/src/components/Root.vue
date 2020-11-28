<template>
  <div>
    <table class="table">
      <thead>
        <tr>
          <th>Series</th>
          <th>Event</th>
        </tr>
      </thead>

      <tbody>
        <template v-for="event in events" v-bind:key="event">
          <tr @click="toggleEvent(event.id)">
            <td>{{event.series.name}}</td>
            <td>{{event.name}}</td>
          </tr>

          <template v-if="shownEvents.includes(event.id)">
            <template v-if="event.broadcasts.length > 0">
              <tr v-for="broadcast in event.broadcasts" v-bind:key="broadcast">
                <td colspan="2"><a :href="broadcast.url" target="_blank">{{broadcast.url}}</a></td>
              </tr>
            </template>
            <template v-else>
              <tr>
                <td colspan="2">(No Streams)</td>
              </tr>
            </template>
          </template>
        </template>
      </tbody>
    </table>
  </div>
</template>


<script>

import axios from "axios";

export default {
  
  name: "Root",
  
  data: function() {
    return {
      events: null,
      shownEvents: []
    };
  },
  
  mounted: function() {
    axios.get(
      "events?window_start=" + (new Date(2020, 10, 15).getTime() / 1000)
    ).then(
        response => (this.events = response.data)
    );
  },

  methods: {
    toggleEvent: function(eventId) {
      const self = this;

      axios.get(
          "broadcasts?event_id=" + eventId
      ).then(
          function(response) {
            for (let i = 0; i < self.events.length; i++) {
              if (self.events[i].id === eventId) {
                self.events[i].broadcasts = [];
                for (let j = 0; j < response.data.length; j++) {
                  self.events[i].broadcasts.push(response.data[j]);
                }

                break;
              }
            }

            const index = self.shownEvents.indexOf(eventId);
            if (index > -1) {
              self.shownEvents.splice(index, 1);
            } else {
              self.shownEvents.push(eventId);
            }
          }
      );
    }
  }
}

</script>


<style scoped>



</style>
