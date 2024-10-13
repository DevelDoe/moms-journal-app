<!-- src/views/Register.vue -->
<template>
	<div>
		<h2>Register</h2>
		<form @submit.prevent="register">
			<div>
				<label>Name:</label>
				<input type="text" v-model="name" />
			</div>
			<div>
				<label>Email:</label>
				<input type="email" v-model="email" />
			</div>
			<div>
				<label>Password:</label>
				<input type="password" v-model="password" />
			</div>
			<button type="submit">Register</button>
		</form>
		<p>{{ message }}</p>
	</div>
</template>

<script>
import axios from "axios";

export default {
	data() {
		return {
			name: "",
			email: "",
			password: "",
			message: "",
		};
	},
	methods: {
		async register() {
			try {
				const response = await axios.post(
					"http://localhost:5000/api/auth/register",
					{
						name: this.name,
						email: this.email,
						password: this.password,
					}
				);

				// Set a success message
				this.message =
					"Registration successful! Redirecting to login...";

				// Redirect to the login page after 2 seconds
				setTimeout(() => {
					this.$router.push("/login");
				}, 2000);
			} catch (error) {
				this.message =
					error.response.data.message || "Registration failed.";
			}
		},
	},
};
</script>
