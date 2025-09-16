/* eslint no-console: "off" */
const https = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const {defineSecret} = require("firebase-functions/params");
const cors = require("cors")({origin: true});

const STRIPE_SK = defineSecret("STRIPE_SK");
setGlobalOptions({region: "us-central1"});

exports.createPaymentIntent = https.onRequest(
    {secrets: [STRIPE_SK]},
    (req, res)=>{
      cors(req, res, async ()=>{
        if (req.method==="OPTIONS") {
          res.set("Access-Control-Allow-Origin", "*");
          res.set("Access-Control-Allow-Methods", "POST,OPTIONS");
          res.set("Access-Control-Allow-Headers", "Content-Type");
          res.status(204).send("");
          return;
        }

        try {
          if (req.method!=="POST") {
            res.status(405).send("Method Not Allowed");
            return;
          }

          const b = req.body||{};
          const amt = Number(b.amount);
          const cur = b.currency||"AUD";
          if (!amt||amt<50) {
            res.status(400).json({error: "Invalid amount"});
            return;
          }

          // 在函数体内再初始化 Stripe（此时 Secret 可用）
          const stripe = require("stripe")(STRIPE_SK.value());
          const pi = await stripe.paymentIntents.create({
            amount: amt,
            currency: cur,
            automatic_payment_methods: {enabled: true},
          });

          res.set("Access-Control-Allow-Origin", "*");
          res.json({clientSecret: pi.client_secret});
        } catch (e) {
          console.error(e);
          res.status(500).json({error: "server_error"});
        }
      });
    },
);
