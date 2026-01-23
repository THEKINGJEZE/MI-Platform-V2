#!/usr/bin/env node
/**
 * MI Platform Data Quality Audit Script
 * Analyzes signals, opportunities, forces, and contacts for quality issues
 *
 * Usage: node scripts/data-quality-audit.cjs <signals-file> <opportunities-file>
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DEPLOYMENT_DATE = new Date('2025-01-21T00:00:00Z');
const FALSE_POSITIVE_PATTERNS = {
  swornOfficer: [
    /\bdetective constable\b/i,
    /\bdetective sergeant\b/i,
    /\bdetective inspector\b/i,
    /\bpolice constable\b/i,
    /\bsergeant\b/i,
    /\binspector\b/i,
    /\bsuperintendent\b/i,
    /\bpcso\b/i,
    /\bpolice community support officer\b/i,
    /\bspecial constable\b/i,
    /\bdci\b/i,
    /\bdcs\b/i,
    /\bdc\s/i,
    /\bpc\s/i,
    /\bds\s/i,
  ],
  nonPoliceOrg: [
    /\bnhs\b/i,
    /\bhospital\b/i,
    /\bhealth trust\b/i,
    /\bccg\b/i,
    /\benvironment agency\b/i,
    /\bprobation\b/i,
    /\bhmpps\b/i,
    /\bbarclays\b/i,
    /\bhsbc\b/i,
    /\blloyds\b/i,
    /\bnatwest\b/i,
    /\btesco\b/i,
    /\bsainsbury\b/i,
    /\biopc\b/i,
    /\bprison\b/i,
    /\bpolice treatment centre\b/i,
    /\bpolice federation\b/i,
  ],
  outOfScope: [
    /\bvolunteer\b/i,
    /\bfacilities\b/i,
    /\bmaintenance\b/i,
    /\bhelpdesk\b/i,
    /\bhr advisor\b/i,
    /\bcommunications\b/i,
    /\bpublic relations\b/i,
    /\bfinance business partner\b/i,
    /\bhousekeeping\b/i,
    /\bcatering\b/i,
    /\bmobile patrol officer\b/i,
    /\bsecurity officer\b/i,
    /\bcleaner\b/i,
    /\breceptionist\b/i,
    /\bit support\b/i,
    /\badmin assistant\b/i,
  ],
  contradictions: [
    /not a police force/i,
    /not police/i,
    /non-police/i,
    /private sector/i,
    /not law enforcement/i,
  ],
};

// Relevant role keywords (for false negative detection)
const RELEVANT_ROLE_PATTERNS = [
  /\binvestigator\b/i,
  /\bdisclosure\b/i,
  /\banalyst\b/i,
  /\bforensic\b/i,
  /\bholmes\b/i,
  /\bintelligence\b/i,
  /\bcriminal justice\b/i,
  /\bpip\s*2\b/i,
  /\bpip2\b/i,
  /\baccredited investigator\b/i,
];

// Helper functions
function parseDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr);
}

function isAfterDeployment(dateStr) {
  const date = parseDate(dateStr);
  return date && date >= DEPLOYMENT_DATE;
}

function checkFalsePositive(signal) {
  const title = (signal.title || '').toLowerCase();
  const company = (signal.company || signal.employer || '').toLowerCase();
  const text = `${title} ${company}`;
  const reason = (signal.relevance_reason || '').toLowerCase();

  const issues = [];

  // Check sworn officer patterns
  for (const pattern of FALSE_POSITIVE_PATTERNS.swornOfficer) {
    if (pattern.test(title)) {
      issues.push({ type: 'sworn_officer', pattern: pattern.source, match: title.match(pattern)?.[0] });
    }
  }

  // Check non-police org patterns
  for (const pattern of FALSE_POSITIVE_PATTERNS.nonPoliceOrg) {
    if (pattern.test(text)) {
      issues.push({ type: 'non_police_org', pattern: pattern.source, match: text.match(pattern)?.[0] });
    }
  }

  // Check out-of-scope patterns
  for (const pattern of FALSE_POSITIVE_PATTERNS.outOfScope) {
    if (pattern.test(title)) {
      issues.push({ type: 'out_of_scope', pattern: pattern.source, match: title.match(pattern)?.[0] });
    }
  }

  // Check contradictions in AI reasoning
  for (const pattern of FALSE_POSITIVE_PATTERNS.contradictions) {
    if (pattern.test(reason)) {
      issues.push({ type: 'contradiction', pattern: pattern.source, match: reason.match(pattern)?.[0] });
    }
  }

  return issues;
}

function checkFalseNegative(signal) {
  const title = (signal.title || '').toLowerCase();
  const company = (signal.company || signal.employer || '').toLowerCase();

  const issues = [];

  // Check if title contains relevant role keywords
  for (const pattern of RELEVANT_ROLE_PATTERNS) {
    if (pattern.test(title)) {
      // Check if company looks like a police force
      if (/police|constabulary/i.test(company)) {
        issues.push({ type: 'missed_relevant_role', pattern: pattern.source, title, company });
      }
    }
  }

  return issues;
}

function analyzeSignals(signals) {
  console.log('\n=== SIGNALS ANALYSIS ===\n');

  const totalSignals = signals.length;
  const beforeDeployment = signals.filter(s => !isAfterDeployment(s.fields.detected_at));
  const afterDeployment = signals.filter(s => isAfterDeployment(s.fields.detected_at));

  console.log(`Total Signals: ${totalSignals}`);
  console.log(`Before Deployment (21 Jan 2025): ${beforeDeployment.length}`);
  console.log(`After Deployment: ${afterDeployment.length}`);

  // Field completion analysis
  const fields = [
    'type', 'source', 'force', 'title', 'status', 'detected_at',
    'role_type', 'seniority', 'ai_confidence', 'force_source',
    'first_seen', 'last_seen', 'scrape_count',
    'relevance_score', 'relevance_reason', 'url', 'external_id', 'company'
  ];

  console.log('\n--- FIELD COMPLETION RATES ---');
  const fieldStats = {};

  for (const field of fields) {
    const totalWithField = signals.filter(s => s.fields[field] !== undefined && s.fields[field] !== null && s.fields[field] !== '').length;
    const beforeWithField = beforeDeployment.filter(s => s.fields[field] !== undefined && s.fields[field] !== null && s.fields[field] !== '').length;
    const afterWithField = afterDeployment.filter(s => s.fields[field] !== undefined && s.fields[field] !== null && s.fields[field] !== '').length;

    fieldStats[field] = {
      total: totalWithField,
      totalPct: ((totalWithField / totalSignals) * 100).toFixed(1),
      before: beforeWithField,
      beforePct: beforeDeployment.length > 0 ? ((beforeWithField / beforeDeployment.length) * 100).toFixed(1) : 'N/A',
      after: afterWithField,
      afterPct: afterDeployment.length > 0 ? ((afterWithField / afterDeployment.length) * 100).toFixed(1) : 'N/A',
    };

    console.log(`${field}: ${fieldStats[field].totalPct}% (Before: ${fieldStats[field].beforePct}%, After: ${fieldStats[field].afterPct}%)`);
  }

  // Status distribution
  console.log('\n--- STATUS DISTRIBUTION ---');
  const statusCounts = {};
  for (const signal of signals) {
    const status = signal.fields.status || 'unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }
  for (const [status, count] of Object.entries(statusCounts)) {
    console.log(`${status}: ${count} (${((count / totalSignals) * 100).toFixed(1)}%)`);
  }

  // Type distribution
  console.log('\n--- TYPE DISTRIBUTION ---');
  const typeCounts = {};
  for (const signal of signals) {
    const type = signal.fields.type || 'unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  }
  for (const [type, count] of Object.entries(typeCounts)) {
    console.log(`${type}: ${count} (${((count / totalSignals) * 100).toFixed(1)}%)`);
  }

  // Source distribution
  console.log('\n--- SOURCE DISTRIBUTION ---');
  const sourceCounts = {};
  for (const signal of signals) {
    const source = signal.fields.source || 'unknown';
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  }
  for (const [source, count] of Object.entries(sourceCounts)) {
    console.log(`${source}: ${count} (${((count / totalSignals) * 100).toFixed(1)}%)`);
  }

  // FALSE POSITIVE ANALYSIS
  console.log('\n--- FALSE POSITIVE ANALYSIS (Relevant Signals) ---');
  const relevantSignals = signals.filter(s => s.fields.status === 'relevant');
  console.log(`Total Relevant Signals: ${relevantSignals.length}`);

  const falsePositives = [];
  for (const signal of relevantSignals) {
    const issues = checkFalsePositive(signal.fields);
    if (issues.length > 0) {
      falsePositives.push({
        id: signal.id,
        title: signal.fields.title,
        company: signal.fields.company || signal.fields.employer,
        issues,
      });
    }
  }

  console.log(`Potential False Positives: ${falsePositives.length} (${((falsePositives.length / relevantSignals.length) * 100).toFixed(1)}%)`);

  // Break down by issue type
  const issueTypeCounts = {};
  for (const fp of falsePositives) {
    for (const issue of fp.issues) {
      issueTypeCounts[issue.type] = (issueTypeCounts[issue.type] || 0) + 1;
    }
  }
  console.log('\nFalse Positive Issue Breakdown:');
  for (const [type, count] of Object.entries(issueTypeCounts)) {
    console.log(`  ${type}: ${count}`);
  }

  // FALSE NEGATIVE ANALYSIS
  console.log('\n--- FALSE NEGATIVE ANALYSIS (Irrelevant Signals) ---');
  const irrelevantSignals = signals.filter(s => s.fields.status === 'irrelevant');
  console.log(`Total Irrelevant Signals: ${irrelevantSignals.length}`);

  const falseNegatives = [];
  for (const signal of irrelevantSignals) {
    const issues = checkFalseNegative(signal.fields);
    if (issues.length > 0) {
      falseNegatives.push({
        id: signal.id,
        title: signal.fields.title,
        company: signal.fields.company || signal.fields.employer,
        issues,
      });
    }
  }

  console.log(`Potential False Negatives: ${falseNegatives.length}`);

  // DUPLICATE ANALYSIS
  console.log('\n--- DUPLICATE ANALYSIS ---');

  // By external_id
  const externalIdCounts = {};
  for (const signal of signals) {
    const extId = signal.fields.external_id;
    if (extId) {
      externalIdCounts[extId] = (externalIdCounts[extId] || 0) + 1;
    }
  }
  const duplicateExtIds = Object.entries(externalIdCounts).filter(([, count]) => count > 1);
  console.log(`Duplicate external_ids: ${duplicateExtIds.length} (affecting ${duplicateExtIds.reduce((sum, [, count]) => sum + count, 0)} signals)`);

  // By URL
  const urlCounts = {};
  for (const signal of signals) {
    const url = signal.fields.url;
    if (url) {
      urlCounts[url] = (urlCounts[url] || 0) + 1;
    }
  }
  const duplicateUrls = Object.entries(urlCounts).filter(([, count]) => count > 1);
  console.log(`Duplicate URLs: ${duplicateUrls.length} (affecting ${duplicateUrls.reduce((sum, [, count]) => sum + count, 0)} signals)`);

  // By title + company
  const titleCompanyCounts = {};
  for (const signal of signals) {
    const key = `${signal.fields.title}|${signal.fields.company || signal.fields.employer}`;
    titleCompanyCounts[key] = (titleCompanyCounts[key] || 0) + 1;
  }
  const duplicateTitleCompany = Object.entries(titleCompanyCounts).filter(([, count]) => count > 1);
  console.log(`Duplicate title+company: ${duplicateTitleCompany.length} (affecting ${duplicateTitleCompany.reduce((sum, [, count]) => sum + count, 0)} signals)`);

  // ROLE TYPE ANALYSIS (post-deployment)
  console.log('\n--- ROLE TYPE DISTRIBUTION (Post-21 Jan) ---');
  const roleTypeCounts = {};
  for (const signal of afterDeployment) {
    const roleType = signal.fields.role_type || 'not_set';
    roleTypeCounts[roleType] = (roleTypeCounts[roleType] || 0) + 1;
  }
  for (const [roleType, count] of Object.entries(roleTypeCounts)) {
    console.log(`${roleType}: ${count}`);
  }

  // SENIORITY ANALYSIS (post-deployment)
  console.log('\n--- SENIORITY DISTRIBUTION (Post-21 Jan) ---');
  const seniorityCounts = {};
  for (const signal of afterDeployment) {
    const seniority = signal.fields.seniority || 'not_set';
    seniorityCounts[seniority] = (seniorityCounts[seniority] || 0) + 1;
  }
  for (const [seniority, count] of Object.entries(seniorityCounts)) {
    console.log(`${seniority}: ${count}`);
  }

  // FORCE SOURCE ANALYSIS
  console.log('\n--- FORCE SOURCE DISTRIBUTION ---');
  const forceSourceCounts = {};
  for (const signal of signals) {
    const forceSource = signal.fields.force_source || 'not_set';
    forceSourceCounts[forceSource] = (forceSourceCounts[forceSource] || 0) + 1;
  }
  for (const [forceSource, count] of Object.entries(forceSourceCounts)) {
    console.log(`${forceSource}: ${count}`);
  }

  // ORPHANED SIGNALS (no force link)
  console.log('\n--- ORPHANED SIGNALS (Relevant but no Force) ---');
  const orphanedSignals = relevantSignals.filter(s => !s.fields.force || s.fields.force.length === 0);
  console.log(`Orphaned relevant signals: ${orphanedSignals.length}`);

  return {
    totalSignals,
    beforeDeployment: beforeDeployment.length,
    afterDeployment: afterDeployment.length,
    fieldStats,
    statusCounts,
    typeCounts,
    sourceCounts,
    falsePositives,
    falseNegatives,
    duplicateExtIds: duplicateExtIds.length,
    duplicateUrls: duplicateUrls.length,
    duplicateTitleCompany: duplicateTitleCompany.length,
    orphanedSignals: orphanedSignals.length,
    relevantCount: relevantSignals.length,
    irrelevantCount: irrelevantSignals.length,
  };
}

function analyzeOpportunities(opportunities, signals) {
  console.log('\n=== OPPORTUNITIES ANALYSIS ===\n');

  const totalOpps = opportunities.length;
  console.log(`Total Opportunities: ${totalOpps}`);

  // Field completion
  const fields = [
    'force', 'signals', 'priority_tier', 'priority_score', 'is_competitor_intercept',
    'status', 'why_now', 'outreach_draft', 'contact'
  ];

  console.log('\n--- FIELD COMPLETION RATES ---');
  for (const field of fields) {
    let count;
    if (field === 'signals' || field === 'force' || field === 'contact') {
      count = opportunities.filter(o => o.fields[field] && o.fields[field].length > 0).length;
    } else if (field === 'is_competitor_intercept') {
      count = opportunities.filter(o => o.fields[field] === true || o.fields[field] === false).length;
    } else {
      count = opportunities.filter(o => o.fields[field] !== undefined && o.fields[field] !== null && o.fields[field] !== '').length;
    }
    console.log(`${field}: ${count}/${totalOpps} (${((count / totalOpps) * 100).toFixed(1)}%)`);
  }

  // Status distribution
  console.log('\n--- STATUS DISTRIBUTION ---');
  const statusCounts = {};
  for (const opp of opportunities) {
    const status = opp.fields.status || 'unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }
  for (const [status, count] of Object.entries(statusCounts)) {
    console.log(`${status}: ${count}`);
  }

  // Priority tier distribution
  console.log('\n--- PRIORITY TIER DISTRIBUTION ---');
  const priorityCounts = {};
  for (const opp of opportunities) {
    const tier = opp.fields.priority_tier || 'unknown';
    priorityCounts[tier] = (priorityCounts[tier] || 0) + 1;
  }
  for (const [tier, count] of Object.entries(priorityCounts)) {
    console.log(`${tier}: ${count}`);
  }

  // DUPLICATE CHECK (multiple opps per force)
  console.log('\n--- FORCE CONSOLIDATION CHECK ---');
  const forceOppCounts = {};
  for (const opp of opportunities) {
    const forces = opp.fields.force || [];
    for (const forceId of forces) {
      forceOppCounts[forceId] = (forceOppCounts[forceId] || 0) + 1;
    }
  }
  const forcesWithMultiple = Object.entries(forceOppCounts).filter(([, count]) => count > 1);
  console.log(`Forces with multiple opportunities: ${forcesWithMultiple.length}`);
  if (forcesWithMultiple.length > 0) {
    console.log('Top offenders:');
    forcesWithMultiple.sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([forceId, count]) => {
      console.log(`  ${forceId}: ${count} opportunities`);
    });
  }

  // COMPETITOR FLAG COMPLIANCE
  console.log('\n--- COMPETITOR FLAG COMPLIANCE ---');

  // Build a map of signal IDs to their types
  const signalTypeMap = {};
  for (const signal of signals) {
    signalTypeMap[signal.id] = signal.fields.type;
  }

  // Find opps that have competitor signals
  const oppsWithCompetitorSignals = [];
  for (const opp of opportunities) {
    const signalIds = opp.fields.signals || [];
    const hasCompetitorSignal = signalIds.some(id => signalTypeMap[id] === 'competitor_job');
    if (hasCompetitorSignal) {
      oppsWithCompetitorSignals.push(opp);
    }
  }

  console.log(`Opportunities with competitor signals: ${oppsWithCompetitorSignals.length}`);

  // Check compliance
  let flaggedCorrectly = 0;
  let priorityCorrectly = 0;
  const nonCompliant = [];

  for (const opp of oppsWithCompetitorSignals) {
    const isCompetitorIntercept = opp.fields.is_competitor_intercept === true;
    const isHotPriority = opp.fields.priority_tier === 'hot' || opp.fields.priority_tier === 'p1';

    if (isCompetitorIntercept) flaggedCorrectly++;
    if (isHotPriority) priorityCorrectly++;

    if (!isCompetitorIntercept || !isHotPriority) {
      nonCompliant.push({
        id: opp.id,
        name: opp.fields.name,
        is_competitor_intercept: opp.fields.is_competitor_intercept,
        priority_tier: opp.fields.priority_tier,
      });
    }
  }

  console.log(`Correctly flagged as competitor intercept: ${flaggedCorrectly}/${oppsWithCompetitorSignals.length} (${((flaggedCorrectly / oppsWithCompetitorSignals.length) * 100).toFixed(1)}%)`);
  console.log(`Correctly prioritized as hot/p1: ${priorityCorrectly}/${oppsWithCompetitorSignals.length} (${((priorityCorrectly / oppsWithCompetitorSignals.length) * 100).toFixed(1)}%)`);
  console.log(`Non-compliant: ${nonCompliant.length}`);

  // SUMMARY QUALITY
  console.log('\n--- SUMMARY QUALITY (why_now field) ---');
  let specific = 0;
  let generic = 0;
  let missing = 0;

  for (const opp of opportunities) {
    const whyNow = opp.fields.why_now || '';
    if (!whyNow.trim()) {
      missing++;
    } else if (whyNow.length < 50 || /generic|template|placeholder/i.test(whyNow)) {
      generic++;
    } else {
      specific++;
    }
  }

  console.log(`Specific summaries: ${specific} (${((specific / totalOpps) * 100).toFixed(1)}%)`);
  console.log(`Generic summaries: ${generic} (${((generic / totalOpps) * 100).toFixed(1)}%)`);
  console.log(`Missing summaries: ${missing} (${((missing / totalOpps) * 100).toFixed(1)}%)`);

  return {
    totalOpps,
    statusCounts,
    priorityCounts,
    forcesWithMultiple: forcesWithMultiple.length,
    competitorFlagCompliance: oppsWithCompetitorSignals.length > 0 ? ((flaggedCorrectly / oppsWithCompetitorSignals.length) * 100).toFixed(1) : 'N/A',
    competitorPriorityCompliance: oppsWithCompetitorSignals.length > 0 ? ((priorityCorrectly / oppsWithCompetitorSignals.length) * 100).toFixed(1) : 'N/A',
    nonCompliantOpps: nonCompliant,
    summaryQuality: { specific, generic, missing },
  };
}

function generateReport(signalAnalysis, oppAnalysis) {
  console.log('\n\n========================================');
  console.log('   MI PLATFORM DATA QUALITY AUDIT REPORT');
  console.log('========================================\n');

  // Calculate overall health score
  let score = 100;
  const penalties = [];

  // Field completion penalties
  const newFieldCompletion = signalAnalysis.fieldStats.role_type?.afterPct || '0';
  if (parseFloat(newFieldCompletion) < 90) {
    const penalty = (90 - parseFloat(newFieldCompletion)) / 2;
    score -= penalty;
    penalties.push(`New fields completion ${newFieldCompletion}% (-${penalty.toFixed(1)})`);
  }

  // False positive rate penalty
  const fpRate = signalAnalysis.relevantCount > 0 ? (signalAnalysis.falsePositives.length / signalAnalysis.relevantCount) * 100 : 0;
  if (fpRate > 10) {
    const penalty = Math.min((fpRate - 10) * 2, 30);
    score -= penalty;
    penalties.push(`False positive rate ${fpRate.toFixed(1)}% (-${penalty.toFixed(1)})`);
  }

  // Duplicate rate penalty
  const dupRate = signalAnalysis.totalSignals > 0 ? (signalAnalysis.duplicateExtIds / signalAnalysis.totalSignals) * 100 : 0;
  if (dupRate > 5) {
    const penalty = Math.min((dupRate - 5) * 2, 20);
    score -= penalty;
    penalties.push(`Duplicate rate ${dupRate.toFixed(1)}% (-${penalty.toFixed(1)})`);
  }

  // Competitor compliance penalty
  const complianceRate = parseFloat(oppAnalysis.competitorFlagCompliance) || 100;
  if (complianceRate < 100) {
    const penalty = (100 - complianceRate) / 5;
    score -= penalty;
    penalties.push(`Competitor compliance ${complianceRate}% (-${penalty.toFixed(1)})`);
  }

  // Multiple opps per force penalty
  if (oppAnalysis.forcesWithMultiple > 0) {
    const penalty = Math.min(oppAnalysis.forcesWithMultiple * 2, 15);
    score -= penalty;
    penalties.push(`Forces with multiple opps: ${oppAnalysis.forcesWithMultiple} (-${penalty.toFixed(1)})`);
  }

  score = Math.max(0, score);

  console.log(`OVERALL HEALTH SCORE: ${score.toFixed(0)}/100\n`);

  if (penalties.length > 0) {
    console.log('Score Penalties:');
    penalties.forEach(p => console.log(`  • ${p}`));
  }

  console.log('\n--- KEY METRICS ---\n');
  console.log(`| Metric | Value | Target | Status |`);
  console.log(`|--------|-------|--------|--------|`);
  console.log(`| Total Signals | ${signalAnalysis.totalSignals} | - | ℹ️ |`);
  console.log(`| Total Opportunities | ${oppAnalysis.totalOpps} | - | ℹ️ |`);
  console.log(`| New Fields Completion (post-21 Jan) | ${signalAnalysis.fieldStats.role_type?.afterPct || 0}% | 100% | ${parseFloat(signalAnalysis.fieldStats.role_type?.afterPct || '0') >= 90 ? '✅' : '❌'} |`);
  console.log(`| False Positive Rate | ${fpRate.toFixed(1)}% | <10% | ${fpRate < 10 ? '✅' : '❌'} |`);
  console.log(`| Duplicate Rate (by external_id) | ${dupRate.toFixed(1)}% | <5% | ${dupRate < 5 ? '✅' : '❌'} |`);
  console.log(`| Competitor Flag Compliance | ${oppAnalysis.competitorFlagCompliance}% | 100% | ${complianceRate >= 100 ? '✅' : '❌'} |`);
  console.log(`| Forces with Multiple Opps | ${oppAnalysis.forcesWithMultiple} | 0 | ${oppAnalysis.forcesWithMultiple === 0 ? '✅' : '❌'} |`);
  console.log(`| Orphaned Relevant Signals | ${signalAnalysis.orphanedSignals} | 0 | ${signalAnalysis.orphanedSignals === 0 ? '✅' : '⚠️'} |`);

  console.log('\n--- TOP 5 ISSUES ---\n');

  const issues = [];

  if (fpRate >= 10) {
    issues.push({ severity: 'HIGH', issue: `False positive rate at ${fpRate.toFixed(1)}%`, action: 'Review classification prompt and gate logic' });
  }

  if (dupRate >= 5) {
    issues.push({ severity: 'HIGH', issue: `Duplicate rate at ${dupRate.toFixed(1)}%`, action: 'Verify upsert logic in receivers' });
  }

  if (complianceRate < 100) {
    issues.push({ severity: 'HIGH', issue: `Competitor flag compliance at ${complianceRate}%`, action: 'Check WF4 competitor detection logic' });
  }

  if (oppAnalysis.forcesWithMultiple > 0) {
    issues.push({ severity: 'MEDIUM', issue: `${oppAnalysis.forcesWithMultiple} forces have multiple opportunities`, action: 'Run merge script or update WF4 upsert' });
  }

  if (signalAnalysis.orphanedSignals > 0) {
    issues.push({ severity: 'MEDIUM', issue: `${signalAnalysis.orphanedSignals} relevant signals without force link`, action: 'Review force matching patterns' });
  }

  if (parseFloat(signalAnalysis.fieldStats.role_type?.afterPct || '0') < 90) {
    issues.push({ severity: 'MEDIUM', issue: `New field completion at ${signalAnalysis.fieldStats.role_type?.afterPct}%`, action: 'Check WF3 classification output' });
  }

  issues.sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return order[a.severity] - order[b.severity];
  });

  issues.slice(0, 5).forEach((issue, i) => {
    console.log(`${i + 1}. [${issue.severity}] ${issue.issue}`);
    console.log(`   Action: ${issue.action}\n`);
  });

  if (issues.length === 0) {
    console.log('No critical issues detected! 🎉\n');
  }

  console.log('\n--- SAMPLE FALSE POSITIVES (First 10) ---\n');
  signalAnalysis.falsePositives.slice(0, 10).forEach((fp, i) => {
    console.log(`${i + 1}. ${fp.title}`);
    console.log(`   Company: ${fp.company || 'N/A'}`);
    console.log(`   Issues: ${fp.issues.map(i => i.type).join(', ')}`);
  });

  if (oppAnalysis.nonCompliantOpps.length > 0) {
    console.log('\n--- NON-COMPLIANT COMPETITOR OPPORTUNITIES ---\n');
    oppAnalysis.nonCompliantOpps.slice(0, 10).forEach((opp, i) => {
      console.log(`${i + 1}. ${opp.name}`);
      console.log(`   is_competitor_intercept: ${opp.is_competitor_intercept}`);
      console.log(`   priority_tier: ${opp.priority_tier}`);
    });
  }

  return { score, penalties, issues };
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node scripts/data-quality-audit.cjs <signals-file> <opportunities-file>');
    process.exit(1);
  }

  const signalsFile = args[0];
  const opportunitiesFile = args[1];

  console.log('Loading data files...');

  let signals, opportunities;

  try {
    const signalsData = JSON.parse(fs.readFileSync(signalsFile, 'utf-8'));
    signals = signalsData.records;
    console.log(`Loaded ${signals.length} signals`);
  } catch (e) {
    console.error(`Error loading signals file: ${e.message}`);
    process.exit(1);
  }

  try {
    const opportunitiesData = JSON.parse(fs.readFileSync(opportunitiesFile, 'utf-8'));
    opportunities = opportunitiesData.records;
    console.log(`Loaded ${opportunities.length} opportunities`);
  } catch (e) {
    console.error(`Error loading opportunities file: ${e.message}`);
    process.exit(1);
  }

  const signalAnalysis = analyzeSignals(signals);
  const oppAnalysis = analyzeOpportunities(opportunities, signals);
  const report = generateReport(signalAnalysis, oppAnalysis);

  // Save report to file
  const reportPath = path.join(__dirname, '..', 'docs', 'DATA-QUALITY-AUDIT.md');
  const reportContent = `# MI Platform Data Quality Audit Report

**Generated**: ${new Date().toISOString()}
**Overall Health Score**: ${report.score.toFixed(0)}/100

## Executive Summary

${report.penalties.length > 0 ? `### Score Penalties\n${report.penalties.map(p => `- ${p}`).join('\n')}` : 'No significant penalties.'}

## Key Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total Signals | ${signalAnalysis.totalSignals} | - | ℹ️ |
| Total Opportunities | ${oppAnalysis.totalOpps} | - | ℹ️ |
| Signals Before 21 Jan | ${signalAnalysis.beforeDeployment} | - | ℹ️ |
| Signals After 21 Jan | ${signalAnalysis.afterDeployment} | - | ℹ️ |
| False Positive Rate | ${signalAnalysis.relevantCount > 0 ? ((signalAnalysis.falsePositives.length / signalAnalysis.relevantCount) * 100).toFixed(1) : 0}% | <10% | ${signalAnalysis.relevantCount > 0 && (signalAnalysis.falsePositives.length / signalAnalysis.relevantCount) * 100 < 10 ? '✅' : '❌'} |
| Duplicate Rate | ${signalAnalysis.totalSignals > 0 ? ((signalAnalysis.duplicateExtIds / signalAnalysis.totalSignals) * 100).toFixed(1) : 0}% | <5% | ${signalAnalysis.totalSignals > 0 && (signalAnalysis.duplicateExtIds / signalAnalysis.totalSignals) * 100 < 5 ? '✅' : '❌'} |
| Competitor Flag Compliance | ${oppAnalysis.competitorFlagCompliance}% | 100% | ${parseFloat(oppAnalysis.competitorFlagCompliance || '0') >= 100 ? '✅' : '❌'} |

## Field Completion Analysis

### Signals Table

| Field | Total % | Before 21 Jan % | After 21 Jan % |
|-------|---------|-----------------|----------------|
${Object.entries(signalAnalysis.fieldStats).map(([field, stats]) => `| ${field} | ${stats.totalPct}% | ${stats.beforePct}% | ${stats.afterPct}% |`).join('\n')}

## Classification Quality

### Status Distribution
${Object.entries(signalAnalysis.statusCounts).map(([status, count]) => `- **${status}**: ${count}`).join('\n')}

### Type Distribution
${Object.entries(signalAnalysis.typeCounts).map(([type, count]) => `- **${type}**: ${count}`).join('\n')}

### False Positives Detected
- **Total potential false positives**: ${signalAnalysis.falsePositives.length}
- **Rate**: ${signalAnalysis.relevantCount > 0 ? ((signalAnalysis.falsePositives.length / signalAnalysis.relevantCount) * 100).toFixed(1) : 0}%

## Opportunity Quality

### Status Distribution
${Object.entries(oppAnalysis.statusCounts).map(([status, count]) => `- **${status}**: ${count}`).join('\n')}

### Priority Tier Distribution
${Object.entries(oppAnalysis.priorityCounts).map(([tier, count]) => `- **${tier}**: ${count}`).join('\n')}

### Competitor Flag Compliance
- **Correctly flagged**: ${oppAnalysis.competitorFlagCompliance}%
- **Correctly prioritized**: ${oppAnalysis.competitorPriorityCompliance}%

### Forces with Multiple Opportunities
- **Count**: ${oppAnalysis.forcesWithMultiple}

## Top Issues

${report.issues.map((issue, i) => `### ${i + 1}. [${issue.severity}] ${issue.issue}\n**Action**: ${issue.action}`).join('\n\n')}

---
*This report was auto-generated by the data quality audit script.*
`;

  fs.writeFileSync(reportPath, reportContent);
  console.log(`\nReport saved to: ${reportPath}`);
}

main().catch(console.error);
