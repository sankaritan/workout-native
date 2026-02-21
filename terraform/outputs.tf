output "pages_project_name" {
  value       = cloudflare_pages_project.app.name
  description = "Cloudflare Pages project name."
}

output "pages_project_subdomain" {
  value       = cloudflare_pages_project.app.subdomain
  description = "Cloudflare Pages subdomain."
}

output "strava_sync_worker_name" {
  value       = cloudflare_workers_script.strava_sync.name
  description = "Cloudflare Worker name for Strava sync backend."
}

output "strava_sync_kv_namespace_id" {
  value       = cloudflare_workers_kv_namespace.strava_sync_state.id
  description = "KV namespace id used by Strava sync worker."
}
