import "dotenv/config";

const BB_TOKEN = process.env.BB_API_TOKEN;

if (!BB_TOKEN) {
  console.error("Missing BB_TOKEN in environment. See .env.example.");
  process.exit(1);
}

function main(): void {
  console.log("pipeline-alert started");
}

main();
