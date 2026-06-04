export type ApiConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  updatedAt?: string;
};

export type ApiStatus = {
  configured: boolean;
  baseUrl: string;
  model: string;
  source: "page" | "env" | "none";
};
