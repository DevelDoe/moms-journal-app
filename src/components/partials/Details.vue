<template>
    <div class="trade-details">
        <h2>Performance</h2>
        <table>
            <!-- <thead>
                <tr>
                    <th>Metric</th>
                    <th>Value</th>
                </tr>
            </thead> -->
            <tbody>
                <tr>
                    <td>Total P&L</td>
                    <td>{{ totalPL }}</td>
                </tr>
                <tr>
                    <td>Average Daily P&L</td>
                    <td>{{ avgDailyPL }}</td>
                </tr>
                <tr>
                    <td>Average Trade P&L</td>
                    <td>{{ avgTradePL }}</td>
                </tr>
                <tr>
                    <td>Average Winning Trade</td>
                    <td>{{ avgWinningTrade }}</td>
                </tr>
                <tr>
                    <td>Average Losing Trade</td>
                    <td>{{ avgLosingTrade }}</td>
                </tr>
                <tr>
                    <td>Total Winning Trades</td>
                    <td>{{ totalWinningTrades }}</td>
                </tr>
                <tr>
                    <td>Total Losing Trades</td>
                    <td>{{ totalLosingTrades }}</td>
                </tr>
                <tr>
                    <td>Winning Streak</td>
                    <td>{{ consecutiveWinningTrades }}</td>
                </tr>
                <tr>
                    <td>Losing Streak </td>
                    <td>{{ consecutiveLosingTrades }}</td>
                </tr>
                <tr>
                    <td>Largest Winner</td>
                    <td>{{ largestProfit }}</td>
                </tr>
                <tr>
                    <td>Largest Loss</td>
                    <td>{{ largestLoss }}</td>
                </tr>
                <tr>
                    <td>Average Hold Time (Winner)</td>
                    <td>{{ avgHoldTimeWinner }}</td>
                </tr>
                <tr>
                    <td>Average Hold Time (Loser)</td>
                    <td>{{ avgHoldTimeLoser }}</td>
                </tr>
                <tr>
                    <td>Profit Factor</td>
                    <td>{{ profitFactor }}</td>
                </tr>
                <tr>
                    <td>Accuracy</td>
                    <td>{{ accuracy }}</td>
                </tr>
            </tbody>
        </table>

    </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
    computed: {
        ...mapGetters(["getTrades"]),
        trades() {
            const trades = this.getTrades || [];
            // Enhanced corrupt data detection
            this.hasCorruptData = trades.some((trade) => !trade || !trade.symbol || typeof trade.buyPrice !== "number" || isNaN(new Date(trade.date).getTime()));
            return trades;
        },
        totalPL() {
            const total = this.trades.reduce((sum, trade) => {
                let profit = 0;

                if (trade.side === "long_sell") {
                    profit = (trade.sellPrice - trade.buyPrice) * trade.quantity;
                } else if (trade.side === "short_cover") {
                    profit = (trade.shortPrice - trade.coverPrice) * trade.quantity;
                }

                return sum + profit;
            }, 0);

            console.log("Total P&L:", total); // Debugging
            return total.toFixed(2); // Ensure consistent formatting
        },
        avgDailyPL() {
            // Group trades by day
            const dailyPL = this.trades.reduce((acc, trade) => {
                const date = trade.date.split("T")[0]; // Extract YYYY-MM-DD
                if (!acc[date]) acc[date] = 0;

                if (trade.side === "long_sell") {
                    acc[date] += (trade.sellPrice - trade.buyPrice) * trade.quantity;
                } else if (trade.side === "short_cover") {
                    acc[date] += (trade.shortPrice - trade.coverPrice) * trade.quantity;
                }
                return acc;
            }, {});

            // Calculate the average
            const days = Object.keys(dailyPL);
            const totalPL = Object.values(dailyPL).reduce((sum, daily) => sum + daily, 0);
            const result = days.length > 0 ? (totalPL / days.length).toFixed(2) : "0.00";

            console.log("Avg Daily P&L:", result); // Debugging
            return result;
        },
        avgTradePL() {
            const tradeCount = this.trades.length;
            const result = tradeCount > 0 ? (this.totalPL / tradeCount).toFixed(2) : "0.00";

            console.log("Avg Trade P&L:", result); // Debugging
            return result;
        },
        avgWinningTrade() {
            const winners = this.trades.filter((trade) => {
                if (trade.side === "long_sell") {
                    return (trade.sellPrice - trade.buyPrice) * trade.quantity > 0;
                } else if (trade.side === "short_cover") {
                    return (trade.shortPrice - trade.coverPrice) * trade.quantity > 0;
                }
                return false;
            });

            const totalWinnerPL = winners.reduce((sum, trade) => {
                if (trade.side === "long_sell") {
                    return sum + (trade.sellPrice - trade.buyPrice) * trade.quantity;
                } else if (trade.side === "short_cover") {
                    return sum + (trade.shortPrice - trade.coverPrice) * trade.quantity;
                }
                return sum;
            }, 0);

            const result = winners.length > 0 ? (totalWinnerPL / winners.length).toFixed(2) : "0.00";

            console.log("Avg Winning Trade:", result); // Debugging
            return result;
        },
        avgLosingTrade() {
            const losers = this.trades.filter((trade) => {
                if (trade.side === "long_sell") {
                    return (trade.sellPrice - trade.buyPrice) * trade.quantity < 0;
                } else if (trade.side === "short_cover") {
                    return (trade.shortPrice - trade.coverPrice) * trade.quantity < 0;
                }
                return false;
            });

            const totalLoserPL = losers.reduce((sum, trade) => {
                if (trade.side === "long_sell") {
                    return sum + (trade.sellPrice - trade.buyPrice) * trade.quantity;
                } else if (trade.side === "short_cover") {
                    return sum + (trade.shortPrice - trade.coverPrice) * trade.quantity;
                }
                return sum;
            }, 0);

            const result = losers.length > 0 ? (totalLoserPL / losers.length).toFixed(2) : "0.00";

            console.log("Avg Losing Trade:", result); // Debugging
            return result;
        },
        totalWinningTrades() {
            const result = this.trades.filter((trade) => {
                if (trade.side === "long_sell") {
                    return (trade.sellPrice - trade.buyPrice) * trade.quantity > 0;
                } else if (trade.side === "short_cover") {
                    return (trade.shortPrice - trade.coverPrice) * trade.quantity > 0;
                }
                return false;
            }).length;

            console.log("Total Winning Trades:", result); // Debugging
            return result;
        },
        totalLosingTrades() {
            const result = this.trades.filter((trade) => {
                if (trade.side === "long_sell") {
                    return (trade.sellPrice - trade.buyPrice) * trade.quantity < 0;
                } else if (trade.side === "short_cover") {
                    return (trade.shortPrice - trade.coverPrice) * trade.quantity < 0;
                }
                return false;
            }).length;

            console.log("Total Losing Trades:", result); // Debugging
            return result;
        },

        consecutiveWinningTrades() {
            return this.getConsecutiveCounts(true);
        },
        consecutiveLosingTrades() {
            return this.getConsecutiveCounts(false);
        },
        largestProfit() {
            const profits = this.trades.map((trade) => {
                if (trade.side === "long_sell") {
                    return (trade.sellPrice - trade.buyPrice) * trade.quantity;
                } else if (trade.side === "short_cover") {
                    return (trade.shortPrice - trade.coverPrice) * trade.quantity;
                }
                return 0;
            });
            const result = profits.length > 0 ? Math.max(...profits).toFixed(2) : "0.00";

            console.log("Largest Profit:", result); // Debugging
            return result;
        },
        largestLoss() {
            const losses = this.trades.map((trade) => {
                if (trade.side === "long_sell") {
                    return (trade.sellPrice - trade.buyPrice) * trade.quantity;
                } else if (trade.side === "short_cover") {
                    return (trade.shortPrice - trade.coverPrice) * trade.quantity;
                }
                return 0;
            });
            const result = losses.length > 0 ? Math.min(...losses).toFixed(2) : "0.00";

            console.log("Largest Loss:", result); // Debugging
            return result;
        },
        profitFactor() {
            const totalProfit = this.trades.reduce((sum, trade) => {
                if (trade.side === "long_sell") {
                    const profit = (trade.sellPrice - trade.buyPrice) * trade.quantity;
                    return profit > 0 ? sum + profit : sum;
                } else if (trade.side === "short_cover") {
                    const profit = (trade.shortPrice - trade.coverPrice) * trade.quantity;
                    return profit > 0 ? sum + profit : sum;
                }
                return sum;
            }, 0);

            const totalLoss = Math.abs(
                this.trades.reduce((sum, trade) => {
                    if (trade.side === "long_sell") {
                        const loss = (trade.sellPrice - trade.buyPrice) * trade.quantity;
                        return loss < 0 ? sum + loss : sum;
                    } else if (trade.side === "short_cover") {
                        const loss = (trade.shortPrice - trade.coverPrice) * trade.quantity;
                        return loss < 0 ? sum + loss : sum;
                    }
                    return sum;
                }, 0)
            );

            const result = totalLoss > 0 ? (totalProfit / totalLoss).toFixed(2) : "0.00";

            console.log("Profit Factor:", result); // Debugging
            return result;
        },
        accuracy() {
            const totalTrades = this.trades.length;
            const winningTrades = this.trades.filter((trade) => trade.profitLoss > 0).length;

            return totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(2) + "%" : "0.00%";
        },
        avgHoldTimeWinner() {
            const winners = this.trades.filter((trade) => {
                if (trade.side === "long_sell") {
                    return (trade.sellPrice - trade.buyPrice) * trade.quantity > 0;
                } else if (trade.side === "short_cover") {
                    return (trade.shortPrice - trade.coverPrice) * trade.quantity > 0;
                }
                return false;
            });

            const totalHoldTime = winners.reduce((sum, trade) => sum + (trade.holdTime || 0), 0);

            const avgHoldTime = winners.length > 0 ? totalHoldTime / winners.length : 0;

            return this.formatHoldTime(avgHoldTime);
        },

        avgHoldTimeLoser() {
            const losers = this.trades.filter((trade) => {
                if (trade.side === "long_sell") {
                    return (trade.sellPrice - trade.buyPrice) * trade.quantity < 0;
                } else if (trade.side === "short_cover") {
                    return (trade.shortPrice - trade.coverPrice) * trade.quantity < 0;
                }
                return false;
            });

            const totalHoldTime = losers.reduce((sum, trade) => sum + (trade.holdTime || 0), 0);

            const avgHoldTime = losers.length > 0 ? totalHoldTime / losers.length : 0;

            return this.formatHoldTime(avgHoldTime);
        },
    },
    methods: {
        formatHoldTime(timeInMinutes) {
            if (timeInMinutes < 1) {
                const seconds = Math.round(timeInMinutes * 60);
                return `${seconds} second${seconds !== 1 ? "s" : ""}`;
            } else {
                const minutes = Math.floor(timeInMinutes);
                const seconds = Math.round((timeInMinutes - minutes) * 60);
                return `${minutes} min${minutes !== 1 ? "s" : ""}${seconds > 0 ? ` and ${seconds} second${seconds !== 1 ? "s" : ""}` : ""}`;
            }
        },
        getConsecutiveCounts(isWinning) {
            let maxCount = 0;
            let currentCount = 0;

            this.trades.forEach((trade) => {
                const profit = trade.side === "long_sell" ? (trade.sellPrice - trade.buyPrice) * trade.quantity : (trade.shortPrice - trade.coverPrice) * trade.quantity;

                if ((isWinning && profit > 0) || (!isWinning && profit < 0)) {
                    currentCount++;
                } else {
                    maxCount = Math.max(maxCount, currentCount);
                    currentCount = 0;
                }
            });

            return Math.max(maxCount, currentCount);
        },
    },
};
</script>

<style scoped>
.trade-details {
    padding: 10px;
    font-weight: 100;
    font-size: 14px;
    border-radius: 5px;
    /* border: 1px solid #ddd; */
}
table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    
}
th,
td {
    padding: 10px;
    text-align: left;
    border: 1px solid #ddd;
}
button {
    margin-top: 20px;
}
</style>
