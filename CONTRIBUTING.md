# Nirikshan (निरीक्षण) - Developer Contribution Guidelines

Welcome to the Nirikshan development team! Please read these guidelines to keep our codebase clean, secure, and visually consistent.

---

## 1. Design System: "Himal & Pagoda" Palette

To keep the platform's visual appearance premium, heritage-rooted, and highly trustworthy, **do not hardcode hex codes**. Always use the predefined Tailwind CSS utility classes.

### Color Tokens

| Name | Hex Value | Tailwind Class | Usage / Role |
| --- | --- | --- | --- |
| **Pagoda Wood** | `#2E2418` | `bg-pagoda-wood` / `text-pagoda-wood` | Headers, nav bars, primary text, primary actions |
| **Terraced Pine** | `#2C3B2A` | `bg-terraced-pine` / `text-terraced-pine` | Secondary buttons, backgrounds, depth styling |
| **Temple Brass** | `#9C7A3C` | `text-temple-brass` / `border-temple-brass` | Active states, hover states, icons, visual dividers |
| **Himalayan Mist** | `#F3EFE4` | `bg-himalayan-mist` | Page backgrounds (never use pure white `#fff`) |
| **Weathered Stone** | `#E4DCC8` | `bg-weather-stone` | Cards, table stripes, panel backgrounds |
| **Slate Basalt** | `#453F36` | `text-slate-basalt` | Body copy and description text |
| **Dust Beige** | `#CFC4A8` | `border-dust-beige` | General borders and divider lines |

### Muted Status Colors

| Name | Hex Value | Tailwind Class | Usage |
| --- | --- | --- | --- |
| **Rhododendron Green** | `#4F6B45` | `text-status-fulfilled` | Fulfilled status state |
| **Turmeric Clay** | `#8C6A32` | `text-status-delayed` | Delayed or Pending status state |
| **Charred Brick** | `#6E4438` | `text-status-broken` | Broken or cancelled promise status state |

---

## 2. Core Layout & Typography

* **Headings:** Pair a strong serif font (default: `font-serif`) for headers to evoke an official document/report feel.
* **Body:** Use `font-sans` (`Inter`) for body text with generous leading (`leading-relaxed`).
* **Borders & Corners:** Keep rounded corners minimal (e.g., `rounded-sm` or none) and sharp-ish to feel institutional rather than a modern app.

---

## 3. Git Branching & PR Workflows

### Branch Names
Always branch off `main` using the following patterns:
* Features: `feature/feature-name`
* Bug fixes: `bugfix/bug-description`
* Hotfixes: `hotfix/hotfix-description`

### Commits & PRs
1. Ensure your code builds locally without errors.
2. Submit a descriptive Pull Request (PR) detailing what changes were introduced.
3. Link the PR to the relevant task ticket or tracking issue.
