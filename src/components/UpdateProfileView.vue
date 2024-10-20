<template>
    <div>
      <h2>Select Broker and Account</h2>
  
      <!-- Dropdown for selecting a broker -->
      <label for="broker">Select Broker:</label>
      <select v-model="selectedBroker" @change="onBrokerChange">
        <option v-for="broker in brokers" :key="broker._id" :value="broker._id">{{ broker.name }}</option>
      </select>
  
      <!-- Dropdown for selecting account type (visible after broker is selected) -->
      <div v-if="selectedBroker">
        <label for="account">Select Account Type:</label>
        <select v-model="selectedAccountType">
          <option v-for="accountType in selectedBrokerAccountTypes" :key="accountType.type" :value="accountType.type">
            {{ accountType.type }}
          </option>
        </select>
      </div>
  
      <!-- Input for Account Number -->
      <div v-if="selectedAccountType">
        <label for="accountNumber">Enter Account Number:</label>
        <input v-model="accountNumber" type="text" id="accountNumber" placeholder="Account Number" required />
      </div>
  
      <!-- Input for Account Balance -->
      <div v-if="selectedAccountType">
        <label for="balance">Enter Initial Balance:</label>
        <input v-model="balance" type="number" id="balance" placeholder="Initial Balance" required />
      </div>
  
      <!-- Button to add the selected broker and account to the user's profile -->
      <button @click="addAccount" :disabled="!selectedBroker || !selectedAccountType || !accountNumber || !balance">Add Account</button>
    </div>
  </template>
  
  <script>
  import { mapActions, mapGetters } from "vuex";
  
  export default {
    data() {
      return {
        selectedBroker: null, // The ID of the selected broker
        selectedAccountType: null, // The account type selected by the user
        accountNumber: "", // New account number input
        balance: 0, // New account balance input
      };
    },
    computed: {
      // Get the list of brokers from Vuex state
      ...mapGetters(["getBrokers"]),
      
      brokers() {
        return this.getBrokers;
      },
  
      // Get the currently selected broker's account types
      selectedBrokerAccountTypes() {
        const broker = this.brokers.find((b) => b._id === this.selectedBroker);
        return broker ? broker.accountTypes : []; // Ensure accountTypes is an array
      },
    },
    methods: {
      ...mapActions(["fetchBrokers", "addUserAccount"]), // Fetch brokers and add account actions from Vuex
  
      // Lifecycle hook to fetch brokers when the component is mounted
      async mounted() {
        await this.fetchBrokers(); // Fetch all brokers
      },
  
      onBrokerChange() {
        // Reset the account type and inputs when a new broker is selected
        this.selectedAccountType = null;
        this.accountNumber = "";
        this.balance = 0;
      },
  
      async addAccount() {
        // Data for the new account to be added
        const newAccount = {
          type: this.selectedAccountType,
          number: this.accountNumber, // Use the account number input from the user
          balance: this.balance, // Use the balance input from the user
        };
  
        // Dispatch Vuex action to add the new account to the user profile
        await this.addUserAccount(newAccount);
  
        // Reset form fields after adding the account
        this.selectedBroker = null;
        this.selectedAccountType = null;
        this.accountNumber = "";
        this.balance = 0;
      },
    },
  };
  </script>
  