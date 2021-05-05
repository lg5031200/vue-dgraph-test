<template>
  <v-container>
    <h1>請假表單</h1>
    <v-form ref="form" class="pa-4">
      <v-text-field
        v-model="username"
        :counter="10"
        :rules="[(v) => !!v || '必填']"
        label="姓名"
        required
      ></v-text-field>

      <v-select
        v-model="selectLeaveType"
        :items="leaveTypes"
        :rules="[(v) => !!v || '必須選擇一個類別']"
        label="選擇類別"
        required
      ></v-select>

      <date-picker-dialog @dates-data="getDates"></date-picker-dialog>

      <v-btn
        :disabled="!isFormValid"
        color="success"
        class="mr-4"
        @click="sendLeaveProcessForm"
      >
        送出表單
      </v-btn>
    </v-form>
    <div>{{ dgraphData }}</div>
  </v-container>
</template>
<script>
import DatePickerDialog from './DatePickerDialog';
import { getDgraphClient, queryData } from '../utils/dgraph-client';

export default {
  components: {
    'date-picker-dialog': DatePickerDialog,
  },
  data: () => ({
    username: '',
    dgraphData: null,
    selectLeaveType: null,
    selectLeaveDayRange: [],
    leaveTypes: ['病假', '事假', '婚假'],
  }),
  computed: {
    isFormValid() {
      return (
        this.username &&
        this.selectLeaveType &&
        this.selectLeaveDayRange.length !== 0
      );
    },
  },
  methods: {
    getDates(dates) {
      this.selectLeaveDayRange = dates;
    },
    formatLeaveDates() {
      const start = this.selectLeaveDayRange[0].substring(8, 10);
      const final = this.selectLeaveDayRange[1].substring(8, 10);
      const userLeaveDays = Number(final) - Number(start) + 1;
      return userLeaveDays;
    },
    getLeaveApplicationData() {
      return {
        username: this.username,
        leaveType: this.selectLeaveType,
        leaveDays: this.formatLeaveDates(),
      };
    },
    async sendLeaveProcessForm() {
      const dgraphClient = getDgraphClient();
      const input = this.getLeaveApplicationData();

      this.dgraphData = await queryData(dgraphClient, input);
    },
  },
};
</script>
