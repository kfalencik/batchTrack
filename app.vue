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
    background: #ededed;
    font-size: 14px;
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

  h2 {
    font-size: 22px;
  }
.v-data-table__tr:nth-child(odd) {
  background-color: #f9f9f9;
}


</style>