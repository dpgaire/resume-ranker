export interface OpenRouterResponse {
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

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY || '';
    if (!this.apiKey) {
      throw new Error('OpenRouter API key not found in environment variables');
    }
  }

  async analyzeMatch(jobDescription: string, resumeText: string): Promise<OpenRouterResponse> {
    const prompt = this.buildPrompt(jobDescription, resumeText);
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000',
          'X-Title': 'AI Resume Matcher',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4',
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
        console.error('OpenRouter API error:', response.status, errorText);
        throw new Error(`OpenRouter API request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenRouter API');
      }

      return this.parseResponse(content);
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      throw error;
    }
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

  private parseResponse(content: string): OpenRouterResponse {
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

      return parsed as OpenRouterResponse;
    } catch (error) {
      console.error('Error parsing OpenRouter response:', error);
      throw new Error('Failed to parse AI response. Please try again.');
    }
  }
}
