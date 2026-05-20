"use client"

import React from 'react'
import { Stack, Typography, Button, Container, Box } from '@mui/material'
import Link from 'next/link'
import Image from 'next/image'

export function PremiumHeader() {
  return (
    <Box 
      component="header" 
      className="glass"
      sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1100,
        m: 2,
        borderRadius: 4,
      }}
    >
      <Container maxWidth="xl">
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center" 
          sx={{ height: 72 }}
        >
          {/* Logo Section */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  position: 'relative',
                  filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.3))'
                }}
              >
                <Image 
                  src="/logo.png" 
                  alt="MindfulAI Logo" 
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </Box>
              <Typography 
                variant="h6" 
                className="gradient-text"
                sx={{ 
                  fontWeight: 900, 
                  fontSize: '1.5rem',
                  letterSpacing: -0.5
                }}
              >
                MindfulAI
              </Typography>
            </Stack>
          </Link>

          {/* Navigation Links */}
          <Stack direction="row" spacing={4} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/resilience" className="nav-link">Resilience</Link>
            <Link href="/clinical" className="nav-link">Clinical</Link>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2}>
            <Button 
              component={Link} 
              href="/auth?authMode=login"
              variant="text"
              sx={{ color: 'text.primary', fontWeight: 700 }}
            >
              Login
            </Button>
            <Button 
              component={Link} 
              href="/auth?authMode=register"
              variant="contained"
              className="glass"
              sx={{ 
                borderRadius: 3, 
                px: 3, 
                fontWeight: 700,
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(59, 130, 246, 0.5) 100%)',
                color: '#fff',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(59, 130, 246, 0.8) 100%)',
                }
              }}
            >
              Get Started
            </Button>
          </Stack>
        </Stack>
      </Container>
      
      <style jsx>{`
        .nav-link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }
        .nav-link:hover {
          color: #fff;
          text-shadow: 0 0 12px rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </Box>
  )
}
