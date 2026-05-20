import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native'
import { journalAPI } from '../services/api'
import { COLORS, FONTS, RADIUS, SPACING } from '../theme/tokens'
import { GlassCard } from '../components/GlassCard'
import { PrimaryButton } from '../components/PrimaryButton'

const MOOD_TAGS = ['😊 Happy', '😔 Sad', '😰 Anxious', '😤 Angry', '😌 Calm', '🤔 Reflective']

export default function JournalScreen() {
  const [entries,  setEntries]  = useState<any[]>([])
  const [content,  setContent]  = useState('')
  const [moodTag,  setMoodTag]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [fetching, setFetching] = useState(true)
  const [mode,     setMode]     = useState<'list' | 'write'>('list')

  const fetchEntries = async () => {
    setFetching(true)
    try { setEntries(await journalAPI.list()) } catch {}
    finally { setFetching(false) }
  }

  useEffect(() => { fetchEntries() }, [])

  const handleSave = async () => {
    if (!content.trim()) { Alert.alert('Error', 'Please write something first.'); return }
    setLoading(true)
    try {
      await journalAPI.create({ content: content.trim(), mood_tag: moodTag || undefined })
      setContent(''); setMoodTag(''); setMode('list')
      fetchEntries()
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not save entry.')
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'write') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setMode('list')}>
              <Text style={styles.backBtn}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>New Entry</Text>
            <TouchableOpacity onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color={COLORS.primary} /> : <Text style={styles.saveBtn}>Save</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.dateRow}>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>

          <TextInput
            style={styles.writeInput}
            value={content}
            onChangeText={setContent}
            placeholder="What's on your mind today?"
            placeholderTextColor={COLORS.textMuted}
            multiline
            autoFocus
            textAlignVertical="top"
          />

          <View style={styles.tagsRow}>
            <Text style={styles.tagsLabel}>Mood Tag</Text>
            <View style={styles.tags}>
              {MOOD_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tag, moodTag === tag && styles.tagActive]}
                  onPress={() => setMoodTag(moodTag === tag ? '' : tag)}
                >
                  <Text style={[styles.tagText, moodTag === tag && styles.tagTextActive]}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journal</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => setMode('write')}>
          <Text style={styles.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {fetching
        ? <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        : entries.length === 0
          ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>📖</Text>
              <Text style={styles.emptyTitle}>No entries yet</Text>
              <Text style={styles.emptySub}>Start journaling to track your thoughts and feelings.</Text>
              <PrimaryButton
                title="Write Your First Entry"
                onPress={() => setMode('write')}
                style={{ marginTop: SPACING.md }}
              />
            </View>
          )
          : (
            <FlatList
              data={entries}
              keyExtractor={(e) => e.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <GlassCard style={{ padding: SPACING.xl, marginBottom: 0 }}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>
                      {new Date(item.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </Text>
                    {item.mood_tag && <Text style={styles.entryTag}>{item.mood_tag}</Text>}
                  </View>
                  <Text style={styles.entryContent} numberOfLines={4}>{item.content}</Text>
                  {item.emotion_analysis?.emotion && (
                    <Text style={styles.entryEmotion}>
                      AI detected: {item.emotion_analysis.emotion}
                    </Text>
                  )}
                </GlassCard>
              )}
            />
          )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.background },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.xl, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle:    { color: COLORS.text, fontSize: 20, fontWeight: FONTS.black },
  backBtn:        { color: COLORS.primary, fontSize: 15, fontWeight: FONTS.bold },
  saveBtn:        { color: COLORS.primary, fontSize: 15, fontWeight: FONTS.black },
  newBtn:         { backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.lg },
  newBtnText:     { color: '#fff', fontWeight: FONTS.black, fontSize: 13 },
  dateRow:        { padding: SPACING.xl, paddingBottom: 0 },
  dateText:       { color: COLORS.textMuted, fontSize: 13, fontWeight: FONTS.medium },
  writeInput:     { flex: 1, color: COLORS.text, fontSize: 16, fontWeight: FONTS.medium, lineHeight: 26, padding: SPACING.xl, textAlignVertical: 'top' },
  tagsLabel:      { color: COLORS.textMuted, fontSize: 11, fontWeight: FONTS.black, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: SPACING.sm },
  tagsRow:        { padding: SPACING.xl, borderTopWidth: 1, borderTopColor: COLORS.border },
  tags:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag:            { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  tagActive:      { backgroundColor: `${COLORS.primary}20`, borderColor: `${COLORS.primary}50` },
  tagText:        { color: COLORS.textMuted, fontSize: 13, fontWeight: FONTS.medium },
  tagTextActive:  { color: COLORS.primary },
  list:           { padding: SPACING.xl, gap: SPACING.md },
  emptyWrap:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING['3xl'] },
  emptyEmoji:     { fontSize: 64, marginBottom: SPACING.xl },
  emptyTitle:     { color: COLORS.text, fontSize: 22, fontWeight: FONTS.black, marginBottom: SPACING.sm },
  emptySub:       { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: SPACING['2xl'] },
  startBtn:       { backgroundColor: COLORS.primary, paddingHorizontal: SPACING['2xl'], paddingVertical: SPACING.lg, borderRadius: RADIUS['2xl'] },
  startBtnText:   { color: '#fff', fontWeight: FONTS.black, fontSize: 15 },
  entryCard:      { backgroundColor: COLORS.surface, borderRadius: RADIUS['2xl'], padding: SPACING.xl, borderWidth: 1, borderColor: COLORS.border },
  entryHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  entryDate:      { color: COLORS.textMuted, fontSize: 12, fontWeight: FONTS.bold },
  entryTag:       { fontSize: 12, color: COLORS.primary },
  entryContent:   { color: COLORS.text, fontSize: 14, lineHeight: 22, fontWeight: FONTS.medium },
  entryEmotion:   { marginTop: SPACING.sm, color: COLORS.primary, fontSize: 11, fontWeight: FONTS.bold, textTransform: 'uppercase', letterSpacing: 1 },
})
