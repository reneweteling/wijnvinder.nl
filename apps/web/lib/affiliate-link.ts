/**
 * Builds an affiliate deeplink URL from a per-shop template.
 *
 * Supported placeholders (all occurrences replaced):
 *   {path} - URL-encoded pathname + search of the destination URL
 *   {url}  - URL-encoded full destination URL
 *   {ref}  - URL-encoded reference string (e.g. listing ID)
 *
 * Returns null when destinationUrl cannot be parsed or the resulting URL is
 * not a valid https URL.
 */
export function buildAffiliateUrl(
  template: string,
  destinationUrl: string,
  reference?: string
): string | null {
  let url: URL;
  try {
    url = new URL(destinationUrl);
  } catch {
    return null;
  }

  // Relative path used as the destination pointer inside the affiliate link.
  const path = url.pathname + url.search;

  const result = template
    .replaceAll("{path}", encodeURIComponent(path))
    .replaceAll("{url}", encodeURIComponent(destinationUrl))
    .replaceAll("{ref}", encodeURIComponent(reference ?? ""));

  // Validate the resulting URL is a real https URL.
  let resultUrl: URL;
  try {
    resultUrl = new URL(result);
  } catch {
    return null;
  }

  if (resultUrl.protocol !== "https:") {
    return null;
  }

  return resultUrl.toString();
}
