# Component Mockups — Release {X}

> **Source:** `{{foreman}}/release-{{X}}/docs/00-planning/release{{X}}-specification.md` (only).  
> **Goal:** Define detailed UI component mockups including states, behaviors, and responsive adaptations for all interactive elements.  
> **Note:** Focuses on visual component design and interaction states, not implementation details.

## Table of Contents

- [0) Overview](#0-overview)
- [1) Core Components](#1-core-components)
- [2) Data Display Components](#2-data-display-components)
- [3) Form Components](#3-form-components)
- [4) Navigation Components](#4-navigation-components)
- [5) Modal & Dialog Components](#5-modal--dialog-components)
- [6) Real-time Components](#6-real-time-components)
- [7) Mobile-Specific Components](#7-mobile-specific-components)
- [8) Component Interaction States](#8-component-interaction-states)
- [9) Component Cross-Reference Matrix](#9-component-cross-reference-matrix)
- [10) Design Tokens & Variables](#10-design-tokens--variables)
- [11) Animation & Transition Specifications](#11-animation--transition-specifications)
- [12) Assumptions & Open Questions](#12-assumptions--open-questions)

---

## 0) Overview

- **Project:** {{project_name}}
- **Target Platforms:** {{platforms}}
- **Design System:** {{design_system}}
- **Component Count:** {{total_component_count}}

---

## 1) Core Components

### Component: {{Component Name}} — `CM-001`

**Purpose:** {{component_purpose_and_user_value}}  
**Used in:** {{flow_references}}  
**Component Type:** {{card|button|input|display|navigation|modal}}

#### Default State

```
{{ascii_art_mockup_default}}
```

#### Hover State

```
{{ascii_art_mockup_hover}}
```

#### Active/Focus State

```
{{ascii_art_mockup_active}}
```

#### Error State

```
{{ascii_art_mockup_error}}
```

#### Loading State

```
{{ascii_art_mockup_loading}}
```

#### Disabled State

```
{{ascii_art_mockup_disabled}}
```

#### Component Specifications

**Properties:**

- {{prop_name}}: {{prop_type}} — {{prop_description}}
- {{prop_name_2}}: {{prop_type_2}} — {{prop_description_2}}
- onAction: {{action_callback_description}}
- size: {{size_options}} — Controls component dimensions
- variant: {{variant_options}} — Visual style variations
- disabled: {{boolean}} — Prevents user interaction
- loading: {{boolean}} — Shows loading state

**Internal State:**

- {{state_property}}: {{state_type}} — {{state_description}}
- {{state_property_2}}: {{state_type_2}} — {{state_description_2}}
- lastUpdated: {{timestamp}} — Last state update time

#### Responsive Behavior

- **Desktop (≥1024px):** {{desktop_behavior}}
- **Tablet (768px-1023px):** {{tablet_behavior}}
- **Mobile (≤767px):** {{mobile_behavior}}

#### Accessibility Features

- **ARIA Labels:** {{aria_label_strategy}}
- **Keyboard Navigation:** {{keyboard_behavior}}
- **Screen Reader:** {{screen_reader_announcements}}

---

## 2) Data Display Components

### Component: {{Data Component Name}} — `CM-002`

**Purpose:** {{data_display_purpose}}  
**Data Sources:** {{data_source_types}}

#### Default View

```
{{ascii_art_data_display_default}}
```

#### Empty State

```
{{ascii_art_data_display_empty}}
```

#### Loading State

```
{{ascii_art_data_display_loading}}
```

#### Error State

```
{{ascii_art_data_display_error}}
```

#### Pagination/Infinite Scroll

```
{{ascii_art_data_display_pagination}}
```

---

## 3) Form Components

### Component: {{Form Component Name}} — `CM-003`

**Purpose:** {{form_component_purpose}}  
**Validation:** {{validation_strategy}}

#### Default Form State

```
{{ascii_art_form_default}}
```

#### Validation Error State

```
{{ascii_art_form_validation_error}}
```

#### Success State

```
{{ascii_art_form_success}}
```

#### Multi-step Form Flow

```
{{ascii_art_form_multistep}}
```

---

## 4) Navigation Components

### Component: {{Navigation Component Name}} — `CM-004`

**Purpose:** {{navigation_purpose}}  
**Navigation Type:** {{primary|secondary|contextual|breadcrumb}}

#### Desktop Navigation

```
{{ascii_art_navigation_desktop}}
```

#### Mobile Navigation

```
{{ascii_art_navigation_mobile}}
```

#### Active State Indicators

```
{{ascii_art_navigation_active_states}}
```

---

## 5) Modal & Dialog Components

### Component: {{Modal Component Name}} — `CM-005`

**Purpose:** {{modal_purpose}}  
**Trigger Conditions:** {{modal_trigger_conditions}}

#### Modal Layout

```
{{ascii_art_modal_layout}}
```

#### Confirmation Dialog

```
{{ascii_art_confirmation_dialog}}
```

#### Multi-step Modal

```
{{ascii_art_multistep_modal}}
```

---

## 6) Real-time Components

### Component: {{Realtime Component Name}} — `CM-006`

**Purpose:** {{realtime_component_purpose}}  
**Update Frequency:** {{update_frequency}}

#### Live Data Display

```
{{ascii_art_realtime_display}}
```

#### Connection Status Indicators

```
{{ascii_art_connection_status}}
```

#### Data Refresh States

```
{{ascii_art_refresh_states}}
```

---

## 7) Mobile-Specific Components

### Component: {{Mobile Component Name}} — `CM-007`

**Purpose:** {{mobile_specific_purpose}}  
**Gesture Support:** {{supported_gestures}}

#### Touch-Optimized Layout

```
{{ascii_art_mobile_layout}}
```

#### Swipe Actions

```
{{ascii_art_swipe_actions}}
```

#### Pull-to-Refresh

```
{{ascii_art_pull_to_refresh}}
```

---

## 8) Component Interaction States

### Loading States

- **Skeleton Loading:** {{skeleton_loading_pattern}}
- **Spinner Loading:** {{spinner_loading_pattern}}
- **Progress Bars:** {{progress_bar_pattern}}
- **Pulse Animation:** {{pulse_animation_pattern}}

### Error States

- **Inline Errors:** {{inline_error_pattern}}
- **Banner Errors:** {{banner_error_pattern}}
- **Toast Errors:** {{toast_error_pattern}}
- **Empty States:** {{empty_state_pattern}}

### Success States

- **Confirmation Animations:** {{success_animation_pattern}}
- **Toast Notifications:** {{success_toast_pattern}}
- **State Transitions:** {{transition_animation_pattern}}
- **Visual Feedback:** {{visual_feedback_pattern}}

---

## 9) Component Cross-Reference Matrix

| Component ID | Component Name       | Used in Flows    | States Included             | Responsive | Accessibility  |
| -----------: | -------------------- | ---------------- | --------------------------- | ---------- | -------------- |
|       CM-001 | {{component_name}}   | {{F-001, F-002}} | {{default, hover, error}}   | {{yes/no}} | {{WCAG_level}} |
|       CM-002 | {{component_name_2}} | {{F-003}}        | {{default, loading, empty}} | {{yes/no}} | {{WCAG_level}} |

---

## 10) Design Tokens & Variables

### Color Tokens

```yaml
colors:
  primary: "{{primary_color_value}}"
  secondary: "{{secondary_color_value}}"
  success: "{{success_color_value}}"
  warning: "{{warning_color_value}}"
  error: "{{error_color_value}}"
  neutral: "{{neutral_color_values}}"
```

### Typography Tokens

```yaml
typography:
  font_family: "{{font_family}}"
  font_sizes: { { font_size_scale } }
  font_weights: { { font_weight_scale } }
  line_heights: { { line_height_scale } }
```

### Spacing Tokens

```yaml
spacing:
  base_unit: "{{base_spacing_unit}}"
  scale: { { spacing_scale } }
  component_padding: { { component_padding_values } }
  component_margin: { { component_margin_values } }
```

---

## 11) Animation & Transition Specifications

### Micro-interactions

- **Hover Transitions:** {{hover_transition_duration_and_easing}}
- **Focus Indicators:** {{focus_animation_spec}}
- **Button Press:** {{button_press_animation}}
- **Loading Spinners:** {{loading_animation_spec}}

### Page Transitions

- **Route Changes:** {{page_transition_animation}}
- **Modal Animations:** {{modal_animation_spec}}
- **Slide Transitions:** {{slide_animation_spec}}

---

## 12) Assumptions & Open Questions

- [ ] {{Component_assumption_or_question}}
- [ ] {{Design_system_assumption}}
- [ ] {{Platform_specific_question}}
- [ ] {{Accessibility_requirement_question}}
