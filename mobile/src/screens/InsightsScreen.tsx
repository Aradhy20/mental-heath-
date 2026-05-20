import React, { useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import {
  Card, Text, ActivityIndicator as PaperLoader, 
  ProgressBar, List, useTheme 
} from 'react-native-paper'
import { insightsAPI, wearablesAPI } from '../services/api'
import { COLORS, FONTS, RADIUS, SPACING } from '../theme/tokens'

const EMOTION_COLORS: Record<string, string> = {
  joy: '#FBC02D', sadness: '#1976D2', anger: '#D32F2F',
  fear: '#F57C00', neutral: '#757575',
}

export default function InsightsScreen() {
  const [data,    setData]    = useState<any>(null)
  const [wearableData, setWearableData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    Promise.all([
      insightsAPI.get(),
      wearablesAPI.getLatest().catch(() => null)
    ])
      .then(([insightsRes, wearableRes]) => {
        setData(insightsRes)
        setWearableData(wearableRes)
      })
      .catch((e) => setError(e?.message ?? 'Could not load insights.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <View style={styles.center}>
        <PaperLoader color={COLORS.primary} size="large" />
        <Text variant="bodyLarge" style={styles.loadingText}>Analysing your data...</Text>
      </View>
    )
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorEmoji}>📊</Text>
        <Text variant="headlineSmall" style={styles.errorTitle}>No Insights Yet</Text>
        <Text variant="bodyMedium" style={styles.errorSub}>{error || 'Log your mood and chat with the AI therapist to generate insights.'}</Text>
      </View>
    )
  }

  const { weekly_summary, emotion_breakdown, risk_assessment, recommendations, mood_history } = data
  const riskColor = risk_assessment?.level === 'safe' ? '#2E7D32' : risk_assessment?.level === 'moderate' ? '#EF6C00' : '#C62828'

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text variant="headlineMedium" style={styles.title}>Health Ecosystem</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>AI insights combining your mental & physical data</Text>

      {/* WEARABLE HEALTH DATA */}
      <Card style={{ marginBottom: SPACING.xl, backgroundColor: COLORS.surface }}>
        <Card.Title 
          title="Apple Health / Wearables" 
          titleStyle={{ color: '#2E7D32', fontSize: 14, fontWeight: 'bold' }} 
        />
        <Card.Content>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>{wearableData?.heart_rate ?? '–'}</Text>
              <Text variant="labelSmall">BPM</Text>
            </View>
            <View style={[styles.summaryItem, styles.summaryMiddle]}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>{wearableData?.sleep_hours ? `${wearableData.sleep_hours}h` : '–'}</Text>
              <Text variant="labelSmall">Sleep</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{wearableData?.activity_level ?? '–'}</Text>
              <Text variant="labelSmall">Activity</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Weekly Summary */}
      <Card style={{ marginBottom: SPACING.xl, backgroundColor: COLORS.surface }}>
        <Card.Title title="Weekly Summary" titleStyle={{ fontSize: 14, fontWeight: 'bold' }} />
        <Card.Content>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>{weekly_summary?.avg_mood ? `${(weekly_summary.avg_mood * 10).toFixed(0)}%` : '–'}</Text>
              <Text variant="labelSmall">Avg Mood</Text>
            </View>
            <View style={[styles.summaryItem, styles.summaryMiddle]}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{weekly_summary?.dominant_emotion ?? '–'}</Text>
              <Text variant="labelSmall">Emotion</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: riskColor, textTransform: 'capitalize' }}>{risk_assessment?.level ?? '–'}</Text>
              <Text variant="labelSmall">Risk</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Emotion Breakdown */}
      {emotion_breakdown?.length > 0 && (
        <Card style={{ marginBottom: SPACING.xl, backgroundColor: COLORS.surface }}>
          <Card.Title title="Emotion Breakdown" titleStyle={{ fontSize: 14, fontWeight: 'bold' }} />
          <Card.Content>
            {emotion_breakdown.map((e: any) => (
              <View key={e.emotion} style={styles.emotionRow}>
                <Text variant="labelMedium" style={{ width: 80 }}>{e.emotion}</Text>
                <ProgressBar progress={e.percentage / 100} color={EMOTION_COLORS[e.emotion] ?? COLORS.primary} style={styles.progressBar} />
                <Text variant="labelSmall" style={{ width: 40, textAlign: 'right' }}>{e.percentage}%</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations?.length > 0 && (
        <Card style={{ marginBottom: SPACING.xl, backgroundColor: COLORS.surface }}>
          <Card.Title title="AI Recommendations" titleStyle={{ fontSize: 14, fontWeight: 'bold' }} />
          <Card.Content>
            {recommendations.map((r: string, i: number) => (
              <List.Item
                key={i}
                title={r}
                titleNumberOfLines={3}
                left={(props: any) => <List.Icon {...props} icon="lightbulb" color={COLORS.primary} />}
              />
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.background },
  content:         { padding: SPACING['2xl'], paddingBottom: SPACING['4xl'] },
  center:          { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: SPACING['3xl'] },
  loadingText:     { color: COLORS.textMuted, marginTop: SPACING.md, fontWeight: FONTS.medium },
  errorEmoji:      { fontSize: 64, marginBottom: SPACING.xl },
  errorTitle:      { color: COLORS.text, fontSize: 22, fontWeight: FONTS.black, marginBottom: SPACING.sm },
  errorSub:        { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  title:           { fontWeight: 'bold', marginBottom: 4 },
  subtitle:        { color: COLORS.textMuted, marginBottom: SPACING['2xl'] },
  summaryRow:      { flexDirection: 'row', marginTop: SPACING.md },
  summaryItem:     { flex: 1, alignItems: 'center' },
  summaryMiddle:   { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border },
  emotionRow:      { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  progressBar:     { flex: 1, height: 8, borderRadius: 4 },
})
