import { KeywordTierRule } from "./KeywordTierRules";

export interface ComplexityTiers {
  SIMPLE: string;
  MEDIUM: string;
  COMPLEX: string;
  REASONING: string;
}

export interface BuildComplexityRouterConfigParams {
  tiers: ComplexityTiers;
  customTechnicalKeywords: string[];
  keywordTierRules: KeywordTierRule[];
  semanticMatchingEnabled: boolean;
  embeddingModel: string | undefined;
  matchThreshold: number;
}

export interface ComplexityRouterConfigPayload {
  tiers: ComplexityTiers;
  custom_technical_keywords?: string[];
  keyword_tier_rules?: { keywords: string[]; tier: KeywordTierRule["tier"] }[];
  semantic_keyword_matching?: boolean;
  embedding_model?: string;
  match_threshold?: number;
}

export const getSemanticConfigError = ({
  semanticMatchingEnabled,
  embeddingModel,
  keywordTierRules,
}: Pick<BuildComplexityRouterConfigParams, "semanticMatchingEnabled" | "embeddingModel" | "keywordTierRules">):
  | string
  | null => {
  if (!semanticMatchingEnabled) return null;
  if (!embeddingModel) return "Select an embedding model to use semantic keyword matching";
  if (keywordTierRules.length === 0) return "Add at least one keyword tier rule to use semantic keyword matching";
  return null;
};

export const buildComplexityRouterConfig = ({
  tiers,
  customTechnicalKeywords,
  keywordTierRules,
  semanticMatchingEnabled,
  embeddingModel,
  matchThreshold,
}: BuildComplexityRouterConfigParams): ComplexityRouterConfigPayload => ({
  tiers,
  ...(customTechnicalKeywords.length > 0 && { custom_technical_keywords: customTechnicalKeywords }),
  ...(keywordTierRules.length > 0 && {
    keyword_tier_rules: keywordTierRules.map((rule) => ({ keywords: rule.keywords, tier: rule.tier })),
  }),
  ...(semanticMatchingEnabled && {
    semantic_keyword_matching: true,
    embedding_model: embeddingModel,
    match_threshold: matchThreshold,
  }),
});
