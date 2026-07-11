import { renderWithProviders, screen, within } from "../../../tests/test-utils";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ComplexityRouterConfig from "./ComplexityRouterConfig";

const mockModelInfo = [
  { model_group: "gpt-4" },
  { model_group: "gpt-3.5-turbo" },
  { model_group: "claude-3-opus" },
] as any[];

const defaultTiers = {
  SIMPLE: "gpt-3.5-turbo",
  MEDIUM: "gpt-3.5-turbo",
  COMPLEX: "gpt-4",
  REASONING: "claude-3-opus",
};

const baseProps = {
  modelInfo: mockModelInfo,
  value: defaultTiers,
  onChange: vi.fn(),
  keywordTierRules: [],
  onKeywordTierRulesChange: vi.fn(),
  semanticMatchingEnabled: false,
  onSemanticMatchingEnabledChange: vi.fn(),
  embeddingModel: undefined,
  onEmbeddingModelChange: vi.fn(),
  matchThreshold: 0.5,
  onMatchThresholdChange: vi.fn(),
};

describe("ComplexityRouterConfig", () => {
  it("should render", () => {
    renderWithProviders(<ComplexityRouterConfig {...baseProps} />);
    expect(screen.getByText("Complexity Tier Configuration")).toBeInTheDocument();
  });

  it("should display all four tier labels", () => {
    renderWithProviders(<ComplexityRouterConfig {...baseProps} />);
    expect(screen.getByText("Simple Tier")).toBeInTheDocument();
    expect(screen.getByText("Medium Tier")).toBeInTheDocument();
    expect(screen.getByText("Complex Tier")).toBeInTheDocument();
    expect(screen.getByText("Reasoning Tier")).toBeInTheDocument();
  });

  it("should show example queries for each tier", () => {
    renderWithProviders(<ComplexityRouterConfig {...baseProps} />);
    expect(screen.getByText(/Hello!/)).toBeInTheDocument();
    expect(screen.getByText(/Explain how REST APIs work/)).toBeInTheDocument();
    expect(screen.getByText(/Design a microservices architecture/)).toBeInTheDocument();
    expect(screen.getByText(/Think step by step/)).toBeInTheDocument();
  });

  it("should display the how classification works section", () => {
    renderWithProviders(<ComplexityRouterConfig {...baseProps} />);
    expect(screen.getByText("How Classification Works")).toBeInTheDocument();
  });

  it("should show score thresholds in the classification section", () => {
    renderWithProviders(<ComplexityRouterConfig {...baseProps} />);
    expect(screen.getByText(/Score < 0.15/)).toBeInTheDocument();
    expect(screen.getByText(/Score 0.15 - 0.35/)).toBeInTheDocument();
    expect(screen.getByText(/Score 0.35 - 0.60/)).toBeInTheDocument();
    expect(screen.getByText(/Score > 0.60/)).toBeInTheDocument();
  });

  it("should render the custom technical keywords field", () => {
    renderWithProviders(<ComplexityRouterConfig {...baseProps} />);
    expect(screen.getByText("Custom Technical Keywords")).toBeInTheDocument();
  });

  it("should display existing custom technical keywords as tags", () => {
    renderWithProviders(
      <ComplexityRouterConfig
        {...baseProps}
        customTechnicalKeywords={["udp", "kafka"]}
        onCustomTechnicalKeywordsChange={vi.fn()}
      />,
    );
    expect(screen.getByText("udp")).toBeInTheDocument();
    expect(screen.getByText("kafka")).toBeInTheDocument();
  });

  it("should call onCustomTechnicalKeywordsChange when a keyword is entered", async () => {
    const user = userEvent.setup();
    const onCustomTechnicalKeywordsChange = vi.fn();
    renderWithProviders(
      <ComplexityRouterConfig
        {...baseProps}
        customTechnicalKeywords={[]}
        onCustomTechnicalKeywordsChange={onCustomTechnicalKeywordsChange}
      />,
    );
    const keywordsCard = screen.getByText("Custom Technical Keywords").closest(".ant-card") as HTMLElement;
    const input = within(keywordsCard).getByRole("combobox");
    await user.type(input, "udp,");
    expect(onCustomTechnicalKeywordsChange).toHaveBeenCalledWith(["udp"]);
  });

  it("should render an empty state when no keyword tier rules exist", () => {
    renderWithProviders(<ComplexityRouterConfig {...baseProps} />);
    expect(screen.getByText("Keyword Tier Overrides")).toBeInTheDocument();
    expect(screen.getByText("No keyword tier overrides configured")).toBeInTheDocument();
  });

  it("should call onKeywordTierRulesChange with a new rule when 'Add keyword rule' is clicked", async () => {
    const user = userEvent.setup();
    const onKeywordTierRulesChange = vi.fn();
    renderWithProviders(<ComplexityRouterConfig {...baseProps} onKeywordTierRulesChange={onKeywordTierRulesChange} />);
    await user.click(screen.getByRole("button", { name: /add keyword rule/i }));
    expect(onKeywordTierRulesChange).toHaveBeenCalledTimes(1);
    const newRules = onKeywordTierRulesChange.mock.calls[0][0];
    expect(newRules).toHaveLength(1);
    expect(newRules[0]).toMatchObject({ keywords: [], tier: "COMPLEX" });
  });

  it("should render an existing keyword tier rule and remove it when the delete button is clicked", async () => {
    const user = userEvent.setup();
    const onKeywordTierRulesChange = vi.fn();
    renderWithProviders(
      <ComplexityRouterConfig
        {...baseProps}
        keywordTierRules={[{ id: "rule-1", keywords: ["invoice", "refund"], tier: "MEDIUM" }]}
        onKeywordTierRulesChange={onKeywordTierRulesChange}
      />,
    );
    expect(screen.getByText("invoice")).toBeInTheDocument();
    expect(screen.getByText("refund")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /remove keyword rule 1/i }));
    expect(onKeywordTierRulesChange).toHaveBeenCalledWith([]);
  });

  it("should not show embedding model or match score fields when semantic matching is disabled", () => {
    renderWithProviders(<ComplexityRouterConfig {...baseProps} semanticMatchingEnabled={false} />);
    expect(screen.getByText("Semantic keyword matching")).toBeInTheDocument();
    expect(screen.queryByText("Embedding model")).not.toBeInTheDocument();
    expect(screen.queryByText("Minimum match score")).not.toBeInTheDocument();
  });

  it("should show embedding model and match score fields when semantic matching is enabled", () => {
    renderWithProviders(<ComplexityRouterConfig {...baseProps} semanticMatchingEnabled={true} />);
    expect(screen.getByText("Embedding model")).toBeInTheDocument();
    expect(screen.getByText("Minimum match score")).toBeInTheDocument();
  });

  it("should call onSemanticMatchingEnabledChange when the semantic matching switch is toggled", async () => {
    const user = userEvent.setup();
    const onSemanticMatchingEnabledChange = vi.fn();
    renderWithProviders(
      <ComplexityRouterConfig
        {...baseProps}
        semanticMatchingEnabled={false}
        onSemanticMatchingEnabledChange={onSemanticMatchingEnabledChange}
      />,
    );
    await user.click(screen.getByRole("switch"));
    expect(onSemanticMatchingEnabledChange).toHaveBeenCalledWith(true, expect.anything());
  });
});
