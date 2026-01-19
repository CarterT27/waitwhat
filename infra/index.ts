import * as pulumi from "@pulumi/pulumi";
import * as cloudflare from "@pulumi/cloudflare";

// Configuration
const config = new pulumi.Config();

// Required configuration
const environment = config.require("environment");
const projectName = config.require("projectName");
const accountId = config.require("accountId");

// Optional configuration with defaults
const productionBranch = config.get("productionBranch") || "main";

// GitHub repository configuration
const githubOwner = config.require("githubOwner");
const githubRepo = config.require("githubRepo");

// Environment variables for the app (secrets)
const convexUrl = config.requireSecret("convexUrl");
const livekitUrl = config.requireSecret("livekitUrl");

// Optional custom domain configuration
const customDomain = config.get("customDomain");
const zoneId = config.get("cloudflareZoneId");

// Create Cloudflare Pages Project with GitHub integration
const pagesProject = new cloudflare.PagesProject("waitwhat-pages", {
  accountId: accountId,
  name: `${projectName}-${environment}`,
  productionBranch: productionBranch,

  buildConfig: {
    buildCaching: true,
    buildCommand: "bun install && bun run build",
    destinationDir: "dist",
    rootDir: "/",
  },

  source: {
    type: "github",
    config: {
      owner: githubOwner,
      repoName: githubRepo,
      productionBranch: productionBranch,
      deploymentsEnabled: true,
      prCommentsEnabled: true,
    },
  },

  deploymentConfigs: {
    production: {
      compatibilityDate: "2025-01-01",
      compatibilityFlags: ["nodejs_compat"],
      envVars: {
        VITE_CONVEX_URL: {
          type: "secret_text",
          value: convexUrl,
        },
        VITE_LIVEKIT_URL: {
          type: "secret_text",
          value: livekitUrl,
        },
        NODE_ENV: {
          type: "plain_text",
          value: "production",
        },
      },
    },
    preview: {
      compatibilityDate: "2025-01-01",
      compatibilityFlags: ["nodejs_compat"],
      envVars: {
        VITE_CONVEX_URL: {
          type: "secret_text",
          value: convexUrl,
        },
        VITE_LIVEKIT_URL: {
          type: "secret_text",
          value: livekitUrl,
        },
        NODE_ENV: {
          type: "plain_text",
          value: "preview",
        },
      },
    },
  },
});

// Export the Pages project URL
export const pagesUrl = pagesProject.subdomain.apply(
  (subdomain) => `https://${subdomain}`
);
export const pagesProjectName = pagesProject.name;

// Custom domain configuration (only if customDomain and zoneId are provided)
let customDomainUrl: string | undefined;

if (customDomain && zoneId) {
  // Create the Pages domain binding
  const pagesDomain = new cloudflare.PagesDomain("waitwhat-domain", {
    accountId: accountId,
    projectName: pagesProject.name,
    name: customDomain,
  });

  // Determine if this is an apex domain or subdomain
  const domainParts = customDomain.split(".");
  const isApex = domainParts.length === 2;
  const recordName = isApex ? "@" : domainParts[0];

  // Create DNS CNAME record pointing to the Pages project
  const dnsRecord = new cloudflare.DnsRecord("waitwhat-dns", {
    zoneId: zoneId,
    name: recordName,
    type: "CNAME",
    content: pagesProject.subdomain,
    proxied: true,
    ttl: 1, // Auto TTL when proxied
  });

  // If using apex domain, also create www CNAME for redirect
  if (isApex) {
    const wwwRecord = new cloudflare.DnsRecord("waitwhat-www-dns", {
      zoneId: zoneId,
      name: "www",
      type: "CNAME",
      content: pagesProject.subdomain,
      proxied: true,
      ttl: 1,
    });
  }

  customDomainUrl = `https://${customDomain}`;
}

// Export custom domain URL if configured
export { customDomainUrl };
