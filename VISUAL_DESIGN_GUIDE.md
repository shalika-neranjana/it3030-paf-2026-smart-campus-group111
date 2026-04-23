# Notifications Module - Visual Design Guide

## 🎨 Design Overview

The Notifications Inbox implements a modern, professional UI following contemporary messaging application patterns. It's built with clean typography, intuitive navigation, and a cohesive color system.

## 📐 Layout Structure

### Main Container Layout
```
┌─────────────────────────────────────────────┐
│         Notifications Header                │
│  Bell Icon | Title | Unread Count | Button  │
├──────────────────────────────────────────────┤
│         Search & Filter Section              │
│  [Search Box] [Type Filter] [Status Filter]  │
├────────────────────┬────────────────────────┤
│                    │                         │
│   Notifications    │    Notification Details │
│   List (Left)      │    Panel (Right)        │
│                    │                         │
│                    │                         │
│                    │                         │
└────────────────────┴────────────────────────┘
```

### Responsive Breakpoints

#### Desktop (1024px+)
```
Full Side-by-Side Layout
[Left: List (60%)] [Right: Details (40%)]
```

#### Tablet (768px-1023px)
```
Stacked Layout
[List (Full Width)]
[Details (Full Width, Below)]
```

#### Mobile (480px-767px)
```
Single Column
[List or Details - Toggle View]
```

#### Small Mobile (<480px)
```
Optimized Single Column
[Compact List Items]
[Full-width Details]
```

## 🎯 Component Breakdowns

### 1. Header Section

**Visual Hierarchy**
```
┌─────────────────────────────────────────────┐
│ 🔔 Inbox Messages          ✓ Mark all read │
│    5 unread notifications                   │
└─────────────────────────────────────────────┘
```

**Components**:
- Bell icon (28px, primary blue)
- Title (1.75rem, bold)
- Subtitle (0.875rem, secondary text)
- Action button (primary color, hover effect)

**Styling**:
- Background: Gradient white to light gray
- Padding: 1.5rem
- Border-bottom: 1px light gray
- Box shadow: Subtle

### 2. Search & Filters Section

**Visual Layout**
```
┌─────────────────────────────────────────────┐
│ [Search icon] Search notifications...       │
│ Type: [▼ All Types]  Status: [▼ All Messages]│
└─────────────────────────────────────────────┘
```

**Search Box**:
- Icon on left (20px gray)
- Placeholder text
- Focus state: Blue border + light blue outline
- Height: 40px
- Padding: 0.75rem
- Border-radius: 8px

**Filter Dropdowns**:
- Label above (small, uppercase)
- Rounded corners (8px)
- Border on focus
- Min-width: 150px

### 3. Notification List

#### Single Notification Item - Unread

```
┌─────────────────────────────────────────────────┐
│ ✓    Booking Approved              2h ago   →   │
│ [🟢] Your booking for "Lecture Hall A" has...  │
│      Lecture Hall A        [APPROVED]           │
│      ● (unread indicator)                       │
└─────────────────────────────────────────────────┘
```

**Unread State**:
- Background: Light blue (#dbeafe)
- Left border: 4px blue
- Icon background: Light green (#d1fae5)
- Unread dot: 8px blue circle

**Hover State**:
- Background: Slightly darker blue
- Chevron icon: Visible and blue

#### Single Notification Item - Read

```
┌─────────────────────────────────────────────────┐
│ ✓    Booking Approved              2h ago   →   │
│ [🟢] Your booking for "Lecture Hall A" has...  │
│      Lecture Hall A        [APPROVED]           │
└─────────────────────────────────────────────────┘
```

**Read State**:
- Background: White
- Icon background: Light green (#d1fae5)
- No unread indicator

**Active State** (Selected):
- Background: Very light gray
- Left border: 3px blue (active indicator)
- Chevron: More visible

### 4. Notification Type Badges

```
┌────────────────────────────────────────────┐
│ Badge Type           Color    Background   │
├────────────────────────────────────────────┤
│ [APPROVED]          Green    Light Green   │
│ [REJECTED]          Red      Light Red     │
│ [PENDING]           Indigo   Light Indigo  │
│ [UPDATED]           Blue     Light Blue    │
│ [COMMENT]           Amber    Light Amber   │
└────────────────────────────────────────────┘
```

**Badge Styling**:
- Font size: 0.75rem
- Font weight: 600
- Padding: 0.25rem 0.75rem
- Border-radius: 12px
- Uppercase text
- No border

### 5. Notification Details Panel

**Header**
```
┌─────────────────────────────────┐
│ Notification Details        × │
└─────────────────────────────────┘
```

**Detail Section**
```
┌─────────────────────────────────┐
│ [Icon]  Booking Approved        │
│ [🟢]    April 22, 2026 2:30 PM  │
│                                  │
│ [APPROVED]  [Read]              │
│                                  │
│ Message                          │
│ Your booking for "Lecture Hall  │
│ A" on April 25, 2026 from 10:00 │
│ AM to 12:00 PM has been...      │
│                                  │
│ Related Resource                 │
│ ┌──────────────────────────────┐ │
│ │ 🔵 Lecture Hall A           │ │
│ └──────────────────────────────┘ │
│                                  │
│ [Mark as unread] [Delete]      │
└─────────────────────────────────┘
```

**Close Button**:
- Position: Top-right
- Style: Ghost button
- Size: 32px × 32px
- Icon: "×" (1.5rem)

**Detail Icon**:
- Size: 56px × 56px
- Border-radius: 12px
- Centered within
- Color matched to type

### 6. Empty State

```
┌─────────────────────────────────┐
│                                  │
│            📭                    │
│      No notifications            │
│   Your inbox is empty            │
│                                  │
└─────────────────────────────────┘
```

**Design**:
- Icon: 48px, light gray
- Title: Bold, primary text
- Subtitle: Secondary text, smaller
- Centered, full height

### 7. Loading State

```
┌─────────────────────────────────┐
│            ⟳                    │
│    Loading notifications...     │
└─────────────────────────────────┘
```

**Design**:
- Spinner animation (8 frames, 0.8s)
- Text below spinner
- Secondary text color

## 🎨 Color System

### Notification Type Colors

| Type | Primary | Light | Usage |
|------|---------|-------|-------|
| **Booking Approved** | #10b981 | #d1fae5 | Approvals |
| **Booking Rejected** | #ef4444 | #fee2e2 | Rejections |
| **Booking Pending** | #6366f1 | #e0e7ff | Awaiting |
| **Ticket Updated** | #3b82f6 | #dbeafe | Changes |
| **New Comment** | #f59e0b | #fef3c7 | Interactions |

### Neutral Colors

| Element | Color | Hex |
|---------|-------|-----|
| Primary Text | Dark Gray | #1f2937 |
| Secondary Text | Gray | #6b7280 |
| Tertiary Text | Light Gray | #9ca3af |
| Background Primary | White | #ffffff |
| Background Secondary | Off-white | #f9fafb |
| Background Tertiary | Light Gray | #f3f4f6 |
| Borders | Light Gray | #e5e7eb |

### Action Colors

| Action | Color | Hex |
|--------|-------|-----|
| Primary Button | Blue | #3b82f6 |
| Button Hover | Darker Blue | #2563eb |
| Success | Green | #10b981 |
| Error | Red | #ef4444 |
| Warning | Amber | #f59e0b |

## 📏 Typography System

### Heading Hierarchy

```
H1: Inbox Messages (1.75rem, 700 weight)
    ↓
H2: Notification Details (1.125rem, 700 weight)
    ↓
H3: Title / Resource (0.95rem, 600 weight)
    ↓
H4: Section Headers (0.875rem, 600 weight, uppercase)
    ↓
Body: Message (0.875-0.95rem, 400-500 weight)
    ↓
Meta: Timestamps (0.75-0.8rem, 400 weight)
```

### Font Weights
- 400: Body text
- 500: Secondary headings
- 600: Section headers
- 700: Main headings

### Line Heights
- Headings: 1.2
- Body: 1.6
- Meta: 1.4

## 📐 Spacing System

### Padding & Margins

```
Micro:     0.25rem (4px)
Extra Small: 0.5rem (8px)
Small:     0.75rem (12px)
Base:      1rem (16px)
Medium:    1.5rem (24px)
Large:     2rem (32px)
Extra Large: 3rem (48px)
```

### Common Patterns
- List items: 1rem padding (vertical), 1rem (horizontal)
- Cards: 1rem border-radius
- Headers: 1.5rem padding
- Sections: 1.5rem padding

## 🎭 Interactive States

### Button States

**Default State**
```
┌─────────────────┐
│  Mark all read  │ ← Normal, gray background
└─────────────────┘
```

**Hover State**
```
┌─────────────────┐
│  Mark all read  │ ← Background darker, shadow
└─────────────────┘
```

**Active State**
```
┌─────────────────┐
│  Mark all read  │ ← Pressed appearance
└─────────────────┘
```

### Input States

**Default**
```
[Search notifications...] ← Border gray, placeholder text
```

**Focus**
```
[Search notifications...] ← Border blue, outline light blue
```

**Filled**
```
[Search text here] ← Normal with text
```

### List Item States

**Default**
```
┌─────────────────────┐
│ Notification item   │ ← White background
└─────────────────────┘
```

**Hover**
```
┌─────────────────────┐
│ Notification item   │ ← Light gray background
└─────────────────────┘
```

**Active/Selected**
```
┌─────────────────────┐
│ Notification item   │ ← Light gray with blue border
└─────────────────────┘
```

## 📱 Mobile Adaptations

### Small Screen Adjustments

**Header**
- Font sizes reduced by 10%
- Padding reduced to 1rem
- Button full width on very small screens

**List Items**
- Icons remain same size
- Text wraps at smaller widths
- Actions stack vertically if needed

**Details Panel**
- Full width on tablet/mobile
- Appears below list instead of beside
- Close button more prominent

**Filters**
- Stack vertically on small screens
- Full-width dropdowns
- Search box full width

## 🎯 Focus & Accessibility Indicators

### Keyboard Focus

**Focus Ring**
```
┌─ ─ ─ ─ ─ ─ ─ ┐
┌──────────────┐│
│  Button      ││
└──────────────┘│
└─ ─ ─ ─ ─ ─ ─ ┘
```

- 2px solid blue outline
- 2px offset from element
- Visible on all interactive elements

### Focus Order
1. Search input
2. Filter dropdowns
3. Notification list items
4. Detail panel buttons
5. Close button

## 🌙 Dark Mode Ready

Current implementation is light-themed. To implement dark mode:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1f2937;
    --bg-secondary: #111827;
    --text-primary: #f3f4f6;
    --text-secondary: #d1d5db;
    /* ... more variables ... */
  }
}
```

## 🎬 Animations

### Loading Spinner
```
Rotation: 360° over 0.8s
Timing: Linear
Repeat: Infinite
```

### Button Interactions
- Hover: 200ms ease transition
- Active: Immediate
- Disabled: No animation

### Transitions
```css
transition: all 0.2s ease;
```

### Hover Effects
- Background color shift
- Shadow elevation
- Icon color change
- 200ms duration

## 📊 Responsive Typography Scaling

| Screen | H1 | H2 | Body |
|--------|----|----|------|
| Desktop (1024px+) | 1.75rem | 1.125rem | 0.95rem |
| Tablet (768px) | 1.5rem | 1rem | 0.875rem |
| Mobile (480px) | 1.25rem | 0.95rem | 0.8rem |

## 🎨 CSS Custom Properties Usage

```css
/* In component */
color: var(--text-primary);
background: var(--bg-secondary);
border-color: var(--border-color);

/* Easy to customize globally */
:root {
  --primary-color: #3b82f6; /* Change once, affects entire app */
}
```

## 🔄 Scrollbar Styling

```css
/* Webkit browsers */
::-webkit-scrollbar {
  width: 8px;
  background: var(--bg-tertiary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}
```

**Styling**:
- Width: 8px
- Background: Light gray
- Thumb: Medium gray
- Hover: Darker gray
- Border-radius: 4px

## 🌐 Visual Consistency

### Component Sizing
- Icons: 18-48px (consistent sizes)
- Buttons: 40px height (touch-friendly)
- List items: 80px minimum height
- Details panel: 380px width (desktop)

### Radius System
- Small: 6px (inputs, small buttons)
- Medium: 8px (cards, large buttons)
- Large: 12px (panels, large elements)

### Shadow System
- SM: 0 1px 2px rgba(0,0,0,0.05)
- MD: 0 4px 6px rgba(0,0,0,0.1)
- LG: 0 10px 15px rgba(0,0,0,0.1)

## ✅ Design Checklist

- [x] Color system defined
- [x] Typography hierarchy established
- [x] Spacing system consistent
- [x] Interactive states clear
- [x] Accessibility features included
- [x] Responsive breakpoints covered
- [x] Dark mode prepared
- [x] Animation guidelines set
- [x] Focus indicators visible
- [x] Component sizing standardized

---

This design guide ensures visual consistency and provides a foundation for future enhancements!
