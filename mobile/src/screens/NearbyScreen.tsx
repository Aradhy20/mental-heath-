import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import { locationAPI } from '../services/api'
import { COLORS, FONTS, RADIUS, SPACING } from '../theme/tokens'
import { GlassCard } from '../components/GlassCard'

export default function NearbyScreen() {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    locationAPI.getRecommendations()
      .then(setRecommendations)
      .catch((e) => console.log('Location error', e))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nearby Help</Text>
      <Text style={styles.subtitle}>Curated spots based on your current stress & activity levels</Text>

      {/* Mock Map UI */}
      <View style={styles.mapMock}>
        <Text style={styles.mapText}>🗺 Google Maps View</Text>
        <Text style={styles.mapSubtext}>Showing {recommendations.length} recommended locations nearby</Text>
      </View>

      <Text style={styles.sectionTitle}>Recommendations for You</Text>

      {recommendations.map((loc, i) => (
        <GlassCard key={i} style={{ marginBottom: SPACING.xl }}>
          <View style={styles.cardHeader}>
            <Text style={styles.locName}>{loc.name}</Text>
            <Text style={styles.locType}>{loc.type}</Text>
          </View>
          <Text style={styles.locAddress}>📍 {loc.address}</Text>
          <Text style={styles.locDistance}>🚶 {loc.distance} away</Text>
          <TouchableOpacity style={styles.routeBtn}>
            <Text style={styles.routeBtnText}>Get Directions</Text>
          </TouchableOpacity>
        </GlassCard>
      ))}

      {recommendations.length === 0 && (
        <Text style={styles.emptyText}>No recommendations right now.</Text>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  content:      { padding: SPACING['2xl'], paddingBottom: SPACING['4xl'] },
  center:       { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  title:        { color: COLORS.text, fontSize: 28, fontWeight: FONTS.black, letterSpacing: -0.5, marginBottom: 4 },
  subtitle:     { color: COLORS.textMuted, fontSize: 13, fontWeight: FONTS.medium, marginBottom: SPACING['2xl'] },
  mapMock:      { height: 200, backgroundColor: COLORS.surface, borderRadius: RADIUS['2xl'], justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING['2xl'] },
  mapText:      { color: COLORS.text, fontSize: 20, fontWeight: FONTS.bold, marginBottom: 8 },
  mapSubtext:   { color: COLORS.textMuted, fontSize: 12 },
  sectionTitle: { color: COLORS.textMuted, fontSize: 11, fontWeight: FONTS.black, textTransform: 'uppercase', letterSpacing: 2, marginBottom: SPACING.xl },
  card:         { backgroundColor: COLORS.surface, borderRadius: RADIUS['2xl'], padding: SPACING['2xl'], borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl },
  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  locName:      { color: COLORS.text, fontSize: 18, fontWeight: FONTS.black, flex: 1 },
  locType:      { color: COLORS.primary, fontSize: 12, fontWeight: FONTS.bold, textTransform: 'uppercase', backgroundColor: `${COLORS.primary}20`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full, overflow: 'hidden' },
  locAddress:   { color: COLORS.textSecond, fontSize: 14, marginBottom: 6 },
  locDistance:  { color: COLORS.textMuted, fontSize: 12, fontWeight: FONTS.medium, marginBottom: SPACING.xl },
  routeBtn:     { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: RADIUS.xl, alignItems: 'center' },
  routeBtnText: { color: '#fff', fontSize: 14, fontWeight: FONTS.black },
  emptyText:    { color: COLORS.textMuted, textAlign: 'center', marginTop: 20 }
})
