import { Command } from "commander";
import {
  buy,
  details,
  orders,
  register,
  search,
  setAddress,
  setEmail,
  settingsPageLink,
  settingsSummary,
  stripePublishableKey
} from "./api.js";
import { pretty, money, printSection } from "./format.js";
import { readConfig, writeConfig } from "./config.js";
import { tokenizeCard } from "./stripe.js";

export async function runCli(argv: string[]) {
  const program = new Command();
  program.name("selva").description("Selva shopping CLI").version("0.1.0");

  program
    .command("register")
    .description("Register and store a new API key")
    .action(async () => {
      const response = await register();
      const existing = await readConfig();

      await writeConfig({
        ...existing,
        apiKey: response.api_key
      });

      console.log(`Registered. API key saved to ~/selva/config.json`);
      console.log(response.message);
    });

  program
    .command("search")
    .description("Search products")
    .argument("<query>", "Search query")
    .action(async (query: string) => {
      const response = await search(query);

      if (response.notice) {
        console.log(response.notice);
      }

      printSection("Search Results");
      if (!response.results.length) {
        console.log("No products found.");
      }

      for (const [index, item] of response.results.entries()) {
        console.log(`${index + 1}. ${item.selva_id}`);
        console.log(`   ${item.title}`);
        console.log(`   source: ${item.source} | price: ${money(item.price)} | rating: ${item.rating ?? "n/a"}`);
        console.log(`   delivery: ${item.delivery_estimate ?? "n/a"} | availability: ${item.availability ?? "n/a"}`);
        console.log(`   reviews: ${item.review_count ?? "n/a"} | prime: ${item.prime_eligible ?? "n/a"}`);
        console.log(`   url: ${item.url ?? "n/a"}`);
      }

      if (response.errors.length) {
        printSection("Provider Errors");
        for (const error of response.errors) {
          console.log(`${error.provider}: ${error.message}`);
        }
      }

      printSection("Raw Provider Responses");
      console.log(pretty(response.raw));
    });

  program
    .command("details")
    .description("Get product details")
    .argument("<selva_id>", "Selva product id")
    .action(async (selvaId: string) => {
      const response = await details(selvaId);

      printSection("Product Details");
      if (!response.product) {
        console.log("No normalized product available.");
      } else {
        const p = response.product;
        console.log(`${p.selva_id}`);
        console.log(`${p.title}`);
        console.log(`source: ${p.source}`);
        console.log(`price: ${money(p.price)} | rating: ${p.rating ?? "n/a"}`);
        console.log(`delivery: ${p.delivery_estimate ?? "n/a"} | availability: ${p.availability ?? "n/a"}`);
        console.log(`reviews: ${p.review_count ?? "n/a"} | prime: ${p.prime_eligible ?? "n/a"}`);
        console.log(`url: ${p.url ?? "n/a"}`);
        console.log(`image: ${p.image_url ?? "n/a"}`);
        console.log(`variants: ${p.variants.length ? p.variants.join(", ") : "none"}`);
      }

      printSection("Raw Provider Response");
      console.log(pretty(response.raw));
    });

  program
    .command("buy")
    .description("Buy a product")
    .argument("<selva_id>", "Selva product id")
    .requiredOption("--method <method>", "Payment method: card|saved")
    .option("--number <card_number>", "Card number for --method card")
    .option("--exp <exp>", "Card expiry MM/YY for --method card")
    .option("--cvv <cvv>", "Card CVV for --method card")
    .action(
      async (
        selvaId: string,
        options: { method: string; number?: string; exp?: string; cvv?: string }
      ) => {
        const method = options.method === "saved" ? "saved" : options.method === "card" ? "card" : null;
        if (!method) {
          throw new Error("--method must be either 'card' or 'saved'.");
        }

        let paymentToken: string | undefined;
        if (method === "card") {
          if (!options.number || !options.exp || !options.cvv) {
            throw new Error("For --method card, provide --number, --exp, and --cvv.");
          }

          const stripeConfig = await stripePublishableKey();
          const tokenized = await tokenizeCard({
            publishableKey: stripeConfig.stripe_publishable_key,
            number: options.number,
            exp: options.exp,
            cvv: options.cvv
          });

          paymentToken = tokenized.token;
        }

        const response = await buy({
          selva_id: selvaId,
          method,
          payment_token: paymentToken
        });

        printSection("Buy Response");
        console.log(pretty(response));
      }
    );

  program
    .command("orders")
    .description("List orders")
    .action(async () => {
      const response = await orders();
      printSection("Orders");
      if (!response.orders.length) {
        console.log("No orders yet.");
        return;
      }

      for (const order of response.orders) {
        console.log(`${order.id}`);
        console.log(`   selva_id: ${order.selva_id}`);
        console.log(`   status: ${order.status} | method: ${order.payment_method}`);
        console.log(`   requested: $${order.requested_amount_usd} | final: ${order.final_amount_usd ? `$${order.final_amount_usd}` : "n/a"}`);
        console.log(`   created_at: ${order.created_at}`);
      }
    });

  const settings = program.command("settings").description("Manage and view settings");

  settings.action(async () => {
    const response = await settingsSummary();
    const card = response.settings.card;
    console.log(`threshold_limit: ${response.settings.approval_enabled ? `$${response.settings.approval_threshold_usd ?? "n/a"}` : "unset"}`);
    console.log(`zip_code: ${response.settings.zip_code ?? "unset"}`);
    console.log(`payment_method: ${card ? `${card.issuer ?? "card"} **** ${card.last4 ?? "????"}` : "not linked"}`);
    console.log(`email: ${response.settings.email ?? "unset"}`);
  });

  settings
    .command("page")
    .description("Generate a settings page URL")
    .action(async () => {
      const response = await settingsPageLink();
      console.log(response.url);
      console.log(`(expires in ${response.expires_in_hours} hours)`);
    });

  settings
    .command("set-address")
    .requiredOption("--street <street>", "Street address")
    .requiredOption("--city <city>", "City")
    .requiredOption("--state <state>", "State")
    .requiredOption("--zip <zip>", "ZIP code")
    .requiredOption("--country <country>", "Country code")
    .action(
      async (options: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
      }) => {
        await setAddress(options);
        console.log("Address updated.");
      }
    );

  settings
    .command("set-email")
    .requiredOption("--email <email>", "Notification email")
    .action(async (options: { email: string }) => {
      await setEmail(options.email);
      console.log("Email updated.");
    });

  await program.parseAsync(argv);
}
