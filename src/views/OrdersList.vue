<template>
	<div>
		<h2>Your Trade Orders</h2>

		<div v-if="orders.length === 0">No orders yet.</div>

		<table v-if="orders.length > 0" class="orders-table">
			<thead>
				<tr>
					<th>Symbol</th>
					<th>Time</th>
					<th>Side</th>
					<th>Quantity</th>
					<th>Price</th>
					<th>Date</th>
					<th>Account</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="order in orders"
					:key="order._id"
					:class="{
						buy: order.side === 'buy',
						sell: order.side === 'sell',
					}"
				>
					<td>{{ order.symbol }}</td>
					<td>{{ order.time }}</td>
					<td>{{ order.side }}</td>
					<td>{{ order.quantity }}</td>
					<td>${{ order.price.toFixed(4) }}</td>
					<td>{{ new Date(order.date).toLocaleDateString() }}</td>
					<td>{{ order.account }}</td>
				</tr>
			</tbody>
		</table>

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

<style scoped>
.orders-table {
	width: 100%;
	border-collapse: collapse;
	margin: 20px 0;
}

.orders-table th,
.orders-table td {
	padding: 12px 15px;
	text-align: left;
	border-bottom: 1px solid #ddd;
}

.orders-table th {
	background-color: #f4f4f4;
	font-weight: bold;
}

.orders-table tr:nth-child(even) {
	background-color: #f9f9f9;
}

.orders-table tr:hover {
	background-color: #f1f1f1;
}

.orders-table td {
	font-size: 0.95em;
}

.orders-table td:first-child {
	font-weight: bold;
}
.buy {
	background-color: #ffcccc; /* Light red for buy */
	color: red;
}

.sell {
	background-color: #ccffcc; /* Light green for sell */
	color: green;
}
</style>
