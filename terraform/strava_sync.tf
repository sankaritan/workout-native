resource "cloudflare_workers_kv_namespace" "strava_sync_state" {
  account_id = var.cloudflare_account_id
  title      = var.strava_sync_kv_namespace_title
}

resource "cloudflare_workers_script" "strava_sync" {
  account_id         = var.cloudflare_account_id
  name               = var.strava_sync_worker_name
  content            = file("${path.module}/workers/strava-sync-worker.js")
  module             = true
  compatibility_date = "2026-02-21"

  kv_namespace_binding {
    name         = "STRAVA_SYNC_STATE"
    namespace_id = cloudflare_workers_kv_namespace.strava_sync_state.id
  }
}

resource "cloudflare_workers_secret" "strava_client_id" {
  count       = var.strava_client_id != "" ? 1 : 0
  account_id  = var.cloudflare_account_id
  script_name = cloudflare_workers_script.strava_sync.name
  name        = "STRAVA_CLIENT_ID"
  secret_text = var.strava_client_id
}

resource "cloudflare_workers_secret" "strava_client_secret" {
  count       = var.strava_client_secret != "" ? 1 : 0
  account_id  = var.cloudflare_account_id
  script_name = cloudflare_workers_script.strava_sync.name
  name        = "STRAVA_CLIENT_SECRET"
  secret_text = var.strava_client_secret
}

resource "cloudflare_workers_secret" "strava_redirect_uri" {
  count       = var.strava_redirect_uri != "" ? 1 : 0
  account_id  = var.cloudflare_account_id
  script_name = cloudflare_workers_script.strava_sync.name
  name        = "STRAVA_REDIRECT_URI"
  secret_text = var.strava_redirect_uri
}

resource "cloudflare_workers_secret" "strava_callback_success_url" {
  count       = var.strava_callback_success_url != "" ? 1 : 0
  account_id  = var.cloudflare_account_id
  script_name = cloudflare_workers_script.strava_sync.name
  name        = "STRAVA_CALLBACK_SUCCESS_URL"
  secret_text = var.strava_callback_success_url
}

resource "cloudflare_workers_route" "strava_sync" {
  count       = var.strava_sync_route_pattern != "" ? 1 : 0
  zone_id     = var.strava_sync_zone_id
  pattern     = var.strava_sync_route_pattern
  script_name = cloudflare_workers_script.strava_sync.name
}
