import fs from "node:fs";

const arg = (name) => process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3) || "";
const file = arg("file");
const environment = arg("environment");
const sha = arg("sha");
const prefix = arg("prefix") || environment;
const latest = process.argv.includes("--latest");
if (!file) throw new Error("Missing --file");
if (!/^(preview|production)$/.test(environment)) throw new Error(`Invalid environment: ${environment}`);
if (!latest && !/^[0-9a-f]{40}$/.test(sha)) throw new Error(`Invalid commit SHA: ${sha}`);
if (latest && (environment !== "production" || prefix !== "prior")) throw new Error("--latest is only valid for the prior production deployment");
if (!/^[a-z][a-z0-9_]*$/.test(prefix)) throw new Error(`Invalid output prefix: ${prefix}`);

const payload = JSON.parse(fs.readFileSync(file, "utf8"));
const deployments = Array.isArray(payload) ? payload : payload.result;
if (!Array.isArray(deployments)) throw new Error("Cloudflare deployment list is not an array");
const matches = deployments
  .filter((deployment) => deployment.environment === environment)
  .filter((deployment) => deployment.latest_stage?.status === "success")
  .filter((deployment) => latest || deployment.deployment_trigger?.metadata?.commit_hash === sha)
  .sort((left, right) => Date.parse(right.created_on) - Date.parse(left.created_on));
if (matches.length === 0) throw new Error(latest
  ? "No prior successful production deployment exists"
  : `No successful ${environment} deployment matches commit ${sha}`);
const deployment = matches[0];
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(deployment.id)) {
  throw new Error(`Invalid Cloudflare deployment ID: ${deployment.id}`);
}
const url = new URL(deployment.url);
if (url.protocol !== "https:" || !url.hostname.endsWith(".pages.dev") || url.pathname !== "/") {
  throw new Error(`Invalid immutable deployment URL: ${deployment.url}`);
}
const deploymentSha = deployment.deployment_trigger?.metadata?.commit_hash;
if (!/^[0-9a-f]{40}$/.test(deploymentSha || "")) {
  throw new Error(`Invalid Cloudflare deployment commit SHA: ${deploymentSha}`);
}
if (!latest && deploymentSha !== sha) throw new Error("Cloudflare deployment SHA changed during verification");
const outputs = {
  [`${prefix}_deployment_id`]: deployment.id,
  [`${prefix}_deployment_url`]: url.origin,
  [`${prefix}_deployed_sha`]: deploymentSha,
};
for (const [key, value] of Object.entries(outputs)) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
  console.log(`${key}=${value}`);
}
