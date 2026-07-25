import { createServerFn } from "@tanstack/react-start";

export const verifyFlutterwavePayment = createServerFn({ method: "GET" })
  .validator((transactionId: string) => transactionId)
  .handler(async ({ data: transactionId }) => {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    const response = await fetch(
      "https://api.flutterwave.com/v3/transactions/" + transactionId + "/verify",
      { headers: { Authorization: "Bearer " + secretKey } }
    );
    const result = await response.json();

    if (result.status !== "success" || result.data.status !== "successful") {
      throw new Error("Payment verification failed.");
    }

    return {
      transactionId: String(result.data.id),
      txRef: result.data.tx_ref,
      amount: result.data.amount,
      status: result.data.status,
      email: result.data.customer ? result.data.customer.email : null,
    };
  });

export const listBanks = createServerFn({ method: "GET" }).handler(async () => {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  const response = await fetch("https://api.flutterwave.com/v3/banks/NG", {
    headers: { Authorization: "Bearer " + secretKey },
  });
  const result = await response.json();
  if (result.status !== "success") {
    throw new Error("Could not load bank list.");
  }
  return result.data.map(function (b: any) {
    return { name: b.name, code: b.code };
  });
});

interface ResolveAccountInput {
  accountNumber: string;
  bankCode: string;
}

export const resolveAccountNumber = createServerFn({ method: "GET" })
  .validator((input: ResolveAccountInput) => input)
  .handler(async ({ data }) => {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    const response = await fetch("https://api.flutterwave.com/v3/accounts/resolve", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account_number: data.accountNumber,
        account_bank: data.bankCode,
      }),
    });
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error("Could not verify account. Check the account number and bank.");
    }
    return { accountName: result.data.account_name };
  });

interface ProcessPayoutInput {
  withdrawalId: string;
  accountNumber: string;
  bankCode: string;
  accountName: string;
  amount: number;
}

export const processPayout = createServerFn({ method: "POST" })
  .validator((input: ProcessPayoutInput) => input)
  .handler(async ({ data }) => {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    const response = await fetch("https://api.flutterwave.com/v3/transfers", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        account_bank: data.bankCode,
        account_number: data.accountNumber,
        amount: data.amount,
        currency: "NGN",
        narration: "SABU Marketplace withdrawal",
        reference: "sabu_payout_" + data.withdrawalId + "_" + Date.now(),
      }),
    });
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "Transfer failed.");
    }
    return {
      transferId: String(result.data.id),
      reference: result.data.reference,
      status: result.data.status,
    };
  });

interface RefundInput {
  transactionId: string;
  amount: number;
}

export const refundPayment = createServerFn({ method: "POST" })
  .validator((input: RefundInput) => input)
  .handler(async ({ data }) => {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    const response = await fetch(
      "https://api.flutterwave.com/v3/transactions/" + data.transactionId + "/refund",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + secretKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: data.amount }),
      }
    );
    const result = await response.json();
    if (result.status !== "success") {
      throw new Error(result.message || "Refund failed.");
    }
    return { status: result.data.status };
  });
