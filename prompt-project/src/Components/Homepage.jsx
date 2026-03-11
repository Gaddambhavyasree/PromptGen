import React, { useState } from "react";

const Homepage = () => {
  const [formData, setFormData] = useState({
    raw: "",
    platforms: []
  });

  const [posts, setPosts] = useState({}); // Store posts per platform

  const handlePlatformChange = (e) => {
    if (e.target.checked) {
      setFormData({
        ...formData,
        platforms: [...formData.platforms, e.target.value]
      });
    } else {
      setFormData({
        ...formData,
        platforms: formData.platforms.filter(
          (platform) => platform !== e.target.value
        )
      });
    }
  };

  async function ContactGemini() {
    if (!formData.raw) {
      alert("Please enter text");
      return;
    }

    try {
      const prompt = `Generate social media posts based on the following content.

Content: ${formData.raw}

Platforms: ${formData.platforms.join(", ")}

Instructions:
- Create a separate post for each platform.
- Adapt the tone to match the platform audience.
- Keep Instagram engaging with emojis and hashtags.
- Keep LinkedIn professional.
- Keep Twitter short and impactful.

Output format:
Platform Name: [platformName]
Post: [postContent]`;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": "AIzaSyBa4iW0k_Nnb9BEqBnD84bFyC6fD9U6avE"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ]
          })
        }
      );

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;

      // Split text into posts per platform
      const postObj = {};
      formData.platforms.forEach((platform) => {
        const regex = new RegExp(`Platform Name: ${platform}\\s*Post: ([\\s\\S]*?)(?=Platform Name:|$)`, "i");
        const match = text.match(regex);
        if (match) {
          postObj[platform] = match[1].trim();
        }
      });

      setPosts(postObj);

    } catch (error) {
      console.error("Error:", error);
      setPosts({ error: "Error generating content. Please try again." });
    }
  }

  return (
    <>
      <h1>Prompt Generator</h1>
      <p>Enter raw text</p>

      <form onSubmit={(e) => e.preventDefault()}>
        <textarea
          style={{ height: "100px", width: "1000px" }}
          value={formData.raw}
          onChange={(e) =>
            setFormData({
              ...formData,
              raw: e.target.value
            })
          }
        />

        <br /><br />

        <input type="checkbox" value="Instagram" onChange={handlePlatformChange}/>
        <label>Instagram</label>

        <input type="checkbox" value="Linkedin" onChange={handlePlatformChange}/>
        <label>Linkedin</label>

        <input type="checkbox" value="Twitter" onChange={handlePlatformChange}/>
        <label>Twitter</label>

        <br /><br />

        <button type="button" onClick={ContactGemini}>
          Generate Prompt
        </button>
      </form>

      <br /><br />

      <div style={{ display: "flex", gap: "20px" }}>
        {formData.platforms.map((platform) => (
          <div key={platform} style={{ border: "1px solid #ccc", padding: "20px", flex: 1, whiteSpace: "pre-line" }}>
            <h3>{platform}</h3>
            {posts[platform] || "Generating..."}
          </div>
        ))}
      </div>
    </>
  );
};

export default Homepage;