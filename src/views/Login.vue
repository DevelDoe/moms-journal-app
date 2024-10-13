<!-- src/views/Login.vue -->
<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div>
        <label>Email:</label>
        <input type="email" v-model="email" />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" v-model="password" />
      </div>
      <button type="submit">Login</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      email: '',
      password: '',
      message: '',
    };
  },
  methods: {
    ...mapActions(['loginAction']), 
    
    async login() {
      // Call the Vuex action 'loginAction' instead of the local method
      const success = await this.loginAction({ email: this.email, password: this.password });
      
      if (success) {
        this.$router.push('/profile');  // Redirect to profile on success
      } else {
        this.message = 'Login failed.';  // Show error message on failure
      }
    },
  },
};
</script>
