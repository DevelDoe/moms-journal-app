<template>
    <div id="profile-page">
      <h1>Update Profile</h1>

      <!-- Only render the form if user is not null -->
      <form v-if="user" @submit.prevent="updateProfile">
        <div class="form-group">
          <label for="tax">Tax Rate (%):</label>
          <input
            type="number"
            id="tax"
            v-model="user.tax_rate"
            placeholder="Enter tax rate"
          />
        </div>

        <div class="form-group">
          <label for="broker">Select Broker:</label>
          <select id="broker" v-model="user.broker">
            <option v-for="broker in brokers" :key="broker._id" :value="broker._id">
              {{ broker.name }}
            </option>
          </select>
        </div>

        <button type="submit">Update Profile</button>
      </form>

      <!-- Show a loading message while the user data is being fetched -->
      <p v-else>Loading user data...</p>
    </div>
  </template>

  <script>
  import { mapState, mapActions } from "vuex";

  export default {
    name: "UpdateProfileForm",
    computed: {
      ...mapState({
        user: (state) => state.user,
        brokers: (state) => state.brokers,
      }),
    },
    methods: {
      ...mapActions(["fetchUser", "fetchBrokers", "updateUser"]), // Updated to use 'updateUser'

      async updateProfile() {
        try {
          const updatedUser = {
            tax: this.user.tax_rate,
            broker: this.user.broker, // Send the selected broker ID
          };

          // Call the action to update user profile
          await this.updateUser(updatedUser); // Updated to use 'updateUser'

          // Display a success message
          alert("Profile updated successfully!");
        } catch (error) {
          console.error("Error updating profile:", error);
          alert("Failed to update profile. Please try again.");
        }
      },
    },
    mounted() {
      // Fetch user data and brokers list from the API when the component is mounted
      this.fetchUser();
      this.fetchBrokers();
    },
  };
  </script>

  <style scoped>
  #profile-page {
    margin: 0 auto;
    float: left;
    width: 20%;
    padding: 5%;
  }

  h1,
  h2 {
    text-align: center;
  }

  .form-group {
    margin-bottom: 20px;
  }

  label {
    display: block;
    margin-bottom: 5px;
  }

  input,
  select {
    width: 100%;
    padding: 8px;
    font-size: 16px;
    box-sizing: border-box;
  }

  button {
    display: block;
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }
  </style>
