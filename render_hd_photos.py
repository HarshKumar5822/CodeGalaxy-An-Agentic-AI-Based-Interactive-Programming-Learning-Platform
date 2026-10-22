import os
import subprocess
from PIL import Image

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.exists(edge_path):
    edge_path = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

workspace_dir = r"c:\Users\harsh\OneDrive\Desktop\CodeGalaxy AD"

# ==============================================================================
# HTML 1: Algorithm Visualizer (Bubble Sort)
# ==============================================================================
html_algo = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background-color: #f8fafc;
    font-family: 'Inter', -apple-system, sans-serif;
    padding: 32px 40px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-height: 100vh;
    color: #0f172a;
    -webkit-font-smoothing: antialiased;
  }
  
  /* Top Selector Bar */
  .subtopic-bar {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .subtopic-label {
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    margin-right: 4px;
  }
  .pill {
    padding: 8px 18px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 600;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    color: #334155;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  .pill.active {
    background: #14b8a6;
    border-color: #0d9488;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(20, 184, 166, 0.25);
  }

  /* Main Card */
  .visualizer-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 28px;
    padding: 28px 36px;
    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 480px;
  }

  /* Status Header */
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    padding-bottom: 20px;
  }
  .legend {
    display: flex;
    align-items: center;
    gap: 20px;
    color: #64748b;
    font-weight: 500;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }
  .dot-cyan { background: #2dd4bf; box-shadow: 0 0 8px rgba(45, 212, 191, 0.4); }
  .dot-amber { background: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
  .dot-emerald { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
  
  .step-counter {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.01em;
  }

  /* Bar Display */
  .chart-area {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 14px;
    height: 310px;
    padding: 20px 10px;
  }
  .bar-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex: 1;
    max-width: 44px;
  }
  .bar-val {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    color: #0f766e;
  }
  .bar-body {
    width: 100%;
    background: #2dd4bf;
    border-radius: 12px 12px 0 0;
    border-top: 2px solid #14b8a6;
    transition: height 0.3s ease;
  }

  /* Bottom Banner */
  .status-banner {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 12px 18px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    margin-top: 16px;
  }
  .info-icon {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1.5px solid #0d9488;
    color: #0d9488;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-family: serif;
    font-style: italic;
    font-weight: 700;
  }
</style>
</head>
<body>

  <!-- Top Selector Bar -->
  <div class="subtopic-bar">
    <span class="subtopic-label">Algorithm / Subtopic:</span>
    <span class="pill active">Bubble</span>
    <span class="pill">Selection</span>
    <span class="pill">Insertion</span>
    <span class="pill">Quick</span>
    <span class="pill">Merge</span>
  </div>

  <!-- Main Visualizer Card -->
  <div class="visualizer-card">
    <div class="card-header">
      <div class="legend">
        <div class="legend-item"><span class="dot dot-cyan"></span> Active / Pointer</div>
        <div class="legend-item"><span class="dot dot-amber"></span> Comparing / Target</div>
        <div class="legend-item"><span class="dot dot-emerald"></span> Matched / Sorted</div>
      </div>
      <div class="step-counter">Step 1 / 122</div>
    </div>

    <!-- 16 Bars matching user screenshot -->
    <div class="chart-area">
      <!-- 1: 18 -->
      <div class="bar-col"><span class="bar-val">18</span><div class="bar-body" style="height: 52px;"></div></div>
      <!-- 2: 20 -->
      <div class="bar-col"><span class="bar-val">20</span><div class="bar-body" style="height: 58px;"></div></div>
      <!-- 3: 35 -->
      <div class="bar-col"><span class="bar-val">35</span><div class="bar-body" style="height: 98px;"></div></div>
      <!-- 4: 40 -->
      <div class="bar-col"><span class="bar-val">40</span><div class="bar-body" style="height: 112px;"></div></div>
      <!-- 5: 41 -->
      <div class="bar-col"><span class="bar-val">41</span><div class="bar-body" style="height: 116px;"></div></div>
      <!-- 6: 46 -->
      <div class="bar-col"><span class="bar-val">46</span><div class="bar-body" style="height: 130px;"></div></div>
      <!-- 7: 47 -->
      <div class="bar-col"><span class="bar-val">47</span><div class="bar-body" style="height: 134px;"></div></div>
      <!-- 8: 66 -->
      <div class="bar-col"><span class="bar-val">66</span><div class="bar-body" style="height: 184px;"></div></div>
      <!-- 9: 73 -->
      <div class="bar-col"><span class="bar-val">73</span><div class="bar-body" style="height: 204px;"></div></div>
      <!-- 10: 74 -->
      <div class="bar-col"><span class="bar-val">74</span><div class="bar-body" style="height: 208px;"></div></div>
      <!-- 11: 77 -->
      <div class="bar-col"><span class="bar-val">77</span><div class="bar-body" style="height: 216px;"></div></div>
      <!-- 12: 81 -->
      <div class="bar-col"><span class="bar-val">81</span><div class="bar-body" style="height: 226px;"></div></div>
      <!-- 13: 81 -->
      <div class="bar-col"><span class="bar-val">81</span><div class="bar-body" style="height: 226px;"></div></div>
      <!-- 14: 87 -->
      <div class="bar-col"><span class="bar-val">87</span><div class="bar-body" style="height: 244px;"></div></div>
      <!-- 15: 87 -->
      <div class="bar-col"><span class="bar-val">87</span><div class="bar-body" style="height: 244px;"></div></div>
      <!-- 16: 94 -->
      <div class="bar-col"><span class="bar-val">94</span><div class="bar-body" style="height: 264px;"></div></div>
    </div>

    <!-- Status Banner -->
    <div class="status-banner">
      <div class="info-icon">i</div>
      <span>Initial array state</span>
    </div>
  </div>

</body>
</html>"""

# ==============================================================================
# HTML 2: CodeGalaxy AI Chat Assistant
# ==============================================================================
html_chat = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #06090e;
    font-family: 'Inter', -apple-system, sans-serif;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }
  
  /* Chat Container Window */
  .chat-card {
    width: 480px;
    background: #0d1117;
    border: 1px solid #21262d;
    border-radius: 24px;
    box-shadow: 0 25px 60px rgba(0,0,0,0.7), 0 0 1px 1px rgba(255,255,255,0.05);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Header */
  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #1f242c;
    background: #0d1117;
  }
  .bot-identity {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .bot-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #0e3025;
    border: 1.5px solid #10b981;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    color: #10b981;
  }
  .online-indicator {
    position: absolute;
    bottom: -1px;
    right: -1px;
    width: 10px;
    height: 10px;
    background: #22c55e;
    border: 2px solid #0d1117;
    border-radius: 50%;
  }
  .title-group h2 {
    font-size: 16px;
    font-weight: 700;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .sparkle { color: #fbbf24; font-size: 14px; }
  .status-subtitle {
    font-size: 10px;
    font-weight: 700;
    color: #22c55e;
    letter-spacing: 0.1em;
  }
  .header-actions {
    display: flex;
    align-items: center;
    gap: 14px;
    color: #64748b;
  }
  .icon-btn {
    cursor: pointer;
    font-size: 14px;
    transition: color 0.2s;
  }
  .icon-btn:hover { color: #ffffff; }

  /* Messages Body */
  .chat-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    background: #080b0f;
  }

  /* User Message */
  .user-msg-row {
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    gap: 10px;
  }
  .user-msg-box {
    background: #0d2838;
    border: 1px solid #134e4a;
    border-radius: 18px 18px 4px 18px;
    padding: 12px 16px;
    max-width: 80%;
  }
  .user-msg-text {
    font-size: 13.5px;
    color: #e2e8f0;
    line-height: 1.45;
  }
  .timestamp {
    font-size: 10px;
    color: #64748b;
    margin-top: 6px;
    text-align: right;
  }
  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #0c2e36;
    border: 1px solid #14b8a6;
    color: #14b8a6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  }

  /* AI Message */
  .ai-msg-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .ai-mini-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #0e3025;
    border: 1px solid #10b981;
    color: #10b981;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  }
  .ai-msg-box {
    background: #11161d;
    border: 1px solid #21262d;
    border-radius: 18px;
    padding: 16px 18px;
    color: #e2e8f0;
    font-size: 13px;
    line-height: 1.6;
    flex: 1;
  }
  .ai-title {
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 12px;
  }

  /* Table */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 12px;
  }
  th, td {
    padding: 8px 10px;
    text-align: left;
    border-bottom: 1px solid #1f242c;
  }
  th {
    color: #ffffff;
    font-weight: 700;
    background: #161b22;
  }
  td:first-child {
    font-weight: 700;
    color: #94a3b8;
    white-space: nowrap;
  }
  .code-inline {
    font-family: 'JetBrains Mono', monospace;
    background: #161b22;
    padding: 2px 5px;
    border-radius: 4px;
    border: 1px solid #30363d;
    color: #10b981;
    font-size: 11px;
  }

  /* Footer / Input */
  .chat-footer {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    border-top: 1px solid #1f242c;
    background: #0d1117;
  }
  .add-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #161b22;
    border: 1px solid #30363d;
    color: #94a3b8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
  }
  .input-field {
    flex: 1;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 9999px;
    padding: 10px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #64748b;
    font-size: 13px;
  }
  .mic-icon { color: #94a3b8; font-size: 14px; }
  .send-btn {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: #10b981;
    color: #0d1117;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    cursor: pointer;
  }
</style>
</head>
<body>

  <div class="chat-card">
    <!-- Header -->
    <div class="chat-header">
      <div class="bot-identity">
        <div class="bot-avatar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
          <div class="online-indicator"></div>
        </div>
        <div class="title-group">
          <h2>CodeGalaxy AI <span class="sparkle">✨</span></h2>
          <div class="status-subtitle">ACTIVE ASSISTANT</div>
        </div>
      </div>
      <div class="header-actions">
        <!-- Speaker -->
        <span class="icon-btn">🔊</span>
        <!-- Trash -->
        <span class="icon-btn">🗑️</span>
        <!-- Expand -->
        <span class="icon-btn">⛶</span>
        <!-- Close -->
        <span class="icon-btn">✕</span>
      </div>
    </div>

    <!-- Body -->
    <div class="chat-body">
      <!-- User Msg -->
      <div class="user-msg-row">
        <div class="user-msg-box">
          <div class="user-msg-text">can u tell me about python and java in short</div>
          <div class="timestamp">11:28 AM</div>
        </div>
        <div class="user-avatar">👤</div>
      </div>

      <!-- AI Response -->
      <div class="ai-msg-row">
        <div class="ai-mini-avatar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
        </div>
        <div class="ai-msg-box">
          <div class="ai-title">Quick Comparison: Python vs. Java</div>
          <table>
            <thead>
              <tr>
                <th>Aspect</th>
                <th>Python</th>
                <th>Java</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Syntax</td>
                <td>Very concise, indentation-based blocks.</td>
                <td>Verbose, explicit braces <span class="code-inline">{}</span>.</td>
              </tr>
              <tr>
                <td>Typing</td>
                <td>Dynamic (no type declaration).</td>
                <td>Static (type must be declared).</td>
              </tr>
              <tr>
                <td>Execution</td>
                <td>Interpreted (runs line-by-line).</td>
                <td>Compiled to JVM bytecode (<span class="code-inline">.class</span>).</td>
              </tr>
              <tr>
                <td>Memory</td>
                <td>Automatic GC.</td>
                <td>Automatic GC, but more control via <span class="code-inline">try-with-resources</span>.</td>
              </tr>
              <tr>
                <td>Typical Use-Cases</td>
                <td>Data science, scripting, rapid prototyping, web dev (Django/Flask).</td>
                <td>Enterprise apps, Android, large-scale systems, high-performance servers.</td>
              </tr>
              <tr>
                <td>Learning Curve</td>
                <td>Gentle, great for beginners.</td>
                <td>Steeper, teaches OOP rigorously.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="chat-footer">
      <div class="add-btn">+</div>
      <div class="input-field">
        <span>Ask CodeGalaxy AI...</span>
        <span class="mic-icon">🎙️</span>
      </div>
      <div class="send-btn">➤</div>
    </div>
  </div>

</body>
</html>"""

# Write HTML files to disk
html1_path = os.path.join(workspace_dir, "render_algo.html")
html2_path = os.path.join(workspace_dir, "render_chat.html")

with open(html1_path, "w", encoding="utf-8") as f:
    f.write(html_algo)

with open(html2_path, "w", encoding="utf-8") as f:
    f.write(html_chat)

out_algo_png = os.path.join(workspace_dir, "algorithm_visualizer_hd.png")
out_algo_jpg = os.path.join(workspace_dir, "algorithm_visualizer_hd.jpg")

out_chat_png = os.path.join(workspace_dir, "codegalaxy_ai_chat_hd.png")
out_chat_jpg = os.path.join(workspace_dir, "codegalaxy_ai_chat_hd.jpg")

# Render with headless Edge at high resolution
cmd1 = [
    edge_path,
    "--headless",
    "--disable-gpu",
    "--window-size=1600,820",
    f"--screenshot={out_algo_png}",
    f"file:///{html1_path.replace(os.sep, '/')}"
]
subprocess.run(cmd1, check=True)

cmd2 = [
    edge_path,
    "--headless",
    "--disable-gpu",
    "--window-size=1200,950",
    f"--screenshot={out_chat_png}",
    f"file:///{html2_path.replace(os.sep, '/')}"
]
subprocess.run(cmd2, check=True)

# Also create high-quality JPG versions using PIL
im1 = Image.open(out_algo_png).convert("RGB")
im1.save(out_algo_jpg, "JPEG", quality=95)

im2 = Image.open(out_chat_png).convert("RGB")
im2.save(out_chat_jpg, "JPEG", quality=95)

# Also copy them to artifact directory so they can be embedded in chat/artifacts
artifact_dir = r"C:\Users\harsh\.gemini\antigravity-ide\brain\13122d48-2bb4-4be0-b9a7-c0d0c249eed2"
im1.save(os.path.join(artifact_dir, "algorithm_visualizer_hd.jpg"), "JPEG", quality=95)
im2.save(os.path.join(artifact_dir, "codegalaxy_ai_chat_hd.jpg"), "JPEG", quality=95)

# Clean up temp HTML files
os.remove(html1_path)
os.remove(html2_path)

print("SUCCESS: High definition images generated and saved!")
