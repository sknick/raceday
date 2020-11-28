<template>
  <div>
    <table class="table">
      <thead>
        <tr>
          <th>Event</th>
          <th>Description</th>
        </tr>
      </thead>

      <tbody>
        <template v-for="event in events" v-bind:key="event">
          <tr @click="toggleEvent(event.id)">
            <td>{{event.name}}</td>
            <td>{{event.description}}</td>
          </tr>

          <template v-if="shownEvents.includes(event.id)">
            <template v-if="event.streams.length > 0">
              <tr v-for="stream in event.streams" v-bind:key="stream">
                <td colspan="2"><a :href="stream.url" target="_blank">{{stream.url}}</a></td>
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
      "events"
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
                self.events[i].streams = [];
                for (let j = 0; j < response.data.length; j++) {
                  self.events[i].streams.push(response.data[j]);
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
