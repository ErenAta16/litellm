import { KeywordTierRule } from "./KeywordTierRules";
import { ClassifierLLMConfig, ClassifierType } from "./ComplexityRouterConfig";

export interface ComplexityTiers {
  SIMPLE: string;
  MEDIUM: string;
  COMPLEX: string;
  REASONING: string;
}

export interface BuildComplexityRouterConfigParams {
  tiers: ComplexityTiers;
  classifierType: ClassifierType;
  classifierLlmConfig: ClassifierLLMConfig | undefined;
  customTechnicalKeywords: string[];
  keywordTierRules: KeywordTierRule[];
  semanticMatchingEnabled: boolean;
  embeddingModel: string | undefined;
  matchThreshold: number;
}

export interface ComplexityRouterConfigPayload {
  tiers: ComplexityTiers;
  classifier_type: ClassifierType;
  classifier_llm_config?: ClassifierLLMConfig;
  custom_technical_keywords?: string[];
  keyword_tier_rules?: { keywords: string[]; tier: KeywordTierRule["tier"] }[];
  semantic_keyword_matching?: boolean;
  embedding_model?: string;
  match_threshold?: number;
}

const sanitizeRuleKeywords = (keywords: string[]): string[] =>
  keywords.map((kw) => kw.trim()).filter((kw) => kw.length > 0);

const rulesWithKeywords = (
  keywordTierRules: KeywordTierRule[],
): { keywords: string[]; tier: KeywordTierRule["tier"] }[] =>
  keywordTierRules
    .map((rule) => ({ keywords: sanitizeRuleKeywords(rule.keywords), tier: rule.tier }))
    .filter((rule) => rule.keywords.length > 0);

export const getSemanticConfigError = ({
  semanticMatchingEnabled,
  embeddingModel,
  keywordTierRules,
}: Pick<BuildComplexityRouterConfigParams, "semanticMatchingEnabled" | "embeddingModel" | "keywordTierRules">):
  | string
  | null => {
  if (!semanticMatchingEnabled) return null;
  if (!embeddingModel) return "Select an embedding model to use semantic keyword matching";
  if (rulesWithKeywords(keywordTierRules).length === 0) {
    return "Add at least one keyword tier rule with keywords to use semantic keyword matching";
  }
  return null;
};

export const buildComplexityRouterConfig = ({
  tiers,
  classifierType,
  classifierLlmConfig,
  customTechnicalKeywords,
  keywordTierRules,
  semanticMatchingEnabled,
  embeddingModel,
  matchThreshold,
}: BuildComplexityRouterConfigParams): ComplexityRouterConfigPayload => {
  const sanitizedRules = rulesWithKeywords(keywordTierRules);
  return {
    tiers,
    classifier_type: classifierType,
    ...(classifierType === "llm" && classifierLlmConfig && { classifier_llm_config: classifierLlmConfig }),
    ...(customTechnicalKeywords.length > 0 && { custom_technical_keywords: customTechnicalKeywords }),
    ...(sanitizedRules.length > 0 && { keyword_tier_rules: sanitizedRules }),
    ...(semanticMatchingEnabled && {
      semantic_keyword_matching: true,
      embedding_model: embeddingModel,
      match_threshold: matchThreshold,
    }),
  };
};
