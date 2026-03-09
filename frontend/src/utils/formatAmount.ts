export const formatAmount = (amount: number | string) => {

  const value = typeof amount === "string"
    ? Number(amount)
    : amount;

  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};