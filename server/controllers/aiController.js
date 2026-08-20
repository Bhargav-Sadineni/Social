// import User from "../models/User.js";
// import Post from "../models/Post.js";

// // POST /api/ai/chat
// export const chatWithAI = async (req, res) => {
//     try {
//         const { userId } = req.auth();
//         const { message, history = [] } = req.body;

//         if (!message || !message.trim()) {
//             return res.json({ success: false, message: "Message is required" });
//         }

//         const user = await User.findById(userId);
//         const postCount = await Post.countDocuments({ user: userId });

//         const systemPrompt = `You are the PingUp AI Assistant, a friendly helper built into the PingUp social media app.

// You can help the user in three ways:
// 1. General conversation / questions.
// 2. Helping them write or improve a post (make it punchier, fix grammar, suggest hashtags, adjust tone, etc). If they paste a draft, give back an improved version plus a short explanation of what you changed.
// 3. Answering questions about their own PingUp account using the live stats below. Only use these for account-related questions; don't mention them unless relevant.

// Current user stats:
// - Name: ${user.full_name} (@${user.username})
// - Bio: ${user.bio || "(no bio set)"}
// - Location: ${user.location || "(not set)"}
// - Followers: ${user.followers.length}
// - Following: ${user.following.length}
// - Connections: ${user.connections.length}
// - Posts published: ${postCount}

// Keep replies concise and conversational — this is a small chat widget, not a long-form document. Use plain text, no markdown headers.`;

//         // Gemini uses "user"/"model" roles instead of "user"/"assistant"
//         const contents = [
//             ...history.map(h => ({
//                 role: h.role === 'assistant' ? 'model' : 'user',
//                 parts: [{ text: h.content }]
//             })),
//             { role: 'user', parts: [{ text: message }] }
//         ];

//         const response = await fetch(
//             `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//             {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     system_instruction: { parts: [{ text: systemPrompt }] },
//                     contents
//                 })
//             }
//         );

//         const data = await response.json();

//         if (data.error) {
//             console.log(data.error);
//             return res.json({ success: false, message: data.error.message });
//         }

//         const reply = data.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";

//         res.json({ success: true, reply });

//     } catch (error) {
//         console.log(error);
//         res.json({ success: false, message: error.message });
//     }
// };

import User from "../models/User.js";
import Post from "../models/Post.js";

// POST /api/ai/chat
export const chatWithAI = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { message, history = [] } = req.body;

        if (!message || !message.trim()) {
            return res.json({
                success: false,
                message: "Message is required"
            });
        }

        const user = await User.findById(userId);
        const postCount = await Post.countDocuments({ user: userId });

        const systemPrompt = `You are the PingUp AI Assistant, a friendly helper built into the PingUp social media app.

You can help the user in three ways:
1. General conversation / questions.
2. Helping them write or improve a post (make it punchier, fix grammar, suggest hashtags, adjust tone, etc). If they paste a draft, give back an improved version plus a short explanation of what you changed.
3. Answering questions about their own PingUp account using the live stats below. Only use these for account-related questions; don't mention them unless relevant.

Current user stats:
- Name: ${user.full_name} (@${user.username})
- Bio: ${user.bio || "(no bio set)"}
- Location: ${user.location || "(not set)"}
- Followers: ${user.followers.length}
- Following: ${user.following.length}
- Connections: ${user.connections.length}
- Posts published: ${postCount}

Keep replies concise and conversational — this is a small chat widget, not a long-form document. Use plain text, no markdown headers.`;

        // Gemini uses "user"/"model" roles
        const contents = [
            ...history.map(h => ({
                role: h.role === "assistant" ? "model" : "user",
                parts: [{ text: h.content }]
            })),
            {
                role: "user",
                parts: [{ text: message }]
            }
        ];

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    contents
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            console.log(data.error);

            return res.json({
                success: false,
                message: data.error.message
            });
        }

        const reply =
            data.candidates?.[0]?.content?.parts
                ?.map(p => p.text)
                .join("") || "";

        res.json({
            success: true,
            reply
        });

    } catch (error) {
        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
};