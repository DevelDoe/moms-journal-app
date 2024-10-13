<!-- src/App.vue -->
<template>
	<div>
		<nav>
			<router-link to="/">Home</router-link>
			<!-- Show not authenticated -->
			<router-link to="/login" v-if="!isAuthenticated">Login</router-link>
			<router-link to="/register" v-if="!isAuthenticated"
				>Register</router-link
			>

			<!-- Show  authenticated -->
			<router-link to="/profile" v-if="isAuthenticated" >Profile</router-link >
			<router-link to="/new-order" v-if="isAuthenticated" >New Order</router-link >
			<router-link to="/upload-orders" v-if="isAuthenticated" >Upload Ordera</router-link >
			<router-link to="/orders" v-if="isAuthenticated" >Orders List</router-link >
			<a @click="logout" v-if="isAuthenticated" style="cursor: pointer" >Logout</a >
		</nav>
		<router-view></router-view>
	</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  computed: {
    ...mapGetters(['isAuthenticated']),  // Check if user is authenticated
  },
  methods: {
    ...mapActions(['logout']),  // Map logout action
  },
};
</script>

<style scoped>
nav {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}
</style>