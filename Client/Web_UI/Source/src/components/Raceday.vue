<template>
  <div>
    <h1>Raceday</h1>
    {{info}}
  </div>
</template>


<script>

import axios from 'axios';

export default {

  name: 'Raceday',

  data: function() {
    return {
      info: null
    };
  },

  mounted: function() {
    axios.get("events").then(response => (this.info = response.data));
  }
}

</script>


<style scoped>



</style>
