<!-- src/views/NewOrder.vue -->
<template>
	<div>
	  <h2>Create a New Trade Order</h2>
	  <form @submit.prevent="createOrder">
		<div>
		  <label>Side:</label>
		  <select v-model="side">
			<option value="buy">Buy</option>
			<option value="sell">Sell</option>
		  </select>
		</div>
		<div>
		  <label>Time:</label>
		  <input type="time" v-model="time" />
		</div>
		<div>
		  <label>Price:</label>
		  <input type="number" v-model="price" />
		</div>
		<div>
		  <label>Quantity:</label>
		  <input type="number" v-model="quantity" />
		</div>
		<div>
		  <label>Symbol:</label>
		  <input type="text" v-model="symbol" />
		</div>
		<div>
		  <label>Account:</label>
		  <input type="text" v-model="account" />
		</div>
		<div>
		  <label>Date:</label>
		  <input type="date" v-model="date" />
		</div>
		<button type="submit">Create Order</button>
	  </form>
	</div>
  </template>
  
  <script>
  import { mapActions } from 'vuex';
  
  export default {
	data() {
	  return {
		side: 'buy',
		time: '',
		price: 0,
		quantity: 0,
		symbol: '',
		account: '',
		date: '',
	  };
	},
	methods: {
	  ...mapActions(['createOrder']),  // Map the createOrder action from Vuex
	  createOrder() {
		this.createOrder({
		  side: this.side,
		  time: this.time,
		  price: this.price,
		  quantity: this.quantity,
		  symbol: this.symbol,
		  account: this.account,
		  date: this.date,
		});
	  },
	},
  };
  </script>
  