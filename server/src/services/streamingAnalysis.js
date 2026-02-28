/**
 * Streaming Analysis Service
 * Provides real-time updates via Server-Sent Events during analysis
 */

const { Domain } = require('../models');
const { generateQueriesWithAI, generateQueries, inferIndustry, analyzeCompanyWithAI } = require('./queryGenerator');
const { Prompt } = require('../models');
const { askAllProviders } = require('./aiClient');
const { AIResponse } = require('../models');
const { analyzeAllResponses } = require('./responseAnalyzer');
const { calculateAndSaveScore, getScoreTrend, interpretScore } = require('./visibilityScorer');
const { generateAndSaveRecommendations } = require('./recommendationEngine');
const { Competitor } = require('../models');

/**
 * Run streaming analysis - sends real-time updates via SSE
 * @param {string} domainName - The domain/brand to analyze
 * @param {object} options - Analysis options
 * @param {function} sendEvent - Function to send SSE events
 */
async function runStreamingAnalysis(domainName, options, sendEvent) {
  const { 
    industry, 
    targetAudience,
    mainUseCases,
    knownCompetitors,
    productDescription,
    region
  } = options;

  const report = {
    domain: null,
    companyAnalysis: null,
    queries: { count: 0, generated: [], aiEnhanced: false },
    aiResponses: { count: 0, successful: 0, failed: 0 },
    analysis: null,
    score: null,
    interpretation: null,
    trend: null,
    recommendations: [],
    topCompetitors: [],
    timestamp: new Date().toISOString()
  };

  try {
    // Step 1: Create or find domain
    sendEvent('status', { phase: 'init', message: 'Setting up analysis...' });
    
    const resolvedIndustry = industry || inferIndustry(domainName);
    const domain = await Domain.findOrCreate(domainName, resolvedIndustry);
    report.domain = domain;

    // Step 2: Analyze company with AI
    sendEvent('status', { phase: 'analyzing', message: `Analyzing ${domainName} to understand industry and competitors...` });
    
    const userContext = {
      industry,
      targetAudience,
      mainUseCases: mainUseCases ? mainUseCases.split(',').map(s => s.trim()).filter(Boolean) : [],
      knownCompetitors: knownCompetitors ? knownCompetitors.split(',').map(s => s.trim()).filter(Boolean) : [],
      productDescription,
      region
    };

    const companyAnalysis = await analyzeCompanyWithAI(domainName, userContext);
    report.companyAnalysis = companyAnalysis;

    if (companyAnalysis) {
      sendEvent('analysis', { 
        industry: companyAnalysis.industry,
        competitors: companyAnalysis.topCompetitors?.slice(0, 5),
        useCases: companyAnalysis.mainUseCases?.slice(0, 5)
      });
      
      if (companyAnalysis.industry && companyAnalysis.industry !== resolvedIndustry) {
        await Domain.update(domain.id, { industry: companyAnalysis.industry });
        domain.industry = companyAnalysis.industry;
      }
    }

    // Step 3: Generate queries
    sendEvent('status', { phase: 'generating', message: 'Generating test queries...' });
    
    const enhancedOptions = {
      targetAudience,
      mainUseCases,
      knownCompetitors,
      productDescription,
      region,
      queriesPerType: 3,
      maxTotalQueries: 40
    };

    const queries = await generateQueriesWithAI(domainName, resolvedIndustry, enhancedOptions);
    report.queries.count = queries.length;
    report.queries.generated = queries;
    report.queries.aiEnhanced = true;

    sendEvent('queries', { 
      total: queries.length,
      samples: queries.slice(0, 5).map(q => q.queryText)
    });

    // Save queries to database
    for (const query of queries) {
      await Prompt.create(domain.id, query.queryText, query.queryType);
    }

    // Step 4: Process each query and stream results
    sendEvent('status', { phase: 'querying', message: `Running ${queries.length} queries against AI providers...` });

    const prompts = await Prompt.findByDomainId(domain.id);
    let successfulPrompts = 0;
    let failedPrompts = 0;
    let totalResponses = 0;

    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      
      // Send the query being asked
      sendEvent('query', {
        index: i + 1,
        total: prompts.length,
        question: prompt.query_text,
        status: 'asking'
      });

      try {
        // Query AI providers
        const results = await askAllProviders(prompt.query_text);
        
        // Store successful responses
        let responsesStored = 0;
        for (const result of results) {
          if (result.success) {
            await AIResponse.create(
              prompt.id,
              result.provider,
              result.responseText,
              result.responseTimeMs
            );
            responsesStored++;
            totalResponses++;

            // Send the response preview
            const preview = result.responseText.substring(0, 300) + (result.responseText.length > 300 ? '...' : '');
            const mentioned = result.responseText.toLowerCase().includes(domainName.toLowerCase());
            
            sendEvent('response', {
              index: i + 1,
              total: prompts.length,
              question: prompt.query_text,
              provider: result.provider,
              preview: preview,
              mentioned: mentioned,
              responseTime: result.responseTimeMs
            });
          }
        }

        if (responsesStored > 0) {
          successfulPrompts++;
        } else {
          failedPrompts++;
        }
      } catch (error) {
        failedPrompts++;
        sendEvent('query', {
          index: i + 1,
          total: prompts.length,
          question: prompt.query_text,
          status: 'failed',
          error: error.message
        });
      }

      // Small delay between queries
      if (i < prompts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    report.aiResponses = {
      promptsTotal: prompts.length,
      promptsSuccessful: successfulPrompts,
      promptsFailed: failedPrompts,
      totalResponses
    };

    // Step 5: Analyze responses
    sendEvent('status', { phase: 'scoring', message: 'Analyzing responses and calculating score...' });

    const { getResponsesForDomain } = require('./aiResponseService');
    const responses = await getResponsesForDomain(domain.id);
    const analysisResults = await analyzeAllResponses(responses, domainName) || {
      totalResponses: 0,
      responsesWithTarget: 0,
      totalMentions: 0,
      top1Count: 0,
      top3Count: 0,
      analyses: []
    };
    
    report.analysis = {
      totalResponses: analysisResults.totalResponses || 0,
      responsesWithTarget: analysisResults.responsesWithTarget || 0,
      totalMentions: analysisResults.totalMentions || 0,
      top1Count: analysisResults.top1Count || 0,
      top3Count: analysisResults.top3Count || 0
    };

    // Step 6: Calculate score
    const scoreData = await calculateAndSaveScore(domain.id, analysisResults);
    report.score = scoreData;
    report.interpretation = interpretScore(scoreData.score);

    sendEvent('score', {
      score: scoreData.score,
      interpretation: report.interpretation
    });

    // Step 7: Get trend
    const trend = await getScoreTrend(domain.id);
    report.trend = trend;

    // Step 8: Generate recommendations
    sendEvent('status', { phase: 'recommendations', message: 'Generating recommendations...' });

    const recommendationResults = await generateAndSaveRecommendations(
      domain.id,
      scoreData.id,
      analysisResults,
      scoreData,
      trend,
      domainName
    );
    report.recommendations = recommendationResults.standard;
    report.aiRecommendations = recommendationResults.aiGenerated;

    // Step 9: Get competitors
    const topCompetitors = await Competitor.getTopCompetitors(domain.id, 5);
    report.topCompetitors = topCompetitors;

    // Send final complete report
    sendEvent('complete', { report });

    return { success: true, report };

  } catch (error) {
    console.error('Streaming analysis error:', error);
    sendEvent('error', { message: error.message });
    return { success: false, error: error.message, report };
  }
}

module.exports = { runStreamingAnalysis };
