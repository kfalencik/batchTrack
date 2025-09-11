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
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,100..900;1,100..900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');

  html {
    letter-spacing: 0.03em;
    font-weight: 300;
    background: #e2e8f0;
  }

  h1,h2,h3,h4,h5 {
    font-weight: 300;
    font-family: "Permanent Marker", serif;
    font-optical-sizing: auto;
    font-style: normal;
  }

  p {
    margin: 0 0 1rem 0;
  }

  hr {
    color: #c6bb8f;
    height: 2px;
    margin: 20px auto;
    width: 80px;
  }

  .section {
    max-width: 1600px;
  }

  h1 {
    font-size: 30px;
  }

  .mobile-menu-open {
    overflow: hidden !important;
  }

.swiper-pagination-bullet {
  margin: 0 2px;
  padding: 5px;
  border: 1px solid white !important;
  background-color: none !important;
  transition: background-color 2s ease;

    &:hover {
      background-color: #c7bc8f !important;
    }

    &-active {
      background-color: #c7bc8f !important;
    }
  }

.v-btn.border {
  border: none !important;
  background: none !important;

  &::after {
    content: '';
    display: block;
    width: 40px;
    background-color: #c6bb8f;
    height: 2px;
    border: none;
    opacity: 1;
    left: 50%;
    top: 100%;
    transform: translateX(-50%);
  }
}

.v-overlay.v-dialog {
  background: rgba(0,0,0,0.6) !important;
  backdrop-filter: blur(10px) !important;
}
</style>