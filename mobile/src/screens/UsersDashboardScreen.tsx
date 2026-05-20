import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native'
import { useAuth } from '../store/AuthContext'
import { authAPI } from '../services/api'
import { COLORS, FONTS, RADIUS, SPACING } from '../theme/tokens'
import { GlassCard } from '../components/GlassCard'

interface Props { navigation: any }

export default function UsersDashboardScreen({ navigation }: Props) {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authAPI.getUsers()
      .then(setUsers)
      .catch((err) => console.log('Error fetching users:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.name}>All Users 📊</Text>
        </View>
      </View>

      <GlassCard style={{ marginBottom: SPACING.xl }}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Total Users</Text>
          <Text style={styles.statValue}>{users.length}</Text>
        </View>
      </GlassCard>

      <Text style={styles.sectionTitle}>User List</Text>
      
      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.lg }} />
      ) : (
        <View style={styles.usersList}>
          {users.map((u, i) => (
            <GlassCard key={i} style={styles.userCardGlass}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{u.username || 'Anonymous'}</Text>
                <Text style={styles.userEmail}>{u.email}</Text>
              </View>
              <View style={styles.userExtra}>
                <Text style={styles.userDate}>
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </GlassCard>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.background },
  content:      { padding: SPACING['2xl'], paddingBottom: SPACING['4xl'] },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING['2xl'] },
  greeting:     { color: COLORS.primary, fontSize: 14, fontWeight: FONTS.bold, textTransform: 'uppercase', letterSpacing: 1 },
  name:         { color: COLORS.text, fontSize: 26, fontWeight: FONTS.black, letterSpacing: -0.5, marginTop: 4 },
  
  statusCard:   { backgroundColor: COLORS.surface, borderRadius: RADIUS['3xl'], padding: SPACING['2xl'], borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl },
  statusRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusLabel:  { fontSize: 16, fontWeight: FONTS.bold, color: COLORS.textMuted },
  statValue:    { color: COLORS.primary, fontSize: 32, fontWeight: FONTS.black, letterSpacing: -0.5 },
  
  sectionTitle: { color: COLORS.textMuted, fontSize: 11, fontWeight: FONTS.black, textTransform: 'uppercase', letterSpacing: 2, marginBottom: SPACING.md, marginTop: SPACING.lg },
  
  usersList:    { gap: SPACING.md },
  userCardGlass: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.xl },
  userInfo:     { flex: 1 },
  userName:     { color: COLORS.text, fontSize: 16, fontWeight: FONTS.bold, marginBottom: 4 },
  userEmail:    { color: COLORS.textSecond, fontSize: 13, fontWeight: FONTS.medium },
  userExtra:    { alignItems: 'flex-end' },
  userDate:     { color: COLORS.textMuted, fontSize: 11, fontWeight: FONTS.bold },
})
