<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
  useSeoMeta({
  title: 'BatchTrack',
  ogTitle: 'BatchTrack',
  description: 'Track your batch progress with ease',
  ogDescription: 'Track your batch progress with ease',
  ogImage: 'https://batch-track.netlify.app/logo.png',
  twitterCard: 'summary_large_image',
})
</script>

<style>
/* Modern Typography System */
:root {
  /* Font Families */
  --font-primary: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-display: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
  
  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;
  
  /* Font Sizes */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* Letter Spacing */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0em;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
}

html {
  font-family: var(--font-primary);
  font-weight: var(--font-weight-normal);
  font-size: 16px;
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-normal);
  background: #fafbfc;
  color: rgb(15 23 42);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-primary);
}

/* Modern Heading Styles */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: rgb(15 23 42);
  margin: 0 0 1rem 0;
}

h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: var(--tracking-tighter);
}

h2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
}

h3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-semibold);
}

h4 {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
}

h5 {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-medium);
}

h6 {
  font-size: var(--text-base);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

/* Body Text */
p {
  margin: 0 0 1rem 0;
  line-height: var(--leading-relaxed);
  color: rgb(51 65 85);
}

/* Modern Utility Classes */
.text-display {
  font-family: var(--font-display);
}

.text-primary {
  font-family: var(--font-primary);
}

.font-light { font-weight: var(--font-weight-light); }
.font-normal { font-weight: var(--font-weight-normal); }
.font-medium { font-weight: var(--font-weight-medium); }
.font-semibold { font-weight: var(--font-weight-semibold); }
.font-bold { font-weight: var(--font-weight-bold); }
.font-extrabold { font-weight: var(--font-weight-extrabold); }

.text-xs { font-size: var(--text-xs); }
.text-sm { font-size: var(--text-sm); }
.text-base { font-size: var(--text-base); }
.text-lg { font-size: var(--text-lg); }
.text-xl { font-size: var(--text-xl); }
.text-2xl { font-size: var(--text-2xl); }
.text-3xl { font-size: var(--text-3xl); }
.text-4xl { font-size: var(--text-4xl); }
.text-5xl { font-size: var(--text-5xl); }

.leading-tight { line-height: var(--leading-tight); }
.leading-snug { line-height: var(--leading-snug); }
.leading-normal { line-height: var(--leading-normal); }
.leading-relaxed { line-height: var(--leading-relaxed); }
.leading-loose { line-height: var(--leading-loose); }

.tracking-tighter { letter-spacing: var(--tracking-tighter); }
.tracking-tight { letter-spacing: var(--tracking-tight); }
.tracking-normal { letter-spacing: var(--tracking-normal); }
.tracking-wide { letter-spacing: var(--tracking-wide); }
.tracking-wider { letter-spacing: var(--tracking-wider); }

/* Global Vuetify Overrides */
.v-application {
  font-family: var(--font-primary) !important;
}

.v-btn {
  font-family: var(--font-primary) !important;
  font-weight: var(--font-weight-medium) !important;
  letter-spacing: var(--tracking-normal) !important;
  text-transform: none !important;
}

.v-card-title {
  font-family: var(--font-display) !important;
  font-weight: var(--font-weight-semibold) !important;
}

.v-data-table .v-data-table-header__content {
  font-family: var(--font-primary) !important;
  font-weight: var(--font-weight-semibold) !important;
  letter-spacing: var(--tracking-wide) !important;
}

.v-field-label {
  font-family: var(--font-primary) !important;
  font-weight: var(--font-weight-medium) !important;
}

.v-chip {
  font-family: var(--font-primary) !important;
  font-weight: var(--font-weight-medium) !important;
  letter-spacing: var(--tracking-wide) !important;
}

/* Layout Improvements */
.section {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Modern Data Table Styling */
.v-data-table__tr:nth-child(odd) {
  background-color: rgb(248 250 252 / 0.5) !important;
}

.v-overlay.v-dialog {
  background: rgba(15, 23, 42, 0.3) !important;
  backdrop-filter: blur(8px) !important;
}

.v-data-table-footer__items-per-page {
  display: none !important;
}

/* Modern Divider */
hr {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgb(226 232 240), transparent);
  margin: 2rem 0;
}

/* Focus States */
*:focus-visible {
  outline: 2px solid rgb(99 102 241);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Selection Colors */
::selection {
  background-color: rgba(99, 102, 241, 0.2);
  color: rgb(15 23 42);
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgb(248 250 252);
}

::-webkit-scrollbar-thumb {
  background: rgb(203 213 225);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgb(148 163 184);
}
</style>