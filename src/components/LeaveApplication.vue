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
    <div v-if="leaveProcessResults" class="mt-4 pa-4">
      <leave-process-step
        :leaveProcesses="leaveProcessResults"
      ></leave-process-step>
    </div>
  </v-container>
</template>
<script>
import DatePickerDialog from './DatePickerDialog'
import LeaveProcessStep from './LeaveProcessStep'
import { getDgraphClient, queryData } from '../utils/dgraph-client'

export default {
  components: {
    'date-picker-dialog': DatePickerDialog,
    'leave-process-step': LeaveProcessStep,
  },
  data: () => ({
    username: '',
    leaveProcessResults: null,
    selectLeaveType: null,
    selectLeaveDayRange: [],
    leaveTypes: ['病假', '事假', '婚假'],
  }),
  computed: {
    isFormValid() {
      return (
        this.username &&
        this.selectLeaveType 
      )
    },
  },
  methods: {
    getDates(dates) {
      this.selectLeaveDayRange = dates
    },
    formatLeaveDates() {
      const start = Date.parse(this.selectLeaveDayRange[0]);
      const final = Date.parse(this.selectLeaveDayRange[1]);
      if (start==final){
          return 1;
      }
      var days=(final - start)/(1*24*60*60*1000) + 1;
      return days;
    },
    getLeaveApplicationData() {
      return {
        username: this.username,
        leaveType: this.selectLeaveType,
        leaveDays: this.formatLeaveDates(),
      }
    },
    async sendLeaveProcessForm() {
      const dgraphClient = getDgraphClient()
      const input = this.getLeaveApplicationData()

      this.leaveProcessResults = await queryData(dgraphClient, input)
    },
  },
}
</script>
