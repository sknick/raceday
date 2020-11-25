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
        <tr v-for="event in events" v-bind:key="event">
          <td>{{event.name}}</td>
          <td>{{event.description}}</td>
        </tr>
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
      events: null
    };
  },
  
  mounted: function() {
    axios.get(
      "events"
    ).then(
        response => (this.events = response.data)
    );
  }
}

</script>


<style scoped>



</style>
