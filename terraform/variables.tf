variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare account ID."
}

variable "pages_project_name" {
  type        = string
  description = "Cloudflare Pages project name."
}

variable "access_application_id" {
  type        = string
  description = "Cloudflare Access application ID."
}

variable "pages_build_command" {
  type        = string
  description = "Build command for Cloudflare Pages."
  default     = "npm run build:web"
}

variable "pages_build_output_dir" {
  type        = string
  description = "Output directory for Cloudflare Pages build."
  default     = "web-build"
}

variable "access_policy_name" {
  type        = string
  description = "Name for the Access policy."
  default     = "Workouts Google Access"
}

variable "access_policy_precedence" {
  type        = number
  description = "Policy precedence for the Access policy."
  default     = 1
}

variable "access_policy_include_emails" {
  type        = list(string)
  description = "List of email addresses allowed by Access policy."
  default     = []
}

variable "access_policy_include_domains" {
  type        = list(string)
  description = "List of domains allowed by Access policy."
  default     = []
}

variable "cloudflare_api_token" {
  type        = string
  description = "Cloudflare API token (optional). If empty, the provider will use the CLOUDFLARE_API_TOKEN environment variable."
  default     = ""
  sensitive   = true
}

variable "strava_sync_worker_name" {
  type        = string
  description = "Cloudflare Worker name for Strava sync backend."
  default     = "strava-sync-worker"
}

variable "strava_sync_kv_namespace_title" {
  type        = string
  description = "KV namespace title for Strava sync state."
  default     = "strava_sync_state"
}

variable "strava_sync_route_pattern" {
  type        = string
  description = "Optional route pattern to attach Strava worker (e.g. api.example.com/strava/*)."
  default     = ""
}

variable "strava_sync_zone_id" {
  type        = string
  description = "Optional zone id for worker route. Required when strava_sync_route_pattern is set."
  default     = ""
}

variable "strava_client_id" {
  type        = string
  description = "Strava API client id."
  sensitive   = true
  default     = ""
}

variable "strava_client_secret" {
  type        = string
  description = "Strava API client secret."
  sensitive   = true
  default     = ""
}

variable "strava_redirect_uri" {
  type        = string
  description = "OAuth redirect URI configured in Strava app."
  default     = ""
}

variable "strava_callback_success_url" {
  type        = string
  description = "Optional URL to redirect to after successful OAuth callback."
  default     = ""
}

variable "strava_sync_api_base_url" {
  type        = string
  description = "Public base URL used by frontend for Strava sync API (EXPO_PUBLIC_STRAVA_SYNC_API_BASE_URL)."
  default     = ""
}
