/**
 * Simple Fuzzy Logic Engine for Mental Health Assessment
 * 
 * Rules:
 * - If Mood is Low (0-3) AND Sentiment is Negative -> Risk: HIGH
 * - If Mood is High (7-10) AND Sentiment is Positive -> Risk: LOW
 * - Else -> Risk: MODERATE
 */

const calculateWellnessScore = (moodScore, sentimentScore, energyLevel = 5) => {
    // Fuzzification
    const isMoodLow = moodScore <= 3;
    const isMoodHigh = moodScore >= 7;
    const isSentimentNeg = sentimentScore < -0.3;
    const isSentimentPos = sentimentScore > 0.3;

    let riskLevel = 'MODERATE';
    let label = 'Stable';

    // Fuzzy Rules Evaluation
    if (isMoodLow && isSentimentNeg) {
        riskLevel = 'HIGH';
        label = 'Needs Attention';
    } else if (isMoodHigh && isSentimentPos) {
        riskLevel = 'LOW';
        label = 'Thriving';
    } else if (moodScore < 5 && energyLevel < 4) {
        riskLevel = 'MODERATE-HIGH';
        label = 'Fatigued';
    }

    // Defuzzification (Simple weighted average for score)
    // Feature Engineering: Creating a composite "Vitality Score"
    const vitalityScore = (moodScore * 0.4) + ((sentimentScore + 1) * 5 * 0.4) + (energyLevel * 0.2);

    return {
        riskLevel,
        label,
        vitalityScore: Math.min(Math.max(vitalityScore, 0), 10).toFixed(1),
        features: {
            mood_contribution: (moodScore * 0.4).toFixed(2),
            sentiment_contribution: ((sentimentScore + 1) * 5 * 0.4).toFixed(2),
            energy_contribution: (energyLevel * 0.2).toFixed(2)
        }
    };
};

module.exports = { calculateWellnessScore };
