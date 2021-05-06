<template>
  <v-dialog persistent max-width="300px" v-model="dialog">
    <template v-slot:activator="{ on: { click } }">
      <v-text-field
        v-on:click="click"
        v-model="dateRangeText"
        label="選擇日期"
        required
      ></v-text-field>
    </template>
    <v-date-picker v-model="dates" range>
      <v-card-actions class="ml-auto">
        <v-btn color="primary" @click="closeDialog">OK</v-btn>
      </v-card-actions></v-date-picker
    >
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      dates: [],
    }
  },
  computed: {
    dateRangeText() {
      return this.dates.length > 0
        ? this.dates
            .slice(0)
            .sort()
            .join(' ~ ')
        : this.dates.slice(0).sort()
    },
  },
  methods: {
    closeDialog() {
      this.dialog = false
      this.$emit('dates-data', this.dates.slice(0).sort())
    },
  },
}
</script>
