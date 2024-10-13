<!-- src/views/OrdersList.vue -->
<template>
	<div>
		<h2>Your Trade Orders</h2>
		<div v-if="orders.length === 0">No orders yet.</div>
		<ul>
			<li v-for="order in orders" :key="order._id">
				<strong>{{ order.symbol }}</strong> - {{ order.side }}
				{{ order.quantity }} at ${{ order.price }} on
				{{ new Date(order.date).toLocaleDateString() }}
			</li>
		</ul>
		<p v-if="error">{{ error }}</p>
	</div>
</template>

<script>
import axios from "axios";
export default {
	data() {
		return {
			orders: [],
			error: "",
		};
	},
	created() {
		this.fetchOrders();
	},
	methods: {
		async fetchOrders() {
			const token = localStorage.getItem("token");
			try {
				const response = await axios.get(
					"http://localhost:5000/api/orders",
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				this.orders = response.data;
			} catch (error) {
				this.error = "Failed to load orders";
				console.error("Error fetching orders:", error.response.data);
			}
		},
	},
};
</script>
