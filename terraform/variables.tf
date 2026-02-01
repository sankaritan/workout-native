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
