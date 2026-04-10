import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

async function testOpenRouter() {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
        console.error("❌ NOT WORKING: OPENROUTER_API_KEY is missing from backend/.env");
        return;
    }

    console.log("Found KEY. Testing OpenRouter ping...");
    try {
        // using standard fetch (native in newer Node, but backend might use node-fetch or native fetch depending on Node version)
        // we use globalThis.fetch for Node 18+
        const fetchToUse = globalThis.fetch || fetch;

        const res = await fetchToUse("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key}`,
                "HTTP-Referer": "http://localhost:5000",
                "X-Title": "Portfolio Chatbot"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.3-70b-instruct",
                messages: [{ role: "user", content: "Tell me a very short joke." }]
            })
        });

        const data = await res.json();
        if (data.choices && data.choices.length > 0) {
            console.log("✅ WORKING! Received AI response: ");
            console.log(data.choices[0].message.content);
        } else {
            console.log("❌ FAILED to get valid response details from OpenRouter:", data);
        }
    } catch (e) {
        console.error("❌ FAILED with exception:", e);
    }
}

testOpenRouter();
