'use client'

import React from 'react'
import { 
  Box, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Typography, Avatar, 
  IconButton, Tooltip, Badge, alpha
} from '@mui/material'
import { 
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
  Book as JournalIcon,
  Insights as InsightsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  VideoCameraFront as MultimodalIcon,
  Psychology as PsychologyIcon,
  SportsEsports as GamesIcon,
  Shield as SafetyIcon,
  Place as MapIcon
} from '@mui/icons-material'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { motion } from 'framer-motion'

import { Logo } from "./ui/logo"
import { ThemeToggle } from "./theme-toggle"

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/dashboard' },
  { label: 'AI Therapist', icon: <ChatIcon fontSize="small" />, path: '/chat' },
  { label: 'Journal', icon: <JournalIcon fontSize="small" />, path: '/journal' },
  { label: 'Insights', icon: <InsightsIcon fontSize="small" />, path: '/insights' },
  { label: 'Multimodal', icon: <MultimodalIcon fontSize="small" />, path: '/multimodal' },
  { label: 'Assessments', icon: <PsychologyIcon fontSize="small" />, path: '/assessments' },
  { label: 'Games', icon: <GamesIcon fontSize="small" />, path: '/games' },
  { label: 'Resilience', icon: <SafetyIcon fontSize="small" />, path: '/resilience' },
  { label: 'Nearby', icon: <MapIcon fontSize="small" />, path: '/nearby' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  return (
    <Box sx={{ 
      width: 280, 
      height: '100vh', 
      p: 2,
      display: 'flex', 
      flexDirection: 'column',
      zIndex: 100,
      position: 'relative'
    }}>
      {/* Floating Glass Container */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: (theme) => theme.palette.mode === 'light' ? '#FFFFFF' : '#09090B',
        borderRadius: 0,
        border: 'none',
        borderRight: '1px solid',
        borderColor: (theme) => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
        boxShadow: 'none',
        overflow: 'hidden'
      }}>
        {/* Brand */}
        <Box sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Logo withText size={36} />
        </Box>

        {/* Navigation */}
        <Box sx={{ flex: 1, px: 2, mt: 2, overflowY: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
          <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.path
              return (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton 
                    component={Link} 
                    href={item.path}
                    sx={{ 
                      borderRadius: 4,
                      py: 1.2,
                      px: 2,
                      position: 'relative',
                      bgcolor: isActive ? alpha('#A78BFA', 0.12) : 'transparent',
                      color: isActive ? '#7C3AED' : 'text.secondary',
                      transition: 'all 0.2s ease-out',
                      '&:hover': {
                        bgcolor: alpha('#A78BFA', 0.08),
                        color: '#7C3AED',
                        transform: 'translateX(2px)'
                      },
                      ...(isActive && {
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '15%',
                          bottom: '15%',
                          width: 4,
                          bgcolor: '#A78BFA',
                          borderRadius: '0 4px 4px 0'
                        }
                      })
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: 'inherit', 
                      minWidth: 36,
                      transition: 'transform 0.3s',
                      ...(isActive && { transform: 'scale(1.1)' })
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label} 
                      sx={{ 
                        '& .MuiListItemText-primary': { 
                          fontSize: '0.85rem', 
                          fontWeight: isActive ? 800 : 600,
                          letterSpacing: -0.2
                        } 
                      }} 
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        </Box>

        {/* User Profile Area */}
        <Box sx={{ p: 2, mt: 'auto', borderTop: '1px solid', borderColor: (theme) => alpha(theme.palette.divider, 0.1) }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 6, 
            bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}>
            <Badge 
              overlap="circular" 
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box sx={{ width: 10, height: 10, bgcolor: '#10b981', borderRadius: '50%', border: '2px solid white' }} />
              }
            >
              <Avatar 
                src={user?.avatar} 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  bgcolor: 'primary.main',
                  color: 'white'
                }}
              >
                {user?.username?.[0]?.toUpperCase()}
              </Avatar>
            </Badge>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.username || 'Guest User'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem', fontWeight: 600 }}>
                {user?.role || 'Premium Access'}
              </Typography>
            </Box>
            <ThemeToggle />
          </Box>

          <Box sx={{ display: 'flex', mt: 1, gap: 1 }}>
            <Tooltip title="Settings">
              <IconButton size="small" sx={{ flex: 1, borderRadius: 4, bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03) }}>
                <SettingsIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Log Out">
              <IconButton 
                size="small" 
                onClick={logout}
                sx={{ 
                  flex: 1, 
                  borderRadius: 4, 
                  bgcolor: alpha('#ef4444', 0.05),
                  color: '#ef4444',
                  '&:hover': { bgcolor: alpha('#ef4444', 0.1) }
                }}
              >
                <LogoutIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
