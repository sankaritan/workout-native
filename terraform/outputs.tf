output "pages_project_name" {
  value       = cloudflare_pages_project.app.name
  description = "Cloudflare Pages project name."
}

output "pages_project_subdomain" {
  value       = cloudflare_pages_project.app.subdomain
  description = "Cloudflare Pages subdomain."
}
