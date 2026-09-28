import { apiFetch } from "@/lib/api/client";

export type PromptTemplateRead = {
  id: string;
  name: string;
  target_type: string;
  system_prompt: string;
  default_environment: {
    languages: string[];
    frameworks: string[];
    databases: string[];
    deploy_targets: string[];
  } | null;
  created_at: string;
};

export function listPromptTemplates(): Promise<PromptTemplateRead[]> {
  return apiFetch<PromptTemplateRead[]>("/api/v1/prompt-templates");
}
