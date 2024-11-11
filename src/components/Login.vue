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
import { mapActions } from "vuex";

export default {
    data() {
        return {
            email: "admin@example.com",
            password: "password123",
            message: "",
        };
    },
    methods: {
        ...mapActions(["loginAction"]),

        async login() {
            const success = await this.loginAction({ email: this.email, password: this.password });

            if (success) {
                // Fetch the redirect path if available or default to '/profile'
                const redirectPath = this.$route.query.redirect || "/profile";
                console.log("Redirecting to:", redirectPath); // Debug log to check redirect path

                this.$router.replace(redirectPath); // Use replace to prevent `redirect` from appearing in the URL
            } else {
                this.message = "Login failed.";
            }
        },
    },
};
</script>
