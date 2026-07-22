/**
 * Generic, product-agnostic validation engine for parametric configurators.
 *
 * A configurator validates its config against an ordered list of rules. Each
 * rule inspects the config and either returns an {@link Issue} or `null`. The
 * engine is intentionally domain-free: the stair configurator supplies building
 * -code rules, a future planter configurator supplies its own — the runner is
 * shared.
 */

export type Severity = 'error' | 'warn' | 'info';

export interface Issue {
  /** Stable identifier, unique within a validation pass (used as React key). */
  id: string;
  severity: Severity;
  /** Config field the issue relates to (free-form, for UI highlighting). */
  field: string;
  /** Human-readable, localized message. */
  message: string;
  /** Rule identifier that produced the issue. */
  rule: string;
}

/** A single validation rule over a configuration of type `T`. */
export type Rule<T> = (config: T) => Issue | null;

/** Run every rule against `config` and collect the issues that fired. */
export function runRules<T>(config: T, rules: ReadonlyArray<Rule<T>>): Issue[] {
  return rules
    .map((rule) => rule(config))
    .filter((issue): issue is Issue => issue !== null);
}

/** Count issues by severity — handy for summary badges in the UI. */
export function countBySeverity(issues: ReadonlyArray<Issue>): Record<Severity, number> {
  const counts: Record<Severity, number> = { error: 0, warn: 0, info: 0 };
  for (const issue of issues) counts[issue.severity] += 1;
  return counts;
}
