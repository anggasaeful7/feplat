export const SESSION_COOKIE = "spc_session";

const _apiBase =
  process.env.PLATFORM_API_BASE_URL || "http://localhost:8080";

export const apiBaseUrl = `${_apiBase}/api/v1`;


