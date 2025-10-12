<template>
  <main class="wrap">
    <header>
      <h1>Farm Arogya🌿</h1>
      <p>For village farmers — Sinhala / தமிழ் / English</p>
      <select v-model="lang" aria-label="Language">
        <option value="si">සිංහල</option>
        <option value="ta">தமிழ்</option>
        <option value="en">English</option>
      </select>
    </header>



    <section class="card">
      <form @submit.prevent="submit">
        <!-- Custom Browse Button -->
        <label class="browse-btn">
          <input type="file" accept="image/*" @change="onFile" />
          <span>{{ file ? '📷 Change Image' : '📁 Browse Image' }}</span>
        </label>

        <!-- Analyze Button -->
        <button class="analyze-btn" :disabled="!file || loading">
          {{ loading ? 'Analyzing…' : label('check') }}
        </button>
      </form>

      <div v-if="preview" class="preview">
        <img :src="preview" alt="preview" />
      </div>

      <div v-if="result" class="result">
        <h2>✅ {{ label('detected') }}: {{ humanLabel }}</h2>
        <p>{{ localizedDescription }}</p>
        <ol>
          <li v-for="(step, i) in result.remedy?.steps || []" :key="i">
            {{ step[lang] || step.en }}
          </li>
        </ol>
        <small>confidence: {{ (result.prediction.confidence * 100).toFixed(1) }}%</small>
      </div>

      <p v-if="error" class="error">❌ {{ error }}</p>
    </section>

    <footer class="tips">
      <strong>Photo Tips:</strong> daylight • single leaf close-up • avoid blur
    </footer>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const lang = ref<'si' | 'ta' | 'en'>('si')
const API = 'http://127.0.0.1:5000'

const file = ref<File | null>(null)
const preview = ref<string | null>(null)
const loading = ref(false)
const result = ref<any>(null)
const error = ref<string | null>(null)

const labelsMap: Record<string, any> = {
  Healthy: { si: "සෞඛ්‍යාත්මක", ta: "நல்லது", en: "Healthy" },
  Rice_Blast: { si: "වී බ්ලැස්ට්", ta: "நெல் பிளாஸ்ட்", en: "Rice Blast" },
  Rice_Brown_Spot: { si: "වී බ්රවුන් ස්පොට්", ta: "நெல் பிரவுன் ஸ்பாட்", en: "Rice Brown Spot" },
  Tea_Blight: { si: "තේ බ්ලයිට්", ta: "தேயிலை பிளைட்", en: "Tea Blight" },
  Coconut_Leaf_Black_Strip: { si: "පොල් කොළ කළු රේඛා", ta: "தென்னை கருப்பு கோடு", en: "Coconut Leaf Black Strip" },
  Chili_Leaf_Curl: { si: "මිරිස් කොළ සුරුක", ta: "மிளகாய் இலை சுருக்கு", en: "Chili Leaf Curl" },
  Tomato_Early_Blight: { si: "තක්කාලි අර්ලී බ්ලයිට්", ta: "தக்காளி ஈர்லி பிளைட்", en: "Tomato Early Blight" },
  Unknown: { si: "නිරීක්ෂණය කළ නොහැක", ta: "உறுதி இல்லை", en: "Unknown" }
}

const humanLabel = computed(() => {
  const key = result.value?.prediction?.label
  if (!key) return ''
  return (labelsMap[key] && labelsMap[key][lang.value]) || key
})

const localizedDescription = computed(() => {
  if (!result.value) return ''
  const desc = result.value.remedy?.description || {}
  return desc[lang.value] || desc['en'] || ''
})

function label(key: 'check' | 'detected') {
  const L: any = {
    si: { check: 'රෝග පරීක්ෂා කරන්න', detected: 'හඳුනාගත් රෝගය' },
    ta: { check: 'நோய் சரிபார்க்க', detected: 'கண்டறிந்த நோய்' },
    en: { check: 'Check disease', detected: 'Detected disease' }
  }
  return L[lang.value][key]
}

function onFile(e: Event) {
  const t = e.target as HTMLInputElement
  file.value = t.files?.[0] || null
  preview.value = file.value ? URL.createObjectURL(file.value) : null
}

async function submit() {
  if (!file.value) return
  loading.value = true
  error.value = null
  result.value = null
  try {
    const fd = new FormData()
    fd.append('image', file.value)
    const r = await fetch(`${API}/predict`, { method: 'POST', body: fd })
    if (!r.ok) throw new Error(`Server ${r.status}`)
    result.value = await r.json()
  } catch (e: any) {
    error.value = e.message || 'Failed'
  } finally {
    loading.value = false
  }
}
</script>
