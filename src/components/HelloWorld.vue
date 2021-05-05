<template>
  <v-container>
    <v-btn @click="getData">Test</v-btn>
    <div>
      {{ dgraphData }}
    </div>
  </v-container>
</template>

<script>
import { main } from '../utils/dgraph-client';

export default {
  name: 'HelloWorld',
  data() {
    return {
      dgraphData: null,
    };
  },
  methods: {
    async getData() {
      this.dgraphData = await main();
    },
  },
};
</script>
