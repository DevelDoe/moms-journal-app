// helpers/commissionCalculator.js (client-side)
export function calculateCommissionForTrade(trade, accountDetails) {
  const { rate_per_share, min_amount, max_amount, percentage_rate, ecn_fees, extended_hours_trading_fee, regulatory_fee } = accountDetails;

  // Per-share commission
  let perShareCommission = trade.quantity * rate_per_share;

  // Percentage commission based on trade value
  let percentageCommission = (trade.price * trade.quantity) * (percentage_rate / 100);

  // ECN fees based on the quantity traded
  let totalEcnFees = trade.quantity * ecn_fees;

  // Extended hours trading fee
  let extendedHoursFee = trade.extendedHours ? trade.quantity * extended_hours_trading_fee : 0;

  // Regulatory fees
  let totalRegulatoryFee = trade.quantity * regulatory_fee;

  // Total commission, applying minimum and maximum limits
  let totalCommission = perShareCommission + percentageCommission + totalEcnFees + extendedHoursFee + totalRegulatoryFee;
  totalCommission = Math.max(totalCommission, min_amount); // Apply min commission
  totalCommission = Math.min(totalCommission, max_amount); // Apply max commission

  return totalCommission;
}
