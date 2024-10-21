<!-- ./src/components/partials/TradesList.vue -->
<template>
    <div class="trades-list">
      <h2>Trades List</h2>
      <table class="trades-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Account</th>
            <th>Quantity</th>
            <th>Buy Price</th>
            <th>Sell Price</th>
            <th>Side</th>
            <th>Profit/Loss</th>
            <th>Date</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(trade, index) in trades" :key="index">
            <td>{{ trade.symbol || "N/A" }}</td>
            <td>{{ trade.account || "N/A" }}</td>
            <td>{{ trade.quantity !== undefined ? trade.quantity : "N/A" }}</td>
            <td>{{ trade.buyPrice !== undefined ? trade.buyPrice.toFixed(2) : "N/A" }}</td>
            <td>{{ trade.sellPrice !== undefined ? trade.sellPrice.toFixed(2) : "N/A" }}</td>
            <td>{{ trade.side || "N/A" }}</td>
            <td>{{ trade.profitLoss !== undefined ? trade.profitLoss.toFixed(2) : "N/A" }}</td>
            <td>{{ trade.date ? new Date(trade.date).toLocaleDateString() : "Invalid Date" }}</td>
            <td>{{ trade.date ? new Date(trade.date).toLocaleTimeString() : "Invalid Time" }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="8" class="total-label">Total P/L</td>
            <td class="total-value">${{ totalProfitLoss.toFixed(2) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      trades: {
        type: Array,
        required: true,
      },
      totalProfitLoss: {
        type: Number,
        required: true,
      },
    },
  };
  </script>
  
  <style scoped>
  .trades-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  th,
  td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: left;
  }
  
  th {
    background-color: #f4f4f4;
  }
  
  tfoot .total-label {
    font-weight: bold;
    text-align: right;
  }
  
  tfoot .total-value {
    font-weight: bold;
    text-align: left;
  }
  </style>
  