import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm.jsx";



export default function CheckoutPage() {
    const [params] = useSearchParams();
    const amount = Number(params.get("amount") || 500);
    const currency = params.get("currency") || "AUD";
    const options = useMemo(() => ({ appearance: { theme: "stripe" } }), []);
    const pk = process.env.REACT_APP_STRIPE_PK;
    if (!pk) {
            return (
                  <div style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
                        <h1>Checkout</h1>
                        <p style={{ color: "#b00" }}>
                          缺少 Stripe 公钥。请在 <code>.env.local</code> 设置
                          <code>REACT_APP_STRIPE_PK</code>，然后重启 <code>npm start</code>。
                        </p>
                      </div>
                );
          }
    const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK);

    return (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
            <h1>Checkout</h1>
            <p>将要支付：{currency} ${(amount / 100).toFixed(2)}</p>
            <Elements stripe={stripePromise} options={options}>
                <CheckoutForm amount={amount} currency={currency} />
            </Elements>
        </div>
    );
}
