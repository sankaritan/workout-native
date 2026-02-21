provider "cloudflare" {
  api_token = var.cloudflare_api_token != "" ? var.cloudflare_api_token : null
}

locals {
  pages_public_env_vars = var.strava_sync_api_base_url != "" ? {
    EXPO_PUBLIC_STRAVA_SYNC_API_BASE_URL = var.strava_sync_api_base_url
  } : {}
}

resource "cloudflare_pages_project" "app" {
  account_id        = var.cloudflare_account_id
  name              = var.pages_project_name
  production_branch = "main"

  build_config {
    build_command   = var.pages_build_command
    destination_dir = var.pages_build_output_dir
  }

  source {
    type = "github"
    config {
      owner                         = "sankaritan"
      repo_name                     = "workout-native"
      production_branch             = "main"
      deployments_enabled           = true
      production_deployment_enabled = true
      pr_comments_enabled           = true
      preview_deployment_setting    = "all"
      preview_branch_includes       = ["*"]
    }
  }

  deployment_configs {
    preview {
      compatibility_date    = "2026-01-30"
      fail_open             = true
      usage_model           = "standard"
      environment_variables = local.pages_public_env_vars
    }
    production {
      compatibility_date    = "2026-01-30"
      fail_open             = true
      usage_model           = "standard"
      environment_variables = local.pages_public_env_vars
    }
  }
}

resource "cloudflare_zero_trust_access_application" "app" {
  account_id                = var.cloudflare_account_id
  name                      = "Workout Native"
  domain                    = "${var.pages_project_name}.pages.dev"
  type                      = "self_hosted"
  session_duration          = "12h"
  allowed_idps              = []
  auto_redirect_to_identity = false
}

# Note: To enable auto_redirect_to_identity, you must specify exactly one
# identity provider in allowed_idps (e.g., Google OAuth provider ID)

resource "cloudflare_zero_trust_access_policy" "google" {
  account_id       = var.cloudflare_account_id
  application_id   = var.access_application_id
  name             = "Allowed Users"
  precedence       = var.access_policy_precedence
  decision         = "allow"
  session_duration = "24h"

  include {
    email = var.access_policy_include_emails
  }
}

# Note: This is a reusable policy - session_duration can only be changed
# in the Cloudflare dashboard under Zero Trust > Settings > Authentication
