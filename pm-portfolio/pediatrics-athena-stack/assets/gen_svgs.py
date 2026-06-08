#!/usr/bin/env python3
"""Generate polished SVG workflow/strategy visuals for the Athena pediatrics stack README.
No external deps. Outputs render natively as images on GitHub."""
import math, os

OUT = os.path.dirname(os.path.abspath(__file__))

# Shared palette (matches GitHub-friendly, accessible contrast)
INK = "#0d1117"; CARD = "#ffffff"; MUTE = "#57606a"; LINE = "#d0d7de"
BLUE = "#1f6feb"; GREEN = "#238636"; PURP = "#8957e5"; AMBER = "#bf8700"; RED = "#cf222e"
BG = "#f6f8fa"

def header(w, h):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
            f'viewBox="0 0 {w} {h}" font-family="Segoe UI, Helvetica, Arial, sans-serif">'
            f'<rect width="{w}" height="{h}" rx="14" fill="{BG}"/>')

def title(x, y, t, size=22, fill=INK, anchor="start", weight="700"):
    return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}">{t}</text>'

def rrect(x, y, w, h, fill, rx=12, stroke="none", sw=0, opacity=1):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke != "none" else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"{s} opacity="{opacity}"/>'

# ---------------------------------------------------------------------------
# 1) PATIENT JOURNEY FLYWHEEL — 12 operational stages in a ring + 3 weekly loops in center
# ---------------------------------------------------------------------------
def flywheel():
    W, H = 1000, 1050
    cx, cy = 500, 555
    s = [header(W, H)]
    s.append(title(cx, 52, "Luma Pediatrics — The Operating Flywheel", 28, INK, "middle"))
    s.append(title(cx, 84, "Do stages 1–12 well &#8594; weekly loops (center) re-tune the engine", 16, MUTE, "middle", "400"))
    stages = [
        ("1", "Marketing", GREEN), ("2", "Intake &amp; Consent", GREEN), ("3", "Front Desk", GREEN),
        ("4", "MA + Provider", BLUE), ("5", "Claim Sign-Off", BLUE), ("6", "Code &amp; Scrub", BLUE),
        ("7", "Denial Mgmt", BLUE), ("8", "Collect Balance", GREEN), ("9", "Reviews", GREEN),
        ("10", "Follow-Up", GREEN), ("11", "Unified Comms", GREEN), ("12", "Growth", PURP),
    ]
    n = len(stages); R = 350; node_r = 74
    # ring connector
    s.append(f'<circle cx="{cx}" cy="{cy}" r="{R}" fill="none" stroke="{LINE}" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round"/>')
    pts = []
    for i in range(n):
        ang = -math.pi/2 + i*2*math.pi/n
        x = cx + R*math.cos(ang); y = cy + R*math.sin(ang)
        pts.append((x, y))
    # arrows between consecutive nodes
    for i in range(n):
        x1, y1 = pts[i]; x2, y2 = pts[(i+1) % n]
        ax, ay = (x2-x1), (y2-y1); d = math.hypot(ax, ay)
        ux, uy = ax/d, ay/d
        sx, sy = x1+ux*node_r, y1+uy*node_r
        ex, ey = x2-ux*node_r, y2-uy*node_r
        s.append(f'<line x1="{sx:.1f}" y1="{sy:.1f}" x2="{ex:.1f}" y2="{ey:.1f}" stroke="{LINE}" stroke-width="3" marker-end="url(#ar)"/>')
    # nodes
    for (num, label, col), (x, y) in zip(stages, pts):
        s.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{node_r}" fill="{CARD}" stroke="{col}" stroke-width="3"/>')
        s.append(f'<circle cx="{x:.1f}" cy="{y-34:.1f}" r="15" fill="{col}"/>')
        s.append(title(x, y-29, num, 16, "#fff", "middle"))
        # wrap label into up to 2 lines
        words = label.split(" ")
        if len(words) > 1 and len(label) > 9:
            l1 = words[0]; l2 = " ".join(words[1:])
            s.append(title(x, y+4, l1, 15, INK, "middle"))
            s.append(title(x, y+24, l2, 15, INK, "middle"))
        else:
            s.append(title(x, y+14, label, 15, INK, "middle"))
    # center weekly loops
    s.append(f'<circle cx="{cx}" cy="{cy}" r="150" fill="{CARD}" stroke="{PURP}" stroke-width="3"/>')
    s.append(title(cx, cy-86, "WEEKLY LOOP", 15, PURP, "middle"))
    loops = [("13", "RCM Tracking"), ("14", "Revenue / Cost Analysis"), ("15", "Growth Strategy")]
    yy = cy-50
    for num, lab in loops:
        s.append(f'<circle cx="{cx-105}" cy="{yy}" r="13" fill="{PURP}"/>')
        s.append(title(cx-105, yy+5, num, 13, "#fff", "middle"))
        s.append(title(cx-82, yy+5, lab, 16, INK, "start", "600"))
        yy += 46
    s.append(title(cx, cy+118, "Goals: &#128176; revenue  &#128184; cost  &#128522; experience  &#129309; low overhead", 14, MUTE, "middle", "400"))
    # arrow marker + legend
    s.append(f'<defs><marker id="ar" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="{LINE}"/></marker></defs>')
    lx, ly = 60, 1015
    for col, lab in [(GREEN, "Patient experience"), (BLUE, "Revenue / claim"), (PURP, "Ops &amp; growth")]:
        s.append(rrect(lx, ly-14, 16, 16, col, 4)); s.append(title(lx+24, ly, lab, 14, MUTE, "start", "400")); lx += 230
    s.append("</svg>")
    open(os.path.join(OUT, "patient-flywheel.svg"), "w").write("".join(s))

# ---------------------------------------------------------------------------
# 2) FINANCIAL TRAJECTORY — grouped bars Athena vs eCW across 4 phases + tipping line
# ---------------------------------------------------------------------------
def trajectory():
    W, H = 1020, 600
    s = [header(W, H)]
    s.append(title(60, 56, "Monthly Stack Cost vs Growth &#8212; The Tipping Point", 26, INK))
    s.append(title(60, 84, "Athena % fee is cheap solo, compounds with scale. Plan the flat-fee migration at ~$200K/mo.", 15, MUTE, "start", "400"))
    # axes
    x0, y0, plotw, ploth = 120, 480, 820, 360
    s.append(f'<line x1="{x0}" y1="{y0}" x2="{x0+plotw}" y2="{y0}" stroke="{LINE}" stroke-width="2"/>')
    maxv = 11000
    for g in range(0, maxv+1, 2000):
        yy = y0 - g/maxv*ploth
        s.append(f'<line x1="{x0}" y1="{yy:.0f}" x2="{x0+plotw}" y2="{yy:.0f}" stroke="{LINE}" stroke-width="1" opacity="0.5"/>')
        s.append(title(x0-12, yy+4, f"${g//1000}k" if g else "$0", 12, MUTE, "end", "400"))
    phases = [
        ("Solo\n~$45k/mo", 2498, None),
        ("EOY1 &#8226; 2 prov\n~$90k/mo", 4996, 4108),
        ("Y2 &#8226; 3-4 prov / 2 loc\n~$150k/mo", 8150, 7096),
        ("Tipping\n>$200k/mo", 10000, 7600),
    ]
    bw = 58; group = plotw/len(phases)
    for i, (lab, ath, ecw) in enumerate(phases):
        gx = x0 + i*group + group/2
        # athena bar
        ah = min(ath, maxv)/maxv*ploth
        s.append(rrect(gx-bw-6, y0-ah, bw, ah, BLUE, 6))
        s.append(title(gx-bw/2-6, y0-ah-8, f"${ath/1000:.1f}k", 13, BLUE, "middle", "700"))
        if ecw:
            eh = min(ecw, maxv)/maxv*ploth
            s.append(rrect(gx+6, y0-eh, bw, eh, AMBER, 6))
            s.append(title(gx+bw/2+6, y0-eh-8, f"${ecw/1000:.1f}k", 13, AMBER, "middle", "700"))
        for j, ln in enumerate(lab.split("\n")):
            s.append(title(gx, y0+24+j*18, ln, 13, INK, "middle", "600" if j == 0 else "400"))
    # tipping line
    ty = y0 - 10000/maxv*ploth
    s.append(f'<line x1="{x0}" y1="{ty:.0f}" x2="{x0+plotw}" y2="{ty:.0f}" stroke="{RED}" stroke-width="2" stroke-dasharray="8 6"/>')
    s.append(title(x0+10, ty-9, "Tipping ~$10k/mo &#8594; flat-fee EHR + in-house biller wins", 13, RED, "start", "700"))
    # legend
    s.append(rrect(x0, 540, 16, 16, BLUE, 4)); s.append(title(x0+24, 553, "Athena-Lean (zero billing staff)", 14, MUTE, "start", "400"))
    s.append(rrect(x0+330, 540, 16, 16, AMBER, 4)); s.append(title(x0+354, 553, "eCW + Agentic AI RCM (+ queue labor)", 14, MUTE, "start", "400"))
    s.append("</svg>")
    open(os.path.join(OUT, "financial-trajectory.svg"), "w").write("".join(s))

# ---------------------------------------------------------------------------
# 3) LEAN BUSINESS-MODEL CANVAS
# ---------------------------------------------------------------------------
def canvas():
    W, H = 1100, 720
    s = [header(W, H)]
    s.append(title(40, 50, "Luma Pediatrics &#8212; Lean Business-Model Canvas", 26, INK))
    cells = [
        # (x,y,w,h,title,color,lines)
        (40, 80, 250, 300, "Key Partners", BLUE, ["athenahealth (EHR+RCM network)", "Yosi Health (intake/COF)", "Spruce / RingCentral (comms)", "Optum Pay ACH (835 ERA)", "State Medicaid / VFC program"]),
        (300, 80, 250, 145, "Key Activities", BLUE, ["See patients; sign same-day", "30-min/day claim supervision", "Automated recalls + reviews"]),
        (300, 235, 250, 145, "Key Resources", BLUE, ["1 pediatrician (scale to 4)", "The Athena network engine", "Zero billing headcount"]),
        (560, 80, 270, 300, "Value Proposition", GREEN, ["Lean peds practice with", "ZERO billing payroll", "FPAR &#8805;95%, payout &gt;98%", "Native AI scribe at $0", "Amazing patient UX:", "book 24/7, text-and-pay,", "never miss a call"]),
        (840, 80, 220, 145, "Customer Relationships", PURP, ["Automated, personal", "Text-first, 100+ langs", "Card-on-file trust"]),
        (840, 235, 220, 145, "Channels", PURP, ["Google Business Profile", "Referrals + reviews", "Yosi self-scheduling"]),
        (560, 390, 500, 145, "Customer Segments", PURP, ["Families w/ children 0-18", "Commercial + Medicaid/CHIP mix", "Local, growth to 2 locations"]),
        (40, 390, 510, 145, "Cost Structure", AMBER, ["Athena ~5% of collections (success-based)", "Yosi ~$199/prov + Spruce ~$49 &#8226; $0 billers/VHA", "No statements (paperless), ACH not 3% VCC"]),
        (40, 545, 510, 145, "Revenue Streams", AMBER, ["Visit reimbursement (well-child cadence)", "Vaccines (VFC + private), screeners (96110)", "Card-on-file micro-balance capture"]),
        (560, 545, 500, 145, "Unit Economics (solo, ~$45k/mo)", GREEN, ["All-in stack ~$2.5k/mo &#8226; cost-to-collect ~5.5%", "vs neighbor eCW+biller+VHA ~$3.3k/mo", "Break-even fast; renegotiate % at Month 9"]),
    ]
    for (x, y, w, h, t, col, lines) in cells:
        s.append(rrect(x, y, w, h, CARD, 10, LINE, 1.5))
        s.append(rrect(x, y, w, 6, col, 0))
        s.append(title(x+14, y+30, t, 15, col, "start", "700"))
        yy = y+56
        for ln in lines:
            s.append(title(x+14, yy, "&#8226; "+ln, 12.5, INK, "start", "400")); yy += 21
    s.append("</svg>")
    open(os.path.join(OUT, "business-model-canvas.svg"), "w").write("".join(s))

# ---------------------------------------------------------------------------
# 4) STRATEGY ON A PAGE — 3 horizons
# ---------------------------------------------------------------------------
def strategy():
    W, H = 1100, 460
    s = [header(W, H)]
    s.append(title(40, 50, "Strategy on a Page &#8212; 3 Horizons", 26, INK))
    cols = [
        (40, "HORIZON 1 &#8212; LAUNCH", "Months 0-12 &#8226; Solo &#8594; 2 providers", GREEN,
         ["Go live on Athena-Lean in 6-8 wks", "Drive FPAR &#8805;95%, Days-in-AR &lt;30", "Build review engine &#8594; #1 local rank",
          "Self-supervise billing 30 min/day", "Hire provider #2 by EOY1", "Cash buffer: 90-120 days operating"]),
        (400, "HORIZON 2 &#8212; SCALE", "Year 2 &#8226; 3-4 providers / 2 locations", BLUE,
         ["Open location #2 (Athena dropdown)", "Negotiate Athena rate &#8594; ~4% (Mo 9 hammer)", "Add part-time ops coordinator",
          "Standardize SOPs across sites", "Watch %-fee vs $200k/mo line", "Protect margin as volume compounds"]),
        (760, "HORIZON 3 &#8212; OPTIMIZE", "Year 3+ &#8226; >$200k/mo collections", PURP,
         ["Hit the tipping point deliberately", "Migrate to flat-fee EHR + in-house biller", "Keep RCM margin in-house",
          "Evaluate ancillary revenue lines", "Consider valuation / partnership", "Reinvest savings into growth"]),
    ]
    for (x, h1, h2, col, items) in cols:
        s.append(rrect(x, 80, 320, 340, CARD, 12, LINE, 1.5))
        s.append(rrect(x, 80, 320, 8, col, 0))
        s.append(title(x+18, 118, h1, 16, col, "start", "700"))
        s.append(title(x+18, 140, h2, 12.5, MUTE, "start", "400"))
        yy = 172
        for it in items:
            s.append(f'<circle cx="{x+24}" cy="{yy-4}" r="3.5" fill="{col}"/>')
            s.append(title(x+38, yy, it, 12.5, INK, "start", "400")); yy += 27
    # arrows between
    for ax in (368, 728):
        s.append(f'<path d="M{ax},250 l22,0" stroke="{LINE}" stroke-width="3" marker-end="url(#a2)"/>')
    s.append(f'<defs><marker id="a2" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="{LINE}"/></marker></defs>')
    s.append("</svg>")
    open(os.path.join(OUT, "strategy-on-a-page.svg"), "w").write("".join(s))

flywheel(); trajectory(); canvas(); strategy()
print("generated:", [f for f in os.listdir(OUT) if f.endswith(".svg")])
