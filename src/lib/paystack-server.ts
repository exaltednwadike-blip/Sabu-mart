import { createServerFn } from "@tanstack/react-start";

export const verifyPaystackPayment = createServerFn({ method: "GET" })
  .validator((reference: string) => reference)
  .handler(async ({ data: reference }) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const response = await fetch("https://api.paystack.co/transaction/verify/" + reference, {
      headers: { Authorization: "Bearer " + secretKey },
    });
    const result = await response.json();

    if (!result.status || result.data.status !== "success") {
      throw new Error("Payment verification failed.");
    }

    return {
      reference: result.data.reference,
      amount: result.data.amount / 100,
      status: result.data.status,
      email: result.data.customer ? result.data.customer.email : null,
    };
  });

export const listBanks = createServerFn({ method: "GET" }).handler(async () => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const response = await fetch("https://api.paystack.co/bank?currency=NGN", {
    headers: { Authorization: "Bearer " + secretKey },
  });
  const result = await response.json();
  if (!result.status) {
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
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const url = "https://api.paystack.co/bank/resolve?account_number=" + data.accountNumber + "&bank_code=" + data.bankCode;
    const response = await fetch(url, {
      headers: { Authorization: "Bearer " + secretKey },
    });
    const result = await response.json();
    if (!result.status) {
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
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    const recipientRes = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "nuban",
        name: data.accountName,
        account_number: data.accountNumber,
        bank_code: data.bankCode,
        currency: "NGN",
      }),
    });
    const recipientResult = await recipientRes.json();
    if (!recipientResult.status) {
      throw new Error(recipientResult.message || "Could not create transfer recipient.");
    }
    const recipientCode = recipientResult.data.recipient_code;

    const transferRes = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: Math.round(data.amount * 100),
        recipient: recipientCode,
        reason: "SABU Marketplace withdrawal",
      }),
    });
    const transferResult = await transferRes.json();
    if (!transferResult.status) {
      throw new Error(transferResult.message || "Transfer failed.");
    }

    return {
      recipientCode: recipientCode,
      transferCode: transferResult.data.transfer_code,
      status: transferResult.data.status,
    };
  });

interface RefundInput {
  reference: string;
  amount: number;
}

export const refundPayment = createServerFn({ method: "POST" })
  .validator((input: RefundInput) => input)
  .handler(async ({ data }) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const response = await fetch("https://api.paystack.co/refund", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction: data.reference,
        amount: Math.round(data.amount * 100),
      }),
    });
    const result = await response.json();
    if (!result.status) {
      throw new Error(result.message || "Refund failed.");
    }
    return { status: result.data.status };
  });
