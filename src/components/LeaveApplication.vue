<template>
  <v-container>
    <v-btn @click="getData">Test</v-btn>
    <div>
      {{ dgraphData }}
    </div>
  </v-container>
</template>

<script>
import { getDgraphClient, queryData } from '../utils/dgraph-client';

export default {
  name: 'LeaveApplication',
  data() {
    return {
      dgraphData: null,
    };
  },
  methods: {
    async getData() {
      const dgraphClient = getDgraphClient();
      this.dgraphData = await queryData(dgraphClient);
    },
  },
};
</script>
