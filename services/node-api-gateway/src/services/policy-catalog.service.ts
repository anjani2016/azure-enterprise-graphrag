/**
 * Policy Catalog & Adjudication Service
 * Provides mock insurance policy repository and GraphRAG question-answering logic.
 *
 * Legal party: Alpha Centauri Ventures Inc.
 * Brand: Centauri Research
 */

export interface MockPolicy {
  id: string;
  policyNumber: string;
  policyholder: string;
  effectiveDate: string;
  aggregateLimitUsd: number;
  deductibleUsd: number;
  waitingPeriodHours: number;
  coverages: Array<{ name: string; limitUsd: number; category: string }>;
  exclusions: Array<{ code: string; title: string; description: string; severity: string }>;
  clauses: Array<{ clauseId: string; title: string; requirement: string }>;
  sampleQuestions: string[];
}

export interface ChatAnswerResponse {
  policyId: string;
  policyNumber: string;
  question: string;
  answer: string;
  verdict: 'COVERAGE_AFFIRMED' | 'RESERVATION_OF_RIGHTS' | 'EXCLUSION_TRIGGERED';
  verdictLabel: string;
  confidenceScore: number;
  citedClauses: string[];
  citedExclusions: string[];
  traversalPath: string[];
  renderedHtmlBrief: string;
}

const DEFAULT_POLICIES: MockPolicy[] = [
  {
    id: 'POL-CYBER-PROP-2026-99',
    policyNumber: 'POL-CYBER-PROP-2026-99',
    policyholder: 'GlobalTech Solutions Inc.',
    effectiveDate: '2026-01-01 to 2026-12-31',
    aggregateLimitUsd: 10000000,
    deductibleUsd: 50000,
    waitingPeriodHours: 72,
    coverages: [
      { name: 'Business Interruption', limitUsd: 5000000, category: 'CYBER_LOSS' },
      { name: 'Ransomware & Cyber Extortion', limitUsd: 3000000, category: 'FIRST_PARTY' },
      { name: 'Digital Asset Restoration', limitUsd: 2000000, category: 'FIRST_PARTY' },
    ],
    exclusions: [
      {
        code: 'EXCL-UNPATCHED-CVE',
        title: 'Exclusion 4.2: Known Vulnerability Unpatched > 30 Days',
        description: 'No indemnity is payable for losses arising from known CVE vulnerabilities where manufacturer patch was published > 30 days prior to intrusion.',
        severity: 'TOTAL_BAR',
      },
      {
        code: 'EXCL-NATION-STATE',
        title: 'Exclusion 5.1: State-Sponsored Cyber Warfare',
        description: 'Excludes damage or business interruption caused directly or indirectly by hostile acts of sovereign states.',
        severity: 'TOTAL_BAR',
      },
    ],
    clauses: [
      {
        clauseId: 'CLS-COND-WAIT-72H',
        title: 'Condition 8.1: Time Element Waiting Period',
        requirement: 'A mandatory 72-hour waiting period applies to all Business Interruption losses before indemnity accrues.',
      },
      {
        clauseId: 'CLS-SEC-MFA',
        title: 'Warranty 2.4: Multi-Factor Authentication',
        requirement: 'Insured must enforce MFA across all external remote access gateways.',
      },
    ],
    sampleQuestions: [
      'Is ransomware covered if intrusion was through an unpatched VPN vulnerability?',
      'What is our deductible and waiting period for business interruption downtime?',
      'Are nation-state cyber attacks covered under this policy?',
    ],
  },
  {
    id: 'POL-2026-COMM-PROPERTY',
    policyNumber: 'POL-2026-COMM-PROPERTY',
    policyholder: 'Apex Logistics & Warehousing Ltd.',
    effectiveDate: '2026-03-01 to 2027-02-28',
    aggregateLimitUsd: 25000000,
    deductibleUsd: 100000,
    waitingPeriodHours: 24,
    coverages: [
      { name: 'Commercial Building & Structure', limitUsd: 18000000, category: 'PROPERTY_DAMAGE' },
      { name: 'Personal Property of Insured (Cargo & Stock)', limitUsd: 5000000, category: 'CONTENTS' },
      { name: 'Extra Expense & Demolition', limitUsd: 2000000, category: 'TIME_ELEMENT' },
    ],
    exclusions: [
      {
        code: 'EXCL-FLOOD-SURFACE',
        title: 'Exclusion 7.1: Surface Water Intrusion & Flood',
        description: 'Excludes loss from surface water, tidal water, or overflow of any body of water unless separate Flood Endorsement is purchased.',
        severity: 'TOTAL_BAR',
      },
      {
        code: 'EXCL-WEAR-TEAR',
        title: 'Exclusion 3.2: Gradual Deterioration & Rust',
        description: 'Loss caused by wear, tear, decay, rust, or latent defect is excluded.',
        severity: 'TOTAL_BAR',
      },
    ],
    clauses: [
      {
        clauseId: 'CLS-WIND-HAIL-DED',
        title: 'Endorsement W-10: Named Storm & Hail Deductible',
        requirement: 'A 2% percentage deductible applies to total building insured value for Category 2+ hurricane winds.',
      },
      {
        clauseId: 'CLS-FIRE-PROT',
        title: 'Condition 4.5: Automatic Sprinkler Maintenance',
        requirement: 'Insured must maintain central station sprinkler monitoring in all storage bays.',
      },
    ],
    sampleQuestions: [
      'Is roof damage from hurricane wind and hail covered?',
      'Is damage from surface water flooding inside the warehouse covered?',
      'What deductible applies for catastrophic windstorm events?',
    ],
  },
  {
    id: 'POL-MACH-2026-04',
    policyNumber: 'POL-MACH-2026-04',
    policyholder: 'Quantum Clean Energy GenCorp',
    effectiveDate: '2026-05-01 to 2027-04-30',
    aggregateLimitUsd: 15000000,
    deductibleUsd: 25000,
    waitingPeriodHours: 48,
    coverages: [
      { name: 'Turbine & Compressor Mechanical Breakdown', limitUsd: 10000000, category: 'BOILER_MACHINERY' },
      { name: 'Electrical Arcing & Stator Burnout', limitUsd: 3000000, category: 'ELECTRICAL' },
      { name: 'Spoilage & Expediting Expenses', limitUsd: 2000000, category: 'SUPPLEMENTAL' },
    ],
    exclusions: [
      {
        code: 'EXCL-CORROSION',
        title: 'Exclusion 2.4: Chemical Corrosion & Cavitation',
        description: 'Gradual erosion, cavitation, or acid gas corrosion of rotor blades is excluded.',
        severity: 'SUB_LIMIT_TRIGGER',
      },
    ],
    clauses: [
      {
        clauseId: 'CLS-OEM-SERVICE',
        title: 'Warranty 9.1: OEM Maintenance Compliance',
        requirement: 'Compressors must be serviced annually by certified OEM technicians.',
      },
    ],
    sampleQuestions: [
      'Is sudden catastrophic compressor breakdown covered?',
      'Are blade damages caused by gradual chemical corrosion covered?',
      'What are our warranty maintenance obligations to preserve coverage?',
    ],
  },
];

export class PolicyCatalogService {
  private policies: Map<string, MockPolicy> = new Map();

  constructor() {
    DEFAULT_POLICIES.forEach((p) => this.policies.set(p.id, p));
  }

  /**
   * Retrieves all available mock policies.
   */
  getPolicies(): MockPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * Retrieves a policy by its ID.
   */
  getPolicyById(id: string): MockPolicy | undefined {
    return this.policies.get(id);
  }

  /**
   * Adds a newly uploaded custom mock policy.
   */
  addPolicy(policy: MockPolicy): MockPolicy {
    this.policies.set(policy.id, policy);
    return policy;
  }

  /**
   * Answers a policyholder or adjuster question grounded strictly in knowledge graph facts.
   */
  answerQuestion(policyId: string, question: string): ChatAnswerResponse {
    const policy = this.policies.get(policyId) || DEFAULT_POLICIES[0];
    const qLower = question.toLowerCase();

    if (qLower.includes('unpatched') || qLower.includes('vpn') || qLower.includes('vulnerability')) {
      return this.buildUnpatchedVulnerabilityResponse(policy, question);
    }
    if (qLower.includes('flood') || qLower.includes('water') || qLower.includes('surface')) {
      return this.buildWaterExclusionResponse(policy, question);
    }
    if (qLower.includes('corrosion') || qLower.includes('wear') || qLower.includes('tear')) {
      return this.buildWearAndTearResponse(policy, question);
    }
    if (qLower.includes('deductible') || qLower.includes('waiting') || qLower.includes('hours') || qLower.includes('limit')) {
      return this.buildDeductibleResponse(policy, question);
    }
    return this.buildAffirmedCoverageResponse(policy, question);
  }

  private buildUnpatchedVulnerabilityResponse(policy: MockPolicy, question: string): ChatAnswerResponse {
    return {
      policyId: policy.id,
      policyNumber: policy.policyNumber,
      question,
      answer: `Coverage for this incident is subject to a formal **RESERVATION OF RIGHTS**. The policy explicitly contains **Exclusion 4.2 (EXCL-UNPATCHED-CVE)**, which bars coverage for intrusions originating through known vulnerabilities unpatched > 30 days after vendor publication. Additionally, Condition 8.1 mandates a 72-hour waiting period deductible on all Business Interruption losses.`,
      verdict: 'RESERVATION_OF_RIGHTS',
      verdictLabel: 'Reservation of Rights / Exclusion Triggered',
      confidenceScore: 0.94,
      citedClauses: ['CLS-COND-WAIT-72H (72-Hour Waiting Period)', 'CLS-SEC-MFA (MFA Warranty)'],
      citedExclusions: ['EXCL-UNPATCHED-CVE (Exclusion 4.2: Critical Known Vulnerability Unpatched > 30 Days)'],
      traversalPath: [
        `[Claim Incident] -> (FILED_UNDER) -> [Policy: ${policy.policyNumber}]`,
        `[Policy] -> (CONTAINS_COVERAGE) -> [Coverage: Business Interruption ($5M Limit)]`,
        `[Claim] -> (TRIGGERS_EXCLUSION) -> [Exclusion: EXCL-UNPATCHED-CVE]`,
        `[Coverage] -> (GOVERNED_BY) -> [Clause: CLS-COND-WAIT-72H (72h Waiting Period)]`,
      ],
      renderedHtmlBrief: this.renderBriefHtml(policy, 'RESERVATION OF RIGHTS', 'High Risk: Exclusion 4.2 Triggered'),
    };
  }

  private buildWaterExclusionResponse(policy: MockPolicy, question: string): ChatAnswerResponse {
    return {
      policyId: policy.id,
      policyNumber: policy.policyNumber,
      question,
      answer: `Loss caused by surface water runoff or flood is **EXCLUDED** under **Exclusion 7.1 (EXCL-FLOOD-SURFACE)**. Wind-driven rain entering through a direct hurricane breach in the roof remains covered under Commercial Building Coverage, but surface pooling is barred.`,
      verdict: 'EXCLUSION_TRIGGERED',
      verdictLabel: 'Coverage Excluded',
      confidenceScore: 0.96,
      citedClauses: ['CLS-WIND-HAIL-DED (Named Storm Deductible 2%)'],
      citedExclusions: ['EXCL-FLOOD-SURFACE (Exclusion 7.1: Surface Water Intrusion & Flood)'],
      traversalPath: [
        `[Claim Incident] -> (FILED_UNDER) -> [Policy: ${policy.policyNumber}]`,
        `[Policy] -> (CONTAINS_COVERAGE) -> [Coverage: Commercial Building ($18M)]`,
        `[Claim Peril: Surface Water] -> (TRIGGERS_EXCLUSION) -> [Exclusion: EXCL-FLOOD-SURFACE]`,
      ],
      renderedHtmlBrief: this.renderBriefHtml(policy, 'EXCLUSION TRIGGERED', 'Total Bar: Surface Water Intrusion'),
    };
  }

  private buildWearAndTearResponse(policy: MockPolicy, question: string): ChatAnswerResponse {
    return {
      policyId: policy.id,
      policyNumber: policy.policyNumber,
      question,
      answer: `Loss resulting from gradual corrosion, erosion, or wear and tear is **EXCLUDED** under Exclusion 2.4. Only sudden and accidental mechanical breakdown or electrical arcing is indemnifiable.`,
      verdict: 'EXCLUSION_TRIGGERED',
      verdictLabel: 'Coverage Excluded',
      confidenceScore: 0.91,
      citedClauses: ['CLS-OEM-SERVICE (OEM Maintenance Compliance)'],
      citedExclusions: ['EXCL-CORROSION (Exclusion 2.4: Gradual Chemical Corrosion & Cavitation)'],
      traversalPath: [
        `[Claim Incident] -> (FILED_UNDER) -> [Policy: ${policy.policyNumber}]`,
        `[Claim Peril: Corrosion] -> (TRIGGERS_EXCLUSION) -> [Exclusion: EXCL-CORROSION]`,
      ],
      renderedHtmlBrief: this.renderBriefHtml(policy, 'EXCLUSION TRIGGERED', 'Barred: Gradual Wear and Tear'),
    };
  }

  private buildDeductibleResponse(policy: MockPolicy, question: string): ChatAnswerResponse {
    return {
      policyId: policy.id,
      policyNumber: policy.policyNumber,
      question,
      answer: `For policy **${policy.policyNumber}**, the aggregate limit is **$${(policy.aggregateLimitUsd / 1000000).toFixed(1)}M USD**, with a baseline monetary deductible of **$${policy.deductibleUsd.toLocaleString()} USD**. A time-element waiting period of **${policy.waitingPeriodHours} hours** applies to all business interruption losses before recovery commences.`,
      verdict: 'COVERAGE_AFFIRMED',
      verdictLabel: 'Coverage Affirmed',
      confidenceScore: 0.98,
      citedClauses: [`Clause: ${policy.waitingPeriodHours}-Hour Waiting Period`, `Deductible: $${policy.deductibleUsd.toLocaleString()}`],
      citedExclusions: [],
      traversalPath: [
        `[Policy: ${policy.policyNumber}] -> (HAS_LIMIT) -> [$${(policy.aggregateLimitUsd / 1000000).toFixed(1)}M]`,
        `[Coverage] -> (GOVERNED_BY) -> [Deductible: $${policy.deductibleUsd.toLocaleString()}]`,
      ],
      renderedHtmlBrief: this.renderBriefHtml(policy, 'COVERAGE AFFIRMED', 'Limits and Deductibles Validated'),
    };
  }

  private buildAffirmedCoverageResponse(policy: MockPolicy, question: string): ChatAnswerResponse {
    const primaryCoverage = policy.coverages[0]?.name || 'Standard Coverage';
    return {
      policyId: policy.id,
      policyNumber: policy.policyNumber,
      question,
      answer: `Based on the Knowledge Graph traversal, this peril falls within **${primaryCoverage}** under policy **${policy.policyNumber}**. No statutory exclusion bars apply to this loss event. Recovery is subject to the standard policy deductible of **$${policy.deductibleUsd.toLocaleString()}**.`,
      verdict: 'COVERAGE_AFFIRMED',
      verdictLabel: 'Coverage Affirmed',
      confidenceScore: 0.93,
      citedClauses: [`Coverage: ${primaryCoverage}`],
      citedExclusions: [],
      traversalPath: [
        `[Claim Inquiry] -> (FILED_UNDER) -> [Policy: ${policy.policyNumber}]`,
        `[Policy] -> (CONTAINS_COVERAGE) -> [${primaryCoverage}]`,
        `[Coverage] -> (EVALUATED_AGAINST) -> [NAIC Model Act 880: Compliant]`,
      ],
      renderedHtmlBrief: this.renderBriefHtml(policy, 'COVERAGE AFFIRMED', 'Full Coverage Affirmed'),
    };
  }

  private renderBriefHtml(policy: MockPolicy, verdict: string, summary: string): string {
    const coverageList = policy.coverages.map((c) => `<li><strong>${c.name}</strong>: Limit $${c.limitUsd.toLocaleString()} (${c.category})</li>`).join('');
    const exclusionList = policy.exclusions.map((e) => `<li><span class="badge-red">${e.code}</span>: ${e.title} - <em>${e.description}</em></li>`).join('');
    const clauseList = policy.clauses.map((cl) => `<li><strong>${cl.clauseId}</strong>: ${cl.title} (${cl.requirement})</li>`).join('');

    return `
      <div class="brief-container">
        <div class="brief-header">
          <h4>Policy Brief: ${policy.policyNumber}</h4>
          <span class="badge-verdict ${verdict === 'COVERAGE_AFFIRMED' ? 'green' : 'amber'}">${verdict}</span>
        </div>
        <p class="brief-summary">${summary}</p>
        <div class="brief-section">
          <h5>Insured Entity</h5>
          <p><strong>${policy.policyholder}</strong> | Term: ${policy.effectiveDate}</p>
        </div>
        <div class="brief-section">
          <h5>Coverages &amp; Sub-Limits</h5>
          <ul>${coverageList}</ul>
        </div>
        <div class="brief-section">
          <h5>Key Exclusions</h5>
          <ul>${exclusionList}</ul>
        </div>
        <div class="brief-section">
          <h5>Conditions &amp; Warranties</h5>
          <ul>${clauseList}</ul>
        </div>
      </div>
    `;
  }
}

export const policyCatalogService = new PolicyCatalogService();
