// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require("node-fetch");

admin.initializeApp();
const db = admin.firestore();

// 1. பாதுகாப்பாக சேமிக்கப்பட்ட Gemini கீ-ஐ எடுக்கிறோம்
const GEMINI_API_KEY = functions.config().gemini.key;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-pro",
  safetySettings: [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
  ],
});

// 2. அனைத்து செயல்பாடுகளையும் கையாளும் ஒரு முக்கிய Cloud Function
exports.getAIResponse = functions.https.onCall(async (data, context) => {
  const query = data.query;
  if (!query) {
    throw new functions.https.HttpsError("invalid-argument", "Query is required.");
  }

  try {
    // படி 1: Gemini-யிடம் கேள்
    const geminiResult = await geminiModel.generateContent(query);
    const geminiResponse = await geminiResult.response;
    const geminiText = geminiResponse.text();
    if (geminiText) {
      // பதில் கிடைத்தால், அதை லாக் செய்துவிட்டு, திருப்பி அனுப்பு
      await db.collection("thai_logs").add({
        question: query,
        answer: geminiText,
        source: "Gemini",
        time: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { answer: geminiText };
    }
  } catch (e) {
    console.error("Gemini Error:", e.message);
  }

  try {
    // படி 2: Gemini பதில் தராவிட்டால், DuckDuckGo-வில் தேடு
    const ddgRes = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&t=thai-ai`);
    const ddgData = await ddgRes.json();
    if (ddgData && ddgData.AbstractText) {
      const ddgAnswer = `${ddgData.AbstractText}\n\n(தகவல்: DuckDuckGo)`;
      await db.collection("thai_logs").add({
        question: query,
        answer: ddgAnswer,
        source: "DuckDuckGo",
        time: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { answer: ddgAnswer };
    }
  } catch (e) {
    console.error("DuckDuckGo Error:", e.message);
  }

  // படி 3: அதுவும் இல்லையென்றால், ನಮ್ಮ டேட்டாபேஸில் தேடு
  const doc = await db.collection("thai_answers").doc(query.toLowerCase()).get();
  if (doc.exists) {
    const dbAnswer = doc.data().answer;
    return { answer: dbAnswer }; // ஏற்கனவே உள்ள பதிலுக்கு லாக் தேவையில்லை
  }

  // படி 4: எதுவும் வேலை செய்யவில்லை என்றால்
  const fallbackResponse = "மன்னிக்கவும், இதற்குப் பதில் எனக்குத் தெரியவில்லை. வேறு விதமாகக் கேட்கவும்.";
  await db.collection("thai_logs").add({
    question: query,
    answer: fallbackResponse,
    source: "Fallback",
    time: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { answer: fallbackResponse };
});


// 3. Admin Panel-க்கான பாதுகாப்பான Cloud Function
exports.getAdminLogs = functions.https.onCall(async (data, context) => {
  // பயனர் லாகின் செய்துள்ளாரா என்று சரிபார்க்கவும்
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }
  // ஒரு குறிப்பிட்ட அட்மின் ஈமெயில்தானா என்றும் சரிபார்க்கலாம்
  // if (context.auth.token.email !== 'your-admin-email@gmail.com') {
  //   throw new functions.https.HttpsError("permission-denied", "You are not an admin.");
  // }
  
  const snapshot = await db.collection("thai_logs").orderBy("time", "desc").limit(100).get();
  const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return { logs };
});
