# 🌿 FarmArogya - Advanced AI Agricultural Ecosystem

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5+-4fc08d?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0+-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-FF6B00?style=for-the-badge&logo=openai&logoColor=white)]()
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)]()

**FarmArogya** is a comprehensive, AI-driven digital platform designed to empower farmers with cutting-edge technology. Built to bridge the gap between traditional agriculture and modern data science, FarmArogya provides real-time insights, disease detection, and a unified marketplace to ensure food security and sustainable farming practices.

---

## 🚀 Key Functionalities

### 1. 🔍 AI-Powered Disease Detection
Farmers can upload or capture images of infected plant leaves. Our specialized AI models analyze the visual patterns to identify diseases such as:
*   **Rice Blast & Brown Spot**
*   **Tea Blight**
*   **Coconut Leaf Black Strip**
*   **Chili Leaf Curl**
*   **Tomato Early Blight**
The system provides immediate remedial steps in **Sinhala, Tamil, and English**.

### 2. 🌍 Live Soil & Crop Dashboard
An interactive, map-based interface (powered by Leaflet) that provides hyper-local soil and environmental data:
*   **Soil Metrics**: pH levels, clay/sand/silt composition, Nitrogen (N) levels, and Organic Carbon content.
*   **Real-time Weather**: Current temperature, humidity, and wind speed via OpenWeather API.
*   **Fertility Scoring**: A proprietary algorithm that calculates a 0-100 fertility score for any specific coordinate.
*   **Crop Recommendations**: Smart suggestions on which crops (e.g., Rice, Wheat, Maize, Potatoes) will thrive in the current conditions.

### 3. 💬 AI Agricultural Assistant (Chat)
A 24/7 intelligent companion that answers complex agricultural queries, offers seasonal planting advice, and helps troubleshoot farming challenges in real-time.

### 4. 🛒 Integrated Farmers' Marketplace
A dedicated space for "Buy & Sell" operations, allowing farmers to:
*   Connect directly with consumers.
*   Trade high-quality seeds and fresh produce.
*   Purchase agricultural tools and specialized machinery.

### 5. 🧪 Fertilizer & Chemical Management
Detailed guidance and a marketplace for fertilizers and essential farming chemicals, ensuring farmers use the right supplements for their soil type.

---

## 🛠 How It Works (Technical Architecture)

FarmArogya is built as a highly responsive **Single Page Application (SPA)** with a modular architecture:

1.  **Frontend**: Developed using **Vue 3** and **Vite** for lightning-fast performance and a premium user experience (UX) featuring glassmorphism and smooth animations.
2.  **Mapping System**: Utilizes **Leaflet.js** for precise geolocation and interactive map pins.
3.  **Data Layer**:
    *   **OpenWeatherMap**: For real-time meteorological data.
    *   **SoilGrids (ISRIC)**: For deep soil property analysis.
    *   **Internal AI Microservices**: Dedicated endpoints for image processing and natural language processing (NLP).
4.  **Security**: Rule-based authentication system with dedicated **Admin Panels** for system oversight and marketplace moderation.

---

## 🌟 How It Helps People

*   **Minimizes Harvest Losses**: By detecting diseases early, farmers can take action before an entire crop is destroyed.
*   **Maximizes Yield**: Soil analysis ensures farmers plant the "right crop in the right place," optimizing resource usage.
*   **Language Inclusivity**: By supporting local languages (**Sinhalese and Tamil**), it brings high-end technology to rural communities who were previously excluded.
*   **Direct-to-Market**: The marketplace removes unnecessary middlemen, ensuring better prices for farmers and fresher produce for consumers.
*   **Eco-Friendly**: Soil-specific fertilizer recommendations prevent over-chemicalization and promote sustainable land use.

---

## 💻 Tech Stack

*   **Framework**: [Vue.js 3](https://vuejs.org/) (Composition API)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Routing**: [Vue Router 4](https://router.vuejs.org/)
*   **Maps**: [Leaflet](https://leafletjs.com/)
*   **State Management**: LocalStorage for session persistence.
*   **Design System**: Modern Vanilla CSS with Glassmorphism, CSS Variables, and advanced Keyframe Animations.
*   **3D Elements**: Integrates [Three.js](https://threejs.org/) for specialized visual components.

---

## 📦 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/farmarogya.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

---
---

## 👨‍💻 Developer & Visionary

Shanuka,
Missari,
Joyana,
Richi Johan,.
Mentor - Hasitha Jagoda

FarmArogya is a passion project dedicated to revolutionizing the agricultural landscape of Sri Lanka and beyond, making farming a high-tech, profitable, and respected profession.


---
© 2026 FarmArogya Ecosystem. All rights reserved.
