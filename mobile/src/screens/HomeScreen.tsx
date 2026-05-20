import React from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import { Text, Card, Avatar, Button, useTheme, IconButton, ProgressBar, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  return (
    <View style={[styles.container, { backgroundColor: '#F9FAFB' }]}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Premium Header */}
        <View style={styles.appBar}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
               <Image 
                source={require('../../assets/logo.png')} 
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            </View>
            <View>
               <Text style={styles.brandText}>MindfulAI</Text>
               <Text style={styles.brandSub}>Neural Network</Text>
            </View>
          </View>
          <View style={styles.appBarActions}>
             <TouchableOpacity style={styles.glassButton}>
                <MaterialCommunityIcons name="lightning-bolt" size={20} color="#7E22CE" />
             </TouchableOpacity>
             <TouchableOpacity style={styles.profileBox}>
                <Avatar.Text size={32} label="A" style={{ backgroundColor: '#7E22CE' }} labelStyle={{ fontWeight: '900', fontSize: 14 }} />
             </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Greeting Section */}
          <View style={styles.greetingSection}>
            <Text style={styles.greetingTitle}>Systems Nominal,</Text>
            <Text style={styles.greetingName}>Aradhy Jain.</Text>
            <View style={styles.statusBadge}>
               <View style={styles.statusDot} />
               <Text style={styles.statusText}>Quantum Link Active</Text>
            </View>
          </View>

          {/* Main Hero Diagnostic */}
          <Surface style={styles.heroCard} elevation={0}>
            <LinearGradient
              colors={['#7E22CE', '#9333EA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroHeader}>
                 <View>
                    <Text style={styles.heroLabel}>NEURAL PROFILE</Text>
                    <Text style={styles.heroTitle}>Equilibrium.</Text>
                 </View>
                 <View style={styles.heroIconBox}>
                    <MaterialCommunityIcons name="brain" size={32} color="#fff" />
                 </View>
              </View>
              
              <Text style={styles.heroDescription}>
                 Your emotional architecture is currently displaying 92% stability. Deep focus protocols are recommended.
              </Text>

              <View style={styles.metricRow}>
                 <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>12%</Text>
                    <Text style={styles.metricLabel}>Clarity Up</Text>
                 </View>
                 <View style={styles.divider} />
                 <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>4.2</Text>
                    <Text style={styles.metricLabel}>Mood Index</Text>
                 </View>
                 <View style={styles.divider} />
                 <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>0.03</Text>
                    <Text style={styles.metricLabel}>Latency</Text>
                 </View>
              </View>

              <TouchableOpacity 
                style={styles.heroButton}
                onPress={() => navigation.navigate('Chat')}
              >
                <Text style={styles.heroButtonText}>Initialize Neural Chat</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#7E22CE" />
              </TouchableOpacity>
            </LinearGradient>
          </Surface>

          {/* Quick Core Grid */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Command Modules</Text>
          </View>

          <View style={styles.grid}>
            <ModuleCard 
               title="Insights" 
               sub="Diagnostic" 
               icon="chart-timeline-variant" 
               color="#7E22CE" 
               onPress={() => navigation.navigate('Insights')} 
            />
            <ModuleCard 
               title="Chronicles" 
               sub="Journaling" 
               icon="book-open-variant" 
               color="#3B82F6" 
               onPress={() => navigation.navigate('Journal')} 
            />
          </View>

          <View style={[styles.grid, { marginTop: 16 }]}>
            <ModuleCard 
               title="Forensics" 
               sub="Multimodal" 
               icon="face-recognition" 
               color="#F59E0B" 
               onPress={() => navigation.navigate('Multimodal')} 
            />
            <ModuleCard 
               title="Safety" 
               sub="Shield" 
               icon="shield-check" 
               color="#10B981" 
               onPress={() => navigation.navigate('Resilience')} 
            />
          </View>

          <View style={[styles.grid, { marginTop: 16 }]}>
            <ModuleCard 
               title="Games" 
               sub="Neuro-Play" 
               icon="controller-classic" 
               color="#EF4444" 
               onPress={() => navigation.navigate('Games')} 
            />
            <ModuleCard 
               title="Nearby" 
               sub="Physical" 
               icon="map-marker-radius" 
               color="#06B6D4" 
               onPress={() => navigation.navigate('Nearby')} 
            />
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const ModuleCard = ({ title, sub, icon, color, onPress }: any) => (
  <TouchableOpacity style={styles.moduleCard} onPress={onPress}>
     <View style={[styles.moduleIconBox, { backgroundColor: `${color}10` }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
     </View>
     <Text style={styles.moduleTitle}>{title}</Text>
     <Text style={styles.moduleSub}>{sub}</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
     width: 44,
     height: 44,
     backgroundColor: '#fff',
     borderRadius: 16,
     alignItems: 'center',
     justifyContent: 'center',
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.05,
     shadowRadius: 10,
     elevation: 2,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -1,
  },
  brandSub: {
     fontSize: 9,
     fontWeight: '900',
     color: '#7E22CE',
     textTransform: 'uppercase',
     letterSpacing: 2,
     marginTop: -2,
  },
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  glassButton: {
     width: 44,
     height: 44,
     backgroundColor: 'rgba(126, 34, 206, 0.05)',
     borderRadius: 16,
     alignItems: 'center',
     justifyContent: 'center',
     borderWidth: 1,
     borderColor: 'rgba(126, 34, 206, 0.1)',
  },
  profileBox: {
     borderWidth: 2,
     borderColor: '#fff',
     borderRadius: 18,
     padding: 2,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.1,
     shadowRadius: 10,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  greetingSection: {
    marginBottom: 32,
  },
  greetingTitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '700',
  },
  greetingName: {
    fontSize: 32,
    color: '#111827',
    fontWeight: '900',
    letterSpacing: -1,
  },
  statusBadge: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: 6,
     marginTop: 8,
     backgroundColor: 'rgba(16, 185, 129, 0.05)',
     alignSelf: 'flex-start',
     paddingHorizontal: 12,
     paddingVertical: 6,
     borderRadius: 10,
     borderWidth: 1,
     borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  statusDot: {
     width: 6,
     height: 6,
     backgroundColor: '#10B981',
     borderRadius: 3,
  },
  statusText: {
     fontSize: 9,
     fontWeight: '900',
     color: '#059669',
     textTransform: 'uppercase',
     letterSpacing: 1,
  },
  heroCard: {
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 40,
    shadowColor: '#7E22CE',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
  },
  heroGradient: {
    padding: 32,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '900',
    fontSize: 9,
    letterSpacing: 3,
    marginBottom: 4,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  heroIconBox: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroDescription: {
     color: 'rgba(255,255,255,0.85)',
     fontSize: 15,
     fontWeight: '600',
     lineHeight: 22,
     marginBottom: 32,
  },
  metricRow: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     marginBottom: 32,
     backgroundColor: 'rgba(255,255,255,0.1)',
     padding: 20,
     borderRadius: 24,
  },
  metricItem: {
     alignItems: 'center',
  },
  metricValue: {
     color: '#fff',
     fontSize: 18,
     fontWeight: '900',
  },
  metricLabel: {
     color: 'rgba(255,255,255,0.6)',
     fontSize: 8,
     fontWeight: '900',
     textTransform: 'uppercase',
     marginTop: 2,
  },
  divider: {
     width: 1,
     height: 20,
     backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroButton: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  heroButtonText: {
    color: '#7E22CE',
    fontWeight: '900',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionHeader: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  moduleCard: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.03,
    shadowRadius: 20,
    elevation: 4,
  },
  moduleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  moduleTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  moduleSub: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700',
  },
});
