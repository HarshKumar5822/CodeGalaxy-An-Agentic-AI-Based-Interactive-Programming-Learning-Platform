import os
import subprocess
from PIL import Image

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.exists(edge_path):
    edge_path = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

workspace_dir = r"c:\Users\harsh\OneDrive\Desktop\CodeGalaxy AD"

# ==============================================================================
# HTML 1: Two Sum Challenge Workspace (White / Light Mode HD & Interactive)
# ==============================================================================
html_twosum = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #ffffff;
    font-family: 'Inter', -apple-system, sans-serif;
    color: #0f172a;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Top Navigation Bar */
  .top-navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 28px;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
  }
  .nav-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .back-btn {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #475569;
    background: #f8fafc;
    cursor: pointer;
  }
  .difficulty-badge {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 3px 8px;
    border-radius: 6px;
    background: #ecfdf5;
    color: #059669;
    border: 1px solid #a7f3d0;
  }
  .title-area h1 {
    font-size: 18px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
  }

  .nav-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .telemetry-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 9999px;
    background: #fffbeb;
    border: 1px solid #fef3c7;
    color: #d97706;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }
  .reward-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 9999px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #16a34a;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  /* Main 3-Column Layout */
  .workspace-grid {
    display: grid;
    grid-template-columns: 320px 480px 1fr;
    gap: 16px;
    padding: 16px 24px;
    flex: 1;
    background: #f8fafc;
  }

  /* Shared Panel Styling */
  .panel-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 4px 16px -4px rgba(0,0,0,0.03);
  }

  /* Left Panel: Briefing */
  .briefing-tabs {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    border-bottom: 1px solid #f1f5f9;
    background: #ffffff;
  }
  .tab-group {
    display: flex;
    gap: 12px;
  }
  .tab-item {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #64748b;
    cursor: pointer;
    padding-bottom: 2px;
  }
  .tab-item.active {
    color: #0d9488;
    border-bottom: 2px solid #0d9488;
  }
  .listen-btn {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }
  .briefing-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    font-size: 13.5px;
    line-height: 1.6;
    color: #334155;
  }
  .section-tag {
    font-size: 12px;
    font-weight: 800;
    font-style: italic;
    color: #0f172a;
    letter-spacing: 0.05em;
  }
  .code-snippet {
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #0f766e;
    margin-top: 6px;
  }

  /* Center Panel: Real-Time Visualizer */
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    border-bottom: 1px solid #f1f5f9;
    background: #ffffff;
  }
  .panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
  }
  .sync-badge {
    font-size: 10px;
    font-weight: 700;
    color: #10b981;
    display: flex;
    align-items: center;
    gap: 4px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .visualizer-body {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1;
    background: #ffffff;
  }
  .sub-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    color: #059669;
  }
  .playback-btns {
    display: flex;
    gap: 8px;
    color: #64748b;
    font-size: 14px;
  }
  .playback-btn {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: #f8fafc;
  }
  
  .target-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 12px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: 'JetBrains Mono', monospace;
  }
  .target-label {
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.05em;
  }
  .target-val {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
  }

  .array-container-label {
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
  }
  .array-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  .array-cell {
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 12px;
    padding: 14px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;
  }
  .array-cell.active {
    background: #f0fdfa;
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
  }
  .cell-idx {
    font-size: 9px;
    font-family: 'JetBrains Mono', monospace;
    color: #64748b;
    font-weight: 600;
  }
  .cell-val {
    font-size: 22px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 800;
    color: #0f172a;
  }
  .array-cell.active .cell-val {
    color: #0d9488;
  }

  .lookup-map-card {
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    border-radius: 14px;
    flex: 1;
    min-height: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #94a3b8;
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
  }

  .bottom-info-pill {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    color: #475569;
    text-align: center;
  }

  /* Right Panel: Logic Deployment Unit */
  .editor-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 18px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }
  .controls-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .select-pill {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 600;
    color: #0f172a;
  }
  .sync-active-text {
    font-size: 10px;
    color: #059669;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .controls-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .btn-run {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #ffffff;
    border: 1px solid #0f172a;
    color: #0f172a;
    border-radius: 9999px;
    padding: 6px 14px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
  }
  .btn-submit {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #10b981;
    border: 1px solid #059669;
    color: #ffffff;
    border-radius: 9999px;
    padding: 6px 18px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
  }

  /* Code Editor Simulation */
  .editor-content {
    background: #ffffff;
    padding: 18px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    line-height: 1.6;
    flex: 1;
    color: #1e293b;
    border-bottom: 1px solid #e2e8f0;
  }
  .line-num {
    color: #94a3b8;
    margin-right: 14px;
    user-select: none;
    font-size: 12px;
  }
  .kw { color: #d946ef; font-weight: 700; }
  .fn { color: #0284c7; font-weight: 700; }
  .comment { color: #64748b; font-style: italic; }

  /* Console Output */
  .console-section {
    background: #f8fafc;
    display: flex;
    flex-direction: column;
  }
  .console-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    border-bottom: 1px solid #e2e8f0;
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    color: #64748b;
  }
  .dots {
    display: flex;
    gap: 4px;
  }
  .dot-sm { width: 7px; height: 7px; border-radius: 50%; }
  .dot-red { background: #f87171; }
  .dot-yel { background: #fbbf24; }
  .dot-grn { background: #34d399; }
  .console-body {
    padding: 12px 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #475569;
    line-height: 1.5;
  }
  .exec-tag { color: #0d9488; font-weight: 600; }

  /* Floating action buttons */
  .floating-tools {
    position: fixed;
    bottom: 24px;
    right: 28px;
    display: flex;
    gap: 10px;
  }
  .fab {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #10b981;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35);
    cursor: pointer;
  }
</style>
</head>
<body>

  <!-- Top Navbar -->
  <div class="top-navbar">
    <div class="nav-left">
      <div class="back-btn">←</div>
      <div class="title-area">
        <span class="difficulty-badge">Easy</span>
        <h1>Two Sum</h1>
      </div>
    </div>
    <div class="nav-right">
      <div class="telemetry-pill">★ USER TELEMETRY: 0 XP</div>
      <div class="reward-pill">⚡ REWARD: 100 XP</div>
    </div>
  </div>

  <!-- Workspace Grid -->
  <div class="workspace-grid">
    
    <!-- 1. Left Briefing Panel -->
    <div class="panel-card">
      <div class="briefing-tabs">
        <div class="tab-group">
          <span class="tab-item active">Briefing</span>
          <span class="tab-item">Logic Commander</span>
        </div>
        <div class="listen-btn">🔊 Listen</div>
      </div>
      <div class="briefing-body">
        <p>Given an array of integers <strong>nums</strong> and an integer <strong>target</strong>, return indices of the two numbers such that they add up to target.</p>
        
        <div>
          <div class="section-tag">TACTICAL BRIEFING</div>
          <p style="margin-top: 6px;">You may assume that each input would have exactly one solution.</p>
          <div class="code-snippet">Example: nums = [2, 7, 11, 15]<br>target = 9 ➔ [0, 1]</div>
        </div>
      </div>
    </div>

    <!-- 2. Center Real-Time Visualizer -->
    <div class="panel-card">
      <div class="panel-header">
        <div class="panel-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          Real-Time Visualizer
        </div>
        <div class="sync-badge">● Sync Active</div>
      </div>

      <div class="visualizer-body">
        <div class="sub-controls">
          <span># TWO SUM NEURAL TRACE</span>
          <div class="playback-btns">
            <span class="playback-btn">↺</span>
            <span class="playback-btn">▶</span>
            <span class="playback-btn">⏭</span>
          </div>
        </div>

        <div class="target-box">
          <span class="target-label">TARGET:</span>
          <span class="target-val">9</span>
        </div>

        <div>
          <div class="array-container-label">INPUT ARRAY (NUMS):</div>
          <div class="array-grid">
            <div class="array-cell active">
              <span class="cell-idx">idx: 0</span>
              <span class="cell-val">2</span>
            </div>
            <div class="array-cell">
              <span class="cell-idx">idx: 1</span>
              <span class="cell-val">7</span>
            </div>
            <div class="array-cell">
              <span class="cell-idx">idx: 2</span>
              <span class="cell-val">11</span>
            </div>
            <div class="array-cell">
              <span class="cell-idx">idx: 3</span>
              <span class="cell-val">15</span>
            </div>
          </div>
        </div>

        <div class="lookup-map-card">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          MAP IS EMPTY
        </div>

        <div class="bottom-info-pill">
          Click Play to start Two Sum trace.
        </div>
      </div>
    </div>

    <!-- 3. Right Logic Deployment Unit -->
    <div class="panel-card">
      <div class="panel-header">
        <div class="panel-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          LOGIC DEPLOYMENT UNIT
        </div>
        <div class="sync-badge">● Compiler: Online</div>
      </div>

      <div class="editor-controls">
        <div class="controls-left">
          <span class="select-pill">Python ▾</span>
          <span class="sync-active-text">● NEURAL SYNC ACTIVE</span>
        </div>
        <div class="controls-right">
          <button class="btn-run">▶ Run Code</button>
          <button class="btn-submit">✓ Submit</button>
        </div>
      </div>

      <div class="editor-content">
        <div><span class="line-num">1</span><span class="kw">def</span> <span class="fn">twoSum</span>(nums, target):</div>
        <div><span class="line-num">2</span>    <span class="comment"># Write your code here</span></div>
        <div><span class="line-num">3</span>    <span class="kw">pass</span></div>
      </div>

      <div class="console-section">
        <div class="console-header">
          <span>CONSOLE OUTPUT</span>
          <div class="dots">
            <span class="dot-sm dot-red"></span>
            <span class="dot-sm dot-yel"></span>
            <span class="dot-sm dot-grn"></span>
          </div>
        </div>
        <div class="console-body">
          <div class="exec-tag">➔ ~ Executing...</div>
          <div style="margin-top: 4px; color: #64748b;">Run your code to see output logic here...</div>
        </div>
      </div>
    </div>

  </div>

  <!-- Floating action buttons -->
  <div class="floating-tools">
    <div class="fab">🎙️</div>
    <div class="fab">🤖</div>
  </div>

</body>
</html>"""

# ==============================================================================
# HTML 2: CodeGalaxy AI Chat Assistant (Pure Solid White Background)
# ==============================================================================
html_chat_white = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #ffffff;
    font-family: 'Inter', -apple-system, sans-serif;
    padding: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }
  
  /* Modern High-Definition Chat Container */
  .chat-card {
    width: 520px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 28px;
    box-shadow: 0 20px 50px -10px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Header */
  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px;
    border-bottom: 1px solid #f1f5f9;
    background: #ffffff;
  }
  .bot-identity {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .bot-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #ecfdf5;
    border: 1.5px solid #10b981;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    color: #059669;
  }
  .online-indicator {
    position: absolute;
    bottom: -1px;
    right: -1px;
    width: 11px;
    height: 11px;
    background: #22c55e;
    border: 2px solid #ffffff;
    border-radius: 50%;
  }
  .title-group h2 {
    font-size: 17px;
    font-weight: 800;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .sparkle { color: #f59e0b; font-size: 15px; }
  .status-subtitle {
    font-size: 10px;
    font-weight: 800;
    color: #059669;
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
    font-size: 15px;
    transition: color 0.2s;
  }
  .icon-btn:hover { color: #0f172a; }

  /* Messages Body */
  .chat-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 22px;
    background: #f8fafc;
  }

  /* User Message */
  .user-msg-row {
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;
    gap: 10px;
  }
  .user-msg-box {
    background: #0d9488;
    color: #ffffff;
    border-radius: 20px 20px 4px 20px;
    padding: 14px 18px;
    max-width: 82%;
    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
  }
  .user-msg-text {
    font-size: 14px;
    line-height: 1.45;
    font-weight: 500;
  }
  .timestamp {
    font-size: 10px;
    color: rgba(255,255,255,0.75);
    margin-top: 6px;
    text-align: right;
  }
  .user-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #e2e8f0;
    border: 1px solid #cbd5e1;
    color: #475569;
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
    gap: 12px;
  }
  .ai-mini-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #ecfdf5;
    border: 1.5px solid #10b981;
    color: #059669;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
  .ai-msg-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 18px 20px;
    color: #1e293b;
    font-size: 13.5px;
    line-height: 1.6;
    flex: 1;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  }
  .ai-title {
    font-size: 15px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 14px;
  }

  /* Table */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 12.5px;
  }
  th, td {
    padding: 9px 12px;
    text-align: left;
    border-bottom: 1px solid #f1f5f9;
  }
  th {
    color: #0f172a;
    font-weight: 700;
    background: #f8fafc;
  }
  td:first-child {
    font-weight: 700;
    color: #475569;
    white-space: nowrap;
  }
  .code-inline {
    font-family: 'JetBrains Mono', monospace;
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
    color: #0d9488;
    font-size: 11.5px;
    font-weight: 600;
  }

  /* Footer / Input */
  .chat-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid #f1f5f9;
    background: #ffffff;
  }
  .add-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    cursor: pointer;
  }
  .input-field {
    flex: 1;
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 9999px;
    padding: 11px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #94a3b8;
    font-size: 13.5px;
  }
  .mic-icon { color: #64748b; font-size: 15px; }
  .send-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #10b981;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
          <div class="online-indicator"></div>
        </div>
        <div class="title-group">
          <h2>CodeGalaxy AI <span class="sparkle">✨</span></h2>
          <div class="status-subtitle">ACTIVE ASSISTANT</div>
        </div>
      </div>
      <div class="header-actions">
        <span class="icon-btn">🔊</span>
        <span class="icon-btn">🗑️</span>
        <span class="icon-btn">⛶</span>
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
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

# Save HTML files
html1_path = os.path.join(workspace_dir, "render_twosum.html")
html2_path = os.path.join(workspace_dir, "render_chat_white.html")

with open(html1_path, "w", encoding="utf-8") as f:
    f.write(html_twosum)

with open(html2_path, "w", encoding="utf-8") as f:
    f.write(html_chat_white)

out_twosum_png = os.path.join(workspace_dir, "challenge_workspace_white_hd.png")
out_twosum_jpg = os.path.join(workspace_dir, "challenge_workspace_white_hd.jpg")

out_chat_png = os.path.join(workspace_dir, "codegalaxy_ai_chat_white_hd.png")
out_chat_jpg = os.path.join(workspace_dir, "codegalaxy_ai_chat_white_hd.jpg")

# Render with Edge Headless
cmd1 = [
    edge_path,
    "--headless",
    "--disable-gpu",
    "--window-size=1800,920",
    f"--screenshot={out_twosum_png}",
    f"file:///{html1_path.replace(os.sep, '/')}"
]
subprocess.run(cmd1, check=True)

cmd2 = [
    edge_path,
    "--headless",
    "--disable-gpu",
    "--window-size=1200,980",
    f"--screenshot={out_chat_png}",
    f"file:///{html2_path.replace(os.sep, '/')}"
]
subprocess.run(cmd2, check=True)

# Generate high quality JPGs
im1 = Image.open(out_twosum_png).convert("RGB")
im1.save(out_twosum_jpg, "JPEG", quality=95)

im2 = Image.open(out_chat_png).convert("RGB")
im2.save(out_chat_jpg, "JPEG", quality=95)

# Copy to artifacts directory for direct chat preview
artifact_dir = r"C:\Users\harsh\.gemini\antigravity-ide\brain\13122d48-2bb4-4be0-b9a7-c0d0c249eed2"
im1.save(os.path.join(artifact_dir, "challenge_workspace_white_hd.jpg"), "JPEG", quality=95)
im2.save(os.path.join(artifact_dir, "codegalaxy_ai_chat_white_hd.jpg"), "JPEG", quality=95)

os.remove(html1_path)
os.remove(html2_path)

print("SUCCESS: Both pure-white background HD images generated!")
