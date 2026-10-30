export function safeRedirect(path?: string | null, fallback = "/dashboard") {
	if (!path) return fallback;
	if (!path.startsWith("/") || path.startsWith("//")) return fallback;
	return path;
}
