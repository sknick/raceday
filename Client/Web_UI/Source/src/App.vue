<template>
  <div id="app">
    <Raceday msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import Raceday from './components/Raceday.vue'

export default {
  name: 'App',
  components: {
    Raceday
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
