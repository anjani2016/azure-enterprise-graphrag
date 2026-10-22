import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

describe('Azure Enterprise GraphRAG Gateway Test Suite', () => {
  it('GET /health/live should return 200 UP', async () => {
    const res = await request(app).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('node-api-gateway');
  });

  it('GET /health/ready should report system readiness and dependencies', async () => {
    const res = await request(app).get('/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('READY');
    expect(res.body.dependencies).toBeDefined();
  });

  it('POST /api/docs/render/html should render valid HTML EPC report with findings', async () => {
    const res = await request(app)
      .post('/api/docs/render/html')
      .set('Authorization', 'Bearer test-valid-jwt')
      .send({
        tenderTitle: 'GAIL Bio-CNG Panipat Package',
        projectCode: 'CR-EPC-2026',
        reviewerName: 'Anjani (Lead Architect)',
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('CENTAURI RESEARCH');
    expect(res.text).toContain('GAIL Bio-CNG Panipat Package');
    expect(res.text).toContain('OISD-179');
  });

  it('POST /api/docs/render/pdf should generate valid PDF 1.4 binary stream', async () => {
    const res = await request(app)
      .post('/api/docs/render/pdf?download=true')
      .set('Authorization', 'Bearer test-valid-jwt')
      .send({
        tenderTitle: 'GAIL Bio-CNG Panipat Package',
        projectCode: 'CR-EPC-2026',
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.body.toString('utf-8', 0, 8)).toContain('%PDF-1.4');
  });

  it('POST /api/rag/analyze should run GraphRAG analysis and initiate HITL workflow', async () => {
    const res = await request(app)
      .post('/api/rag/analyze')
      .set('Authorization', 'Bearer test-valid-jwt')
      .send({
        tenderTitle: 'IOCL Panipat Biogas Package',
        projectCode: 'CR-IOCL-101',
        tenderText: 'Contractor shall supply 1200 Nm3/hr Biogas Screw Compressor complying with OISD-179. Liquidated damages shall be 0.5% per week up to 10% under GCC 24.1.',
        seedEntityIds: ['EQ-C-101', 'CLS-GCC-24.1'],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.workflowId).toBeDefined();
    expect(res.body.status).toBe('PENDING_HUMAN_REVIEW');
    expect(res.body.aiAnalysis.criticalFindings.length).toBeGreaterThan(0);

    const workflowId = res.body.workflowId;

    // Test Human Review Approval Gate
    const reviewRes = await request(app)
      .post(`/api/hitl/workflows/${workflowId}/review`)
      .set('Authorization', 'Bearer test-valid-jwt')
      .send({
        decision: 'APPROVED',
        comments: 'Technical deviation accepted subject to OEM dual-stage cooling installation.',
        overrideRiskScore: 65,
      });

    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.status).toBe('APPROVED');
    expect(reviewRes.body.humanReview.decision).toBe('APPROVED');
  });

  it('POST /api/integrations/servicenow/incident should create incident ticket', async () => {
    const res = await request(app)
      .post('/api/integrations/servicenow/incident')
      .set('Authorization', 'Bearer test-valid-jwt')
      .send({
        shortDescription: 'Critical Deviation: OISD-179 Temperature Exceedance on EQ-C-101',
        description: 'Compressor discharge exceeds 65C. Urgent redesign required.',
        urgency: '1',
        impact: '1',
      });

    expect(res.status).toBe(201);
    expect(res.body.ticket.number).toBeDefined();
  });

  it('POST /api/integrations/jira/issue should create Jira issue', async () => {
    const res = await request(app)
      .post('/api/integrations/jira/issue')
      .set('Authorization', 'Bearer test-valid-jwt')
      .send({
        projectKey: 'EPC',
        summary: 'Resolve Liquidated Damages Cap GCC 24.1 with Client',
        description: 'Request formal pre-bid meeting to cap LD at 5%.',
        priority: 'High',
      });

    expect(res.status).toBe(201);
    expect(res.body.issue.key).toBeDefined();
  });
});
