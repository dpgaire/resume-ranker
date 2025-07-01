export class TextSimilarityAnalyzer {
  static analyzeMatch(jobDescription: string, resumeText: string): {
    matchScore: number;
    skillMatch: number;
    experienceMatch: number;
    educationMatch: number;
    keywordMatch: number;
    strengths: string[];
    improvements: string[];
    recommendations: string[];
    summary: string;
  } {
    const jobTokens = this.tokenize(jobDescription.toLowerCase());
    const resumeTokens = this.tokenize(resumeText.toLowerCase());

    // Extract key terms and calculate matches
    const skillKeywords = this.extractSkillKeywords(jobDescription);
    const experienceKeywords = this.extractExperienceKeywords(jobDescription);
    const educationKeywords = this.extractEducationKeywords(jobDescription);

    const skillMatch = this.calculateKeywordMatch(skillKeywords, resumeText);
    const experienceMatch = this.calculateExperienceMatch(jobDescription, resumeText);
    const educationMatch = this.calculateEducationMatch(jobDescription, resumeText);
    const keywordMatch = this.calculateOverallKeywordMatch(jobTokens, resumeTokens);

    const matchScore = Math.round(
      (skillMatch * 0.4 + experienceMatch * 0.3 + educationMatch * 0.15 + keywordMatch * 0.15)
    );

    return {
      matchScore,
      skillMatch,
      experienceMatch,
      educationMatch,
      keywordMatch,
      strengths: this.generateStrengths(skillMatch, experienceMatch, educationMatch),
      improvements: this.generateImprovements(skillMatch, experienceMatch, educationMatch),
      recommendations: this.generateRecommendations(jobDescription, resumeText),
      summary: this.generateSummary(matchScore, skillMatch, experienceMatch),
    };
  }

  private static tokenize(text: string): string[] {
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  private static extractSkillKeywords(jobDescription: string): string[] {
    const skillPatterns = [
      /(?:experience with|proficient in|knowledge of|skills in|familiar with)\s+([^.;,]+)/gi,
      /(?:javascript|python|java|react|node\.js|html|css|sql|aws|docker|kubernetes|git)/gi,
      /(?:typescript|vue|angular|mongodb|postgresql|redis|microservices|api|rest|graphql)/gi,
    ];

    const skills = new Set<string>();
    skillPatterns.forEach(pattern => {
      const matches = jobDescription.match(pattern);
      if (matches) {
        matches.forEach(match => skills.add(match.toLowerCase()));
      }
    });

    return Array.from(skills);
  }

  private static extractExperienceKeywords(jobDescription: string): string[] {
    const expPatterns = [
      /(\d+)\s*\+?\s*years?\s+(?:of\s+)?experience/gi,
      /senior|junior|lead|principal|architect|manager/gi,
    ];

    const keywords = new Set<string>();
    expPatterns.forEach(pattern => {
      const matches = jobDescription.match(pattern);
      if (matches) {
        matches.forEach(match => keywords.add(match.toLowerCase()));
      }
    });

    return Array.from(keywords);
  }

  private static extractEducationKeywords(jobDescription: string): string[] {
    const eduPatterns = [
      /bachelor|master|phd|degree|computer science|engineering|mathematics/gi,
    ];

    const keywords = new Set<string>();
    eduPatterns.forEach(pattern => {
      const matches = jobDescription.match(pattern);
      if (matches) {
        matches.forEach(match => keywords.add(match.toLowerCase()));
      }
    });

    return Array.from(keywords);
  }

  private static calculateKeywordMatch(keywords: string[], text: string): number {
    if (keywords.length === 0) return 70;

    const lowerText = text.toLowerCase();
    const matchedKeywords = keywords.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );

    return Math.round((matchedKeywords.length / keywords.length) * 100);
  }

  private static calculateExperienceMatch(jobDesc: string, resume: string): number {
    const jobYearsMatch = jobDesc.match(/(\d+)\s*\+?\s*years/i);
    const resumeYearsMatch = resume.match(/(\d+)\s*\+?\s*years/i);

    if (!jobYearsMatch) return 75;

    const requiredYears = parseInt(jobYearsMatch[1]);
    const candidateYears = resumeYearsMatch ? parseInt(resumeYearsMatch[1]) : 0;

    if (candidateYears >= requiredYears) return 95;
    if (candidateYears >= requiredYears * 0.7) return 80;
    if (candidateYears >= requiredYears * 0.5) return 60;
    return 40;
  }

  private static calculateEducationMatch(jobDesc: string, resume: string): number {
    const eduRequirements = ['bachelor', 'master', 'phd', 'degree'];
    const jobEdu = eduRequirements.find(req => 
      jobDesc.toLowerCase().includes(req)
    );

    if (!jobEdu) return 80;

    return resume.toLowerCase().includes(jobEdu) ? 90 : 50;
  }

  private static calculateOverallKeywordMatch(jobTokens: string[], resumeTokens: string[]): number {
    const jobSet = new Set(jobTokens);
    const resumeSet = new Set(resumeTokens);
    
    const intersection = new Set([...jobSet].filter(x => resumeSet.has(x)));
    const union = new Set([...jobSet, ...resumeSet]);

    return Math.round((intersection.size / union.size) * 100);
  }

  private static generateStrengths(skill: number, exp: number, edu: number): string[] {
    const strengths = [];
    
    if (skill >= 80) strengths.push("Strong technical skills alignment with job requirements");
    if (exp >= 80) strengths.push("Experience level matches job expectations well");
    if (edu >= 80) strengths.push("Educational background aligns with position requirements");
    if (strengths.length === 0) strengths.push("Resume shows relevant background for the position");

    return strengths;
  }

  private static generateImprovements(skill: number, exp: number, edu: number): string[] {
    const improvements = [];
    
    if (skill < 70) improvements.push("Consider highlighting more technical skills mentioned in the job description");
    if (exp < 70) improvements.push("Emphasize relevant experience and quantify achievements");
    if (edu < 70) improvements.push("Consider adding relevant certifications or continuing education");
    
    return improvements;
  }

  private static generateRecommendations(jobDesc: string, resume: string): string[] {
    return [
      "Use keywords from the job description throughout your resume",
      "Quantify your achievements with specific metrics and results",
      "Tailor your summary to highlight the most relevant experience",
      "Include specific technologies and methodologies mentioned in the job posting"
    ];
  }

  private static generateSummary(match: number, skill: number, exp: number): string {
    if (match >= 80) {
      return "Excellent match! Your resume aligns very well with the job requirements.";
    } else if (match >= 60) {
      return "Good match with some areas for improvement to strengthen your application.";
    } else {
      return "Moderate match. Consider tailoring your resume to better highlight relevant experience.";
    }
  }
}
