<div align="center">

# 🖋️ Press & Craft

**Live Demo:** https://press-and-craft.vercel.app/
<br />

<img src="./public/typewriter-illustration.svg" width="220" alt="Press & Craft 1874 Mechanical Typewriter" />

<br />

### An authentic digital recreation of the historic 1874 E. Remington & Sons mechanical typewriter.
**Experience tactile keystrokes, physical platen returns, margin bell chimes, and realistic parchment drafting!**

<br />

[![React](https://img.shields.io/badge/React-19-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Web Audio](https://img.shields.io/badge/Web_Audio-Multi--Sample_Acoustics-E65100?style=flat&logo=speaker&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![jsPDF](https://img.shields.io/badge/jsPDF-PDF_Export-D32F2F?style=flat&logo=adobe-acrobat-reader&logoColor=white)](https://github.com/parallax/jsPDF)

[![Deploy](https://img.shields.io/badge/Deploy-Cloud_Run-4285F4?style=flat&logo=googlecloud&logoColor=white)](https://cloud.google.com/run)

</div>

---

## 🎹 Key Features

- **Authentic Mechanical Keystrokes:** Multi-sampled typebar acoustic feedback (`key1`–`key5`) with physical hammer strike animations.
- **Physical Escapement & Carriage Return:** Real-time carriage movement across margin stops with authentic brass warning bell chime.
- **Mechanical vs. Free Mode:**
  - **Mechanical Mode:** Period-accurate mechanics where backspace steps backward across the platen without deleting ink.
  - **Free Mode:** Modern forgiving backspacing and arrow key navigation for fluid drafting.
- **Dynamic Parchment Paper Simulation:** Interactive A4 manuscript sheet with live platen roller scrolling and tear animation.
- **One-Click Archival & PDF Export:** Export completed manuscripts directly to formatted PDF files or send them to physical printers with dedicated print stylesheets.
- **Cross-Platform Responsive Design:** Fully calibrated across desktop mechanical keyboards, laptops, tablets, and mobile smartphones.

---

## 🛠️ Technology Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** | Component-driven architecture managing real-time carriage and platen states |
| **Language** | **TypeScript 5.8** | Strict static type validation across keyboard matrices and document models |
| **Build Tooling** | **Vite 6** | Instant development server and optimized production bundler |
| **Styling** | **Tailwind CSS 4** | Skeuomorphic vintage styling, iron cast gradients, and parchment textures |
| **Audio Engine** | **Web Audio API** | Multi-channel, zero-latency mechanical sound synthesis |
| **Document Export** | **jsPDF** | Vector-accurate client-side PDF manuscript rendering |

---

## 🕹️ Keyboard Controls

| Key / Action | Function |
| :--- | :--- |
| **`A–Z`, `0–9`, Symbols** | Types characters with mechanical hammer action and carriage step |
| **`Enter` / Lever** | Rings margin bell, advances platen roller, and returns carriage |
| **`Backspace`** | Moves carriage backward one step (*retains typed ink in Machine Mode*) |
| **`Shift` / `Caps Lock`** | Engages upper-case character basket |
| **`Spacebar`** | Advances carriage with authentic escapement tooth click |
| **`Ctrl / Cmd + P`** | Opens print layout dialog for the current manuscript |

---


# 4. Start the development server
npm run dev
