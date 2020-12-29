<template>
  <div id="app">
    <DSD msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import DSD from './components/DSD.vue'

export default {
  name: 'App',
  components: {
    DSD
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
}
</style>
