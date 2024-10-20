<template>
	<div id="profile">

		<!-- Display updated information -->
		<div v-if="user" class="profile-info">
			<h2>Your Profile Information:</h2>
			<p><strong>Tax Rate:</strong> {{ user.tax }}%</p>
			<p><strong>Commission Rate:</strong> {{ user.commission }}%</p>
		</div>

		<!-- Account Display Partial -->
		<AccountDisplay />

		<div class="financial-summary">
			<h1>Trade Summary</h1>
			<table>
				<thead>
					<tr>
						<th>Metrics</th>
						<th>January</th>
						<th>February</th>
						<th>March</th>
						<th>April</th>
						<!-- Add more months as needed -->
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Trade Volume (Gross)</td>
						<td>$10,000</td>
						<td>$12,000</td>
						<td>$8,500</td>
						<td>$11,300</td>
					</tr>
					<tr>
						<td>Commissions & Fees</td>
						<td>$500</td>
						<td>$600</td>
						<td>$450</td>
						<td>$530</td>
					</tr>
					<tr>
						<td>Taxes</td>
						<td>$150</td>
						<td>$180</td>
						<td>$130</td>
						<td>$170</td>
					</tr>
					<tr>
						<td>Net Income</td>
						<td>$9,350</td>
						<td>$11,220</td>
						<td>$7,920</td>
						<td>$10,600</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script>
import AccountDisplay from "./partials/AccountDisplay.vue"; // Import the new component

export default {
	name: "ProfilePage",
	data() {
		return {
			user: null, // Start with null and populate later
		};
	},
	components: {
		AccountDisplay,
	},
};
</script>

<style scoped>
#profile {
	width: 100%;
}
.financial-summary {

	margin: 0 auto;
	width: 60%;
	float: right;
	padding: 5%;
}

h1 {
	text-align: center;
	margin-bottom: 20px;
}

table {
	width: 100%;
	border-collapse: collapse;
	margin: 20px auto;
}

th,
td {
	border: 1px solid #ddd;
	padding: 8px;
	text-align: center;
}

th {
	background-color: #f4f4f4;
	font-weight: bold;
}

td {
	font-size: 16px;
}

tbody tr:nth-child(even) {
	background-color: #f9f9f9;
}
</style>
