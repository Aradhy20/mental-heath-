import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, TextInput,
} from 'react-native'
import { moodAPI } from '../services/api'
import { COLORS, FONTS, RADIUS, SPACING } from '../theme/tokens'
import { GlassCard } from '../components/GlassCard'
import { PrimaryButton } from '../components/PrimaryButton'

const MOOD_LABELS = ['', 'Very Bad', 'Bad', 'Low', 'Below Avg', 'Average', 'OK', 'Good', 'Very Good', 'Great', 'Excellent']

export default function MoodScreen() {
  const [score,   setScore]   = useState(5)
  const [energy,  setEnergy]  = useState(5)
  const [sleep,   setSleep]   = useState(7)
  const [notes,   setNotes]   = useState('')
  const [loading, setLoading] = useState(false)
  const [saved,   setSaved]   = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await moodAPI.log({ score, energy, sleep_hours: sleep, notes: notes.trim() || undefined })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setNotes('')
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not save mood log.')
    } finally {
      setLoading(false)
    }
  }

  const ScoreSelector = ({
    label, value, max = 10, onChange, color = COLORS.primary,
  }: { label: string; value: number; max?: number; onChange: (v: number) => void; color?: string }) => (
    <View style={styles.selectorWrap}>
      <View style={styles.selectorHeader}>
        <Text style={styles.selectorLabel}>{label}</Text>
        <Text style={[styles.selectorValue, { color }]}>{value} / {max}</Text>
      </View>
      <View style={styles.dotsRow}>
        {Array.from({ length: max }, (_, i) => i + 1).map((v) => (
          <TouchableOpacity
            key={v}
            onPress={() => onChange(v)}
            style={[
              styles.dot,
              { backgroundColor: v <= value ? color : COLORS.border },
            ]}
            activeOpacity={0.7}
          />
        ))}
      </View>
    </View>
  )

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Mood Check-in</Text>
      <Text style={styles.subtitle}>How are you feeling right now?</Text>

      {/* Mood Score */}
      <GlassCard style={{ marginBottom: SPACING.xl }}>
        <View style={styles.moodDisplay}>
          <Text style={styles.moodEmoji}>
            {score <= 3 ? '😢' : score <= 5 ? '😐' : score <= 7 ? '🙂' : '😊'}
          </Text>
          <Text style={styles.moodText}>{MOOD_LABELS[score]}</Text>
        </View>
        <ScoreSelector label="Mood Score" value={score} onChange={setScore} color={COLORS.primary} />
        <ScoreSelector label="Energy Level" value={energy} onChange={setEnergy} color={COLORS.cyan} />
        <ScoreSelector label="Sleep (hours)" value={sleep} max={12} onChange={setSleep} color={COLORS.emerald} />
      </GlassCard>

      {/* Notes */}
      <GlassCard style={{ marginBottom: SPACING.xl }}>
        <Text style={styles.notesLabel}>Notes (optional)</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Anything on your mind?"
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={4}
          maxLength={500}
        />
      </GlassCard>

      {saved && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✅ Mood logged successfully!</Text>
        </View>
      )}

      <PrimaryButton
        title="Log Mood →"
        loading={loading}
        onPress={handleSubmit}
        disabled={loading}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.background },
  content:        { padding: SPACING['2xl'], paddingBottom: SPACING['4xl'] },
  title:          { color: COLORS.text, fontSize: 28, fontWeight: FONTS.black, letterSpacing: -0.5, marginBottom: 4 },
  subtitle:       { color: COLORS.textMuted, fontSize: 14, fontWeight: FONTS.medium, marginBottom: SPACING['2xl'] },
  card:           { backgroundColor: COLORS.surface, borderRadius: RADIUS['2xl'], padding: SPACING['2xl'], borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl },
  moodDisplay:    { alignItems: 'center', marginBottom: SPACING['2xl'] },
  moodEmoji:      { fontSize: 64, marginBottom: SPACING.sm },
  moodText:       { color: COLORS.text, fontSize: 20, fontWeight: FONTS.black },
  selectorWrap:   { marginBottom: SPACING.xl },
  selectorHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  selectorLabel:  { color: COLORS.textSecond, fontSize: 12, fontWeight: FONTS.black, textTransform: 'uppercase', letterSpacing: 1 },
  selectorValue:  { fontSize: 13, fontWeight: FONTS.black },
  dotsRow:        { flexDirection: 'row', gap: 6 },
  dot:            { flex: 1, height: 8, borderRadius: RADIUS.full },
  notesLabel:     { color: COLORS.textSecond, fontSize: 12, fontWeight: FONTS.black, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.md },
  notesInput:     { color: COLORS.text, fontSize: 14, fontWeight: FONTS.medium, minHeight: 100, textAlignVertical: 'top' },
  successBanner:  { backgroundColor: 'rgba(52,211,153,0.1)', borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: 'rgba(52,211,153,0.2)', marginBottom: SPACING.md },
  successText:    { color: COLORS.emerald, fontWeight: FONTS.bold, textAlign: 'center' },
  submitBtn:      { backgroundColor: COLORS.primary, borderRadius: RADIUS['2xl'], padding: SPACING.xl, alignItems: 'center', shadowColor: COLORS.primary, shadowOpacity: 0.35, shadowRadius: 20, shadowOffset: { width: 0, height: 6 } },
  submitDisabled: { opacity: 0.6 },
  submitText:     { color: '#fff', fontWeight: FONTS.black, fontSize: 16, letterSpacing: 0.5 },
})
