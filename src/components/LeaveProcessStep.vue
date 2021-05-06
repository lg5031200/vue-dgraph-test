<template>
  <v-stepper v-model="current">
    <!-- {{ leaveProcesses }} -->
    <v-stepper-header>
      <template v-for="(process, index) in leaveProcesses">
        <v-stepper-step
          :key="`${index}-step`"
          :complete="current > index"
          :step="index + 1"
          editable
        >
          {{ process.node_name }}
        </v-stepper-step>

        <v-divider
          v-if="index + 1 !== leaveProcesses.length"
          :key="index"
        ></v-divider>
      </template>
    </v-stepper-header>
  </v-stepper>
</template>
<script>
export default {
  props: ['leaveProcesses'],
  data() {
    return {
      current: 0,
    };
  },
};
</script>
