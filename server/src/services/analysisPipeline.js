/**
 * Analysis Pipeline Service
 * Orchestrates the full analysis flow from domain input to final report
 */

const { Domain } = require('../models');
const { generateQueriesWithAI, generateQueries, inferIndustry, analyzeCompanyWithAI } = require('./queryGenerator');
const { Prompt } = require('../models');
const { processDomainsPrompts, getResponsesForDomain } = require('./aiResponseService');
const { analyzeAllResponses, analyzeMentionSentiment, aggregateSentiment } = require('./responseAnalyzer');
const { calculateAndSaveScore, getScoreTrend, interpretScore } = require('./visibilityScorer');
const { generateAndSaveRecommendations } = require('./recommendationEngine');
const { Competitor } = require('../models');

/**
 * Run full analysis pipeline for a domain
 * @param {string} domainName - The domain/brand name to analyze
 * @param {object} options - Pipeline options including user-provided context
 * @returns {object} Complete analysis report
 */
async function runFullAnalysis(domainName, options = {}) {
  const { 
    industry, 
    queryOptions = {}, 
    useAIQueries = true,
    // Enhanced user context options
    targetAudience,
    mainUseCases,
    knownCompetitors,
    productDescription,
    region
  } = options;

  const report = {
    domain: null,
    companyAnalysis: null, // AI-detected industry, competitors, etc.
    queries: { count: 0, generated: [], aiEnhanced: false },
    aiResponses: { count: 0, successful: 0, failed: 0 },
    analysis: null,
    score: null,
    interpretation: null,
    trend: null,
    recommendations: [],
    topCompetitors: [],
    userContext: { targetAudience, mainUseCases, knownCompetitors, productDescription, region },
    timestamp: new Date().toISOString()
  };

  try {
    // Step 1: Create or find domain
    const resolvedIndustry = industry || inferIndustry(domainName);
    const domain = await Domain.findOrCreate(domainName, resolvedIndustry);
    report.domain = domain;

    // Step 2: Analyze company with AI to get industry, competitors, use cases
    // Pass user-provided context for better analysis
    let queries;
    let companyAnalysis = null;
    
    // Build enhanced query options with user context
    const enhancedQueryOptions = {
      ...queryOptions,
      targetAudience,
      mainUseCases,
      knownCompetitors,
      productDescription,
      region,
      queriesPerType: 3,
      maxTotalQueries: 35
    };
    
    if (useAIQueries) {
      console.log(`Running AI company analysis for ${domainName}...`);
      console.log(`User context:`, { targetAudience, mainUseCases, knownCompetitors, productDescription, region });
      
      // Pass user context to AI analysis
      companyAnalysis = await analyzeCompanyWithAI(domainName, {
        industry,
        targetAudience,
        mainUseCases: mainUseCases ? mainUseCases.split(',').map(s => s.trim()).filter(Boolean) : [],
        knownCompetitors: knownCompetitors ? knownCompetitors.split(',').map(s => s.trim()).filter(Boolean) : [],
        productDescription,
        region
      });
      report.companyAnalysis = companyAnalysis;
      
      if (companyAnalysis) {
        console.log(`AI detected industry: ${companyAnalysis.industry}`);
        console.log(`AI detected competitors: ${companyAnalysis.topCompetitors?.join(', ')}`);
        console.log(`AI detected use cases: ${companyAnalysis.mainUseCases?.join(', ')}`);
        
        // Update domain industry if AI detected one
        if (companyAnalysis.industry && companyAnalysis.industry !== resolvedIndustry) {
          await Domain.update(domain.id, { industry: companyAnalysis.industry });
          domain.industry = companyAnalysis.industry;
        }
      }
      
      // Generate queries using AI analysis and user context
      queries = await generateQueriesWithAI(domainName, resolvedIndustry, enhancedQueryOptions);
      report.queries.aiEnhanced = true;
    } else {
      queries = generateQueries(domainName, resolvedIndustry, enhancedQueryOptions);
      report.queries.aiEnhanced = false;
    }
    
    // Save queries to database
    for (const query of queries) {
      await Prompt.create(domain.id, query.queryText, query.queryType);
    }
    report.queries.count = queries.length;
    report.queries.generated = queries;

    // Step 3: Run AI queries
    const aiResults = await processDomainsPrompts(domain.id);
    report.aiResponses = {
      promptsTotal: aiResults.total,
      promptsSuccessful: aiResults.successful,
      promptsFailed: aiResults.failed,
      totalResponses: aiResults.totalResponses // Actual responses stored (excludes failed)
    };

    // Step 4: Get stored responses and analyze (only successful responses)
    const responses = await getResponsesForDomain(domain.id);
    const analysisResults = await analyzeAllResponses(responses, domainName) || {
      totalResponses: 0,
      responsesWithTarget: 0,
      totalMentions: 0,
      top1Count: 0,
      top3Count: 0,
      analyses: []
    };
    
    // Perform sentiment analysis
    const sentimentResults = responses.map(r => analyzeMentionSentiment(r.response_text, domainName));
    const sentiment = aggregateSentiment(sentimentResults);
    analysisResults.sentiment = sentiment;
    
    report.analysis = {
      totalResponses: analysisResults.totalResponses || 0,
      responsesWithTarget: analysisResults.responsesWithTarget || 0,
      totalMentions: analysisResults.totalMentions || 0,
      top1Count: analysisResults.top1Count || 0,
      top3Count: analysisResults.top3Count || 0
    };

    // Step 5: Calculate and save visibility score
    const scoreData = await calculateAndSaveScore(domain.id, analysisResults);
    report.score = scoreData;
    report.interpretation = interpretScore(scoreData.score);

    // Step 6: Get score trend
    const trend = await getScoreTrend(domain.id);
    report.trend = trend;

    // Step 7: Generate recommendations (standard + AI-generated)
    const recommendationResults = await generateAndSaveRecommendations(
      domain.id,
      scoreData.id,
      analysisResults,
      scoreData,
      trend,
      domainName // Pass brand name for AI recommendations
    );
    report.recommendations = recommendationResults.standard;
    report.aiRecommendations = recommendationResults.aiGenerated;

    // Step 8: Get top competitors
    const topCompetitors = await Competitor.getTopCompetitors(domain.id, 5);
    report.topCompetitors = topCompetitors;

    return { success: true, report };

  } catch (error) {
    console.error('Pipeline error:', error);
    return { 
      success: false, 
      error: error.message,
      report 
    };
  }
}

/**
 * Get existing analysis report for a domain
 * @param {number} domainId - The domain ID
 * @returns {object} Existing analysis data
 */
async function getExistingReport(domainId) {
  const domain = await Domain.findById(domainId);
  if (!domain) {
    throw new Error('Domain not found');
  }

  const responses = await getResponsesForDomain(domainId);
  const { VisibilityScore, Recommendation } = require('../models');
  
  const latestScore = await VisibilityScore.findLatest(domainId);
  const trend = await getScoreTrend(domainId);
  const recommendations = await Recommendation.findByDomainId(domainId);
  const topCompetitors = await Competitor.getTopCompetitors(domainId, 5);

  return {
    domain,
    responsesCount: responses.length,
    score: latestScore,
    interpretation: latestScore ? interpretScore(parseFloat(latestScore.score)) : null,
    trend,
    recommendations,
    topCompetitors
  };
}

module.exports = {
  runFullAnalysis,
  getExistingReport
};
