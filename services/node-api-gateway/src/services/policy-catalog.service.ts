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
  {
    id: 'POL-GL-2026-55',
    policyNumber: 'POL-GL-2026-55',
    policyholder: 'Vanguard Construction & Engineering Corp.',
    effectiveDate: '2026-07-01 to 2027-06-30',
    aggregateLimitUsd: 10000000,
    deductibleUsd: 25000,
    waitingPeriodHours: 0,
    coverages: [
      { name: 'Bodily Injury & Property Damage Liability', limitUsd: 2000000, category: 'GENERAL_LIABILITY' },
      { name: 'Products-Completed Operations Aggregate', limitUsd: 5000000, category: 'COMPLETED_OPS' },
      { name: 'Personal & Advertising Injury', limitUsd: 2000000, category: 'LIABILITY' },
    ],
    exclusions: [
      {
        code: 'EXCL-POLLUTION-TOTAL',
        title: 'Exclusion f: Total Pollution Exclusion',
        description: 'Complete bar on bodily injury or property damage arising out of discharge, dispersal, or release of pollutants.',
        severity: 'TOTAL_BAR',
      },
      {
        code: 'EXCL-YOUR-WORK',
        title: 'Exclusion j: Damage to Your Work',
        description: 'Excludes property damage to that particular part of real property on which work is being performed.',
        severity: 'EXCLUSION_TRIGGERED',
      },
    ],
    clauses: [
      {
        clauseId: 'CLS-NOTICE-10D',
        title: 'Condition 2.a: 10-Day Written Occurrence Notice',
        requirement: 'Insured must provide written notice of any occurrence within 10 business days.',
      },
    ],
    sampleQuestions: [
      'Is chemical discharge or environmental pollution covered under CGL?',
      'What is the occurrence limit for jobsite third-party bodily injury?',
      'Are subcontractor completed operations claims indemnifiable?',
    ],
  },
  {
    id: 'POL-DO-2026-12',
    policyNumber: 'POL-DO-2026-12',
    policyholder: 'Horizon Autonomous Robotics Inc.',
    effectiveDate: '2026-02-15 to 2027-02-14',
    aggregateLimitUsd: 20000000,
    deductibleUsd: 250000,
    waitingPeriodHours: 0,
    coverages: [
      { name: 'Side A - Non-Indemnifiable Director/Officer DIC', limitUsd: 10000000, category: 'EXECUTIVE_RISK' },
      { name: 'Side B - Corporate Reimbursement', limitUsd: 5000000, category: 'COMPANY_INDEMNITY' },
      { name: 'Side C - Entity Securities Class Action Defense', limitUsd: 5000000, category: 'SECURITIES_CLAIMS' },
    ],
    exclusions: [
      {
        code: 'EXCL-FRAUD-JUDICIAL',
        title: 'Exclusion 3.1: Deliberate Fraud & Illegal Personal Profit',
        description: 'Bars indemnity for deliberate fraudulent acts only upon final non-appealable judicial adjudication.',
        severity: 'TOTAL_BAR',
      },
      {
        code: 'EXCL-PRIOR-LITIGATION',
        title: 'Exclusion 3.2: Prior & Pending Litigation Prior to 2024',
        description: 'Excludes proceedings or investigations pending prior to February 15, 2024.',
        severity: 'TOTAL_BAR',
      },
    ],
    clauses: [
      {
        clauseId: 'CLS-SEC-NOTICE',
        title: 'Condition 5.2: 30-Day SEC Formal Order Notice',
        requirement: 'Insured must report SEC Wells notices or formal orders within 30 days of service.',
      },
    ],
    sampleQuestions: [
      'Are individual directors protected under Side A if the company becomes insolvent?',
      'Does the deliberate fraud exclusion apply before a final court ruling?',
      'What is the deductible for an SEC securities class action claim?',
    ],
  },
  {
    id: 'POL-CARGO-2026-77',
    policyNumber: 'POL-CARGO-2026-77',
    policyholder: 'Pacifica Global Freight Forwarders LLC',
    effectiveDate: '2026-04-01 to 2027-03-31',
    aggregateLimitUsd: 12000000,
    deductibleUsd: 50000,
    waitingPeriodHours: 12,
    coverages: [
      { name: 'Goods in Transit (Multi-Modal Overland & Ocean)', limitUsd: 12000000, category: 'CARGO' },
      { name: 'Reefer Temperature Breakdown & Spoilage', limitUsd: 4000000, category: 'PERISHABLES' },
      { name: 'General Average & Salvage Contribution', limitUsd: 12000000, category: 'MARITIME_EXPENSE' },
    ],
    exclusions: [
      {
        code: 'EXCL-INSUFFICIENT-PACKING',
        title: 'Exclusion 4.1: Insufficient Packing & Inadequate Stowage',
        description: 'Loss or shock damage from improper packing or inadequate interior container bracing is excluded.',
        severity: 'TOTAL_BAR',
      },
      {
        code: 'EXCL-DELAY-DEMURRAGE',
        title: 'Exclusion 4.4: Market Loss & Demurrage Delay',
        description: 'Consequential market decline or port storage demurrage caused by transit delay is barred.',
        severity: 'EXCLUSION_TRIGGERED',
      },
    ],
    clauses: [
      {
        clauseId: 'CLS-REEFER-LOGGER',
        title: 'Warranty T-1: Continuous Digital Temperature Logging',
        requirement: 'Perishable consignments must carry certified active data loggers throughout transit.',
      },
    ],
    sampleQuestions: [
      'Is temperature spoilage covered if the reefer unit suffered electrical failure?',
      'Are demurrage charges or late-delivery penalties indemnifiable?',
      'What packaging warranties must be satisfied for high-value container shipments?',
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
    if (qLower.includes('pollution') || qLower.includes('chemical') || qLower.includes('environmental') || qLower.includes('discharge')) {
      return this.buildPollutionExclusionResponse(policy, question);
    }
    if (qLower.includes('director') || qLower.includes('officer') || qLower.includes('fraud') || qLower.includes('securities') || qLower.includes('sec') || qLower.includes('side a')) {
      return this.buildDoFiduciaryResponse(policy, question);
    }
    if (qLower.includes('cargo') || qLower.includes('reefer') || qLower.includes('spoilage') || qLower.includes('packing') || qLower.includes('transit') || qLower.includes('demurrage')) {
      return this.buildCargoTransitResponse(policy, question);
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

  private buildPollutionExclusionResponse(policy: MockPolicy, question: string): ChatAnswerResponse {
    return {
      policyId: policy.id,
      policyNumber: policy.policyNumber,
      question,
      answer: `Environmental discharge and chemical pollution liabilities are **EXCLUDED** under **Exclusion f (EXCL-POLLUTION-TOTAL)**. The policy enforces an absolute pollution bar on any bodily injury, remediation, or cleanup costs resulting from chemical seepage or migration unless dedicated Environmental Impairment Liability (EIL) coverage is bound.`,
      verdict: 'EXCLUSION_TRIGGERED',
      verdictLabel: 'Coverage Excluded (Absolute Pollution Bar)',
      confidenceScore: 0.97,
      citedClauses: ['Condition 2.a (10-Day Occurrence Notice)'],
      citedExclusions: ['EXCL-POLLUTION-TOTAL (Exclusion f: Total Environmental Pollution Exclusion)'],
      traversalPath: [
        `[Claim: Chemical Discharge] -> (FILED_UNDER) -> [Policy: ${policy.policyNumber}]`,
        `[Policy] -> (GOVERNED_BY) -> [Exclusion: EXCL-POLLUTION-TOTAL]`,
        `[Exclusion] -> (ACTION) -> [Absolute Denial of Defense & Indemnity]`,
      ],
      renderedHtmlBrief: this.renderBriefHtml(policy, 'EXCLUSION TRIGGERED', 'Total Bar: Environmental Pollution Exclusion'),
    };
  }

  private buildDoFiduciaryResponse(policy: MockPolicy, question: string): ChatAnswerResponse {
    return {
      policyId: policy.id,
      policyNumber: policy.policyNumber,
      question,
      answer: `Under D&O Policy **${policy.policyNumber}**, individual directors and officers have first-dollar defense coverage under **Side A (DIC)** up to **$10,000,000**. The **Deliberate Fraud Exclusion (EXCL-FRAUD-JUDICIAL)** does *not* apply at the allegation stage; it triggers only after a final, non-appealable judicial adjudication of deliberate dishonesty. Company advancement of defense costs is preserved.`,
      verdict: 'COVERAGE_AFFIRMED',
      verdictLabel: 'Defense & Indemnity Affirmed',
      confidenceScore: 0.95,
      citedClauses: ['Insuring Clause A (Side A Non-Indemnifiable DIC $10M)', 'Condition 5.2 (30-Day SEC Notice)'],
      citedExclusions: ['EXCL-FRAUD-JUDICIAL (Exclusion 3.1: Final Judicial Adjudication Standard)'],
      traversalPath: [
        `[Claim: Fiduciary/Securities Allegation] -> (FILED_UNDER) -> [Policy: ${policy.policyNumber}]`,
        `[Policy] -> (CONTAINS_COVERAGE) -> [Coverage: Side A Individual DIC ($10M)]`,
        `[Exclusion: EXCL-FRAUD-JUDICIAL] -> (EVALUATED_AGAINST) -> [Status: Defense Costs Advanced Pending Adjudication]`,
      ],
      renderedHtmlBrief: this.renderBriefHtml(policy, 'COVERAGE AFFIRMED', 'Side A Executive Defense Affirmed'),
    };
  }

  private buildCargoTransitResponse(policy: MockPolicy, question: string): ChatAnswerResponse {
    return {
      policyId: policy.id,
      policyNumber: policy.policyNumber,
      question,
      answer: `Perishable cargo temperature loss is **COVERED** up to **$4,000,000** under Reefer Breakdown coverage, subject to a 12-hour temperature deviation waiting period and verified compliance with **Warranty T-1 (Continuous Digital Temperature Logging)**. However, port demurrage fees or market delay penalties remain barred under **Exclusion 4.4 (EXCL-DELAY-DEMURRAGE)**.`,
      verdict: 'COVERAGE_AFFIRMED',
      verdictLabel: 'Cargo Spoilage Covered / Delay Excluded',
      confidenceScore: 0.92,
      citedClauses: ['Warranty T-1 (Digital Temperature Datalogger)', 'Clause: 12-Hour Spoilage Waiting Period'],
      citedExclusions: ['EXCL-DELAY-DEMURRAGE (Exclusion 4.4: Market Delay & Demurrage Bar)'],
      traversalPath: [
        `[Cargo Loss Claim] -> (FILED_UNDER) -> [Policy: ${policy.policyNumber}]`,
        `[Policy] -> (CONTAINS_COVERAGE) -> [Coverage: Reefer Breakdown ($4M Limit)]`,
        `[Coverage] -> (GOVERNED_BY) -> [Warranty T-1: Verified Temperature Logger Logged]`,
        `[Sub-Claim: Port Demurrage] -> (TRIGGERS_EXCLUSION) -> [Exclusion 4.4: Market Loss Bar]`,
      ],
      renderedHtmlBrief: this.renderBriefHtml(policy, 'COVERAGE AFFIRMED', 'Reefer Spoilage Indemnity Affirmed'),
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
