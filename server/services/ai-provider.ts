import { OpenRouterClient } from './openrouter-client';

export interface AIAnalysisResponse {
  matchScore: number;
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
  keywordMatch: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  summary: string;
}

export interface AIProviderConfig {
  openaiKey?: string;
  openrouterKey?: string;
  claudeKey?: string;
  preferredProvider: 'openai' | 'openrouter' | 'claude';
}

export class AIProvider {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  async analyzeMatch(jobDescription: string, resumeText: string): Promise<AIAnalysisResponse> {
    const provider = this.config.preferredProvider;

    try {
      switch (provider) {
        case 'openrouter':
          return await this.useOpenRouter(jobDescription, resumeText);
        case 'openai':
          return await this.useOpenAI(jobDescription, resumeText);
        case 'claude':
          return await this.useClaude(jobDescription, resumeText);
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`AI provider ${provider} failed:`, error);
      throw error;
    }
  }

  private async useOpenRouter(jobDescription: string, resumeText: string): Promise<AIAnalysisResponse> {
    if (!this.config.openrouterKey) {
      throw new Error('OpenRouter API key not configured');
    }

    // Create a temporary OpenRouter client with the provided key
    const originalKey = process.env.OPENROUTER_API_KEY;
    process.env.OPENROUTER_API_KEY = this.config.openrouterKey;
    
    try {
      const client = new OpenRouterClient();
      return await client.analyzeMatch(jobDescription, resumeText);
    } finally {
      // Restore original key
      if (originalKey) {
        process.env.OPENROUTER_API_KEY = originalKey;
      } else {
        delete process.env.OPENROUTER_API_KEY;
      }
    }
  }

  private async useOpenAI(jobDescription: string, resumeText: string): Promise<AIAnalysisResponse> {
    if (!this.config.openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = this.buildPrompt(jobDescription, resumeText);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR professional and resume analyst. Analyze the match between a resume and job description with precision and provide actionable insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI API');
    }

    return this.parseResponse(content);
  }

  private async useClaude(jobDescription: string, resumeText: string): Promise<AIAnalysisResponse> {
    if (!this.config.claudeKey) {
      throw new Error('Claude API key not configured');
    }

    const prompt = this.buildPrompt(jobDescription, resumeText);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.claudeKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      throw new Error(`Claude API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text;
    
    if (!content) {
      throw new Error('No content received from Claude API');
    }

    return this.parseResponse(content);
  }

  private buildPrompt(jobDescription: string, resumeText: string): string {
    return `Please analyze how well this resume matches the given job description. Provide a detailed analysis in the following JSON format:

{
  "matchScore": <overall score 0-100>,
  "skillMatch": <skills alignment score 0-100>,
  "experienceMatch": <experience alignment score 0-100>,
  "educationMatch": <education alignment score 0-100>,
  "keywordMatch": <keyword coverage score 0-100>,
  "strengths": [<array of 2-4 key strengths where resume aligns well>],
  "improvements": [<array of 2-3 areas that could be improved or highlighted better>],
  "recommendations": [<array of 3-4 specific actionable recommendations>],
  "summary": "<brief 2-3 sentence overall assessment>"
}

Job Description:
${jobDescription}

Resume:
${resumeText}

Analyze the alignment considering:
1. Required skills vs candidate skills
2. Experience level and domain match
3. Education requirements
4. Key responsibilities alignment
5. Industry knowledge and terminology

Provide specific, actionable insights that would help improve the match score.`;
  }

  private parseResponse(content: string): AIAnalysisResponse {
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      const required = ['matchScore', 'skillMatch', 'experienceMatch', 'educationMatch', 'keywordMatch', 'strengths', 'improvements', 'recommendations', 'summary'];
      for (const field of required) {
        if (parsed[field] === undefined) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Ensure scores are within valid range
      const scores = ['matchScore', 'skillMatch', 'experienceMatch', 'educationMatch', 'keywordMatch'];
      for (const score of scores) {
        parsed[score] = Math.max(0, Math.min(100, Number(parsed[score]) || 0));
      }

      // Ensure arrays are arrays
      const arrays = ['strengths', 'improvements', 'recommendations'];
      for (const arr of arrays) {
        if (!Array.isArray(parsed[arr])) {
          parsed[arr] = [];
        }
      }

      return parsed as AIAnalysisResponse;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }
}