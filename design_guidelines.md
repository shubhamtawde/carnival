# Design Guidelines: New Year Carnival Scoring App

## Design Approach
**Theme-Driven Utility Design** - Combine festive carnival aesthetics with maximum functional clarity. This is a moderator tool that must be instantly usable in a party environment with potential distractions, poor lighting, and one-handed operation.

## Core Design Principles
1. **Instant Recognition** - Clear visual hierarchy with unmistakable action areas
2. **Zero Ambiguity** - Every action has obvious outcome
3. **Party-Proof** - Large touch targets, high contrast, impossible to fat-finger
4. **Festive Energy** - Celebratory without sacrificing usability

## Typography
- **Primary Font**: Poppins (Google Fonts) - rounded, friendly, highly legible
- **Hierarchy**:
  - App Title: 700 weight, 2rem (mobile), 2.5rem (tablet+)
  - Section Headers: 600 weight, 1.5rem
  - Player Names: 500 weight, 1.125rem
  - Labels/Body: 400 weight, 1rem
  - Points: 700 weight, 1.25rem (leaderboard)

## Layout System
- **Mobile Container**: Full width with px-4 padding
- **Spacing Scale**: Use Tailwind units of 3, 4, 6, 8, 12
  - Between sections: mb-8
  - Between elements: mb-4 or mb-6
  - Button padding: px-6 py-4
  - Card padding: p-6
- **Touch Targets**: Minimum 48px height for all interactive elements

## Color Strategy
- **Base**: White background (#FFFFFF) as specified
- **Carnival Accents**: 
  - Primary CTA: Vibrant magenta/hot pink for score submission
  - Secondary: Electric blue for roster actions
  - Success: Bright gold/yellow for confirmations
  - Warning: Orange for edits
  - Top 3 Podium: Gold (#FFD700), Silver (#C0C0C0), Bronze (#CD7F32) backgrounds

## Component Library

### Navigation/Header
- Fixed top bar with app title "🎪 Carnival Scorer"
- White background, subtle shadow for depth
- No navigation needed - single-page interface

### Roster Management Section
- Clean card with rounded corners (rounded-lg)
- Input field with large text (text-lg)
- "Add Player" button: Full-width on mobile, prominent electric blue
- Player list: White cards with player name + edit icon, subtle border
- Empty state: Friendly message "No players yet - add your first contestant!"

### Score Entry Section  
- Two-step visual flow:
  1. **Search/Select**: Large searchable dropdown or filtered list
  2. **Award Points**: Number input (large, centered) + optional note textarea
- Real-time search filtering as user types
- Confirmation modal: Centered overlay, frosted background, clear summary of action
- Submit button: Vivid magenta, extra large (h-14)

### Leaderboard
- **Top 3**: Enlarged cards with podium colors, confetti emoji decorations (🎉)
  - 1st: Larger scale, gold background tint
  - 2nd: Silver background tint  
  - 3rd: Bronze background tint
- **Ranks 4-10**: Compact list, alternating subtle background stripes
- Each entry: Rank badge (circular) + Name + Points (bold, right-aligned)
- Auto-refresh animation: Gentle fade-in when scores update

### Forms & Inputs
- All inputs: Large text (text-lg), thick border (border-2), rounded corners
- Focus states: Bright accent color border glow
- Validation errors: Inline below input, red text, small icon
- Number input: Center-aligned large numbers, +/- spinner buttons on mobile

### Modals/Overlays
- Confirmation dialog: Centered card, max-w-md, shadow-2xl
- Frosted backdrop: Semi-transparent dark overlay
- Clear "Cancel" (outline) vs "Confirm" (solid magenta) buttons

## Visual Enhancements
- **Micro-interactions**: 
  - Button press: Subtle scale-down (scale-95)
  - Score submission success: Brief confetti animation or celebratory icon bounce
  - Leaderboard update: Smooth position transitions
- **Badges**: Circular rank badges with contrasting text
- **Icons**: Use Heroicons for edit, search, trophy (CDN link)

## Mobile Optimization
- Bottom padding on all sections (pb-20) to prevent content hiding under thumb
- Sticky header for context retention
- Large tap targets (min 12 spacing between clickable elements)
- Single column layout throughout
- Number keyboard for point input (type="number")

## Accessibility
- High contrast ratios (4.5:1 minimum)
- Clear focus indicators on all interactive elements
- Screen reader labels for icon-only buttons
- Form labels always visible (no placeholder-only inputs)

## Key Screens Layout
1. **Main View** (vertical scroll):
   - Header (fixed)
   - Roster Management card
   - Score Entry card  
   - Leaderboard card (most space)

2. **Confirmation Modal**: Overlay with score summary

## Performance Notes
- LocalStorage only (no images to load except optional carnival icon in header)
- Minimal animations - only success feedback
- Instant filtering/search

---

**Design Intent**: Create a tool that feels celebratory and approachable while being rock-solid reliable. Moderators should feel confident, players should see scores update with satisfying visual feedback. The carnival theme adds personality without compromising the serious job of accurate scorekeeping.