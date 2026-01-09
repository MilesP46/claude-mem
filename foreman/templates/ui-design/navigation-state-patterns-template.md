# Navigation Patterns & State Transitions — Release {X}

> **Source:** `{{foreman}}/release-{{X}}/docs/00-planning/release{{X}}-specification.md` (only).  
> **Goal:** Define navigation patterns and state management strategies ensuring consistent user experience across all features and platforms.  
> **Note:** Focuses on navigation architecture, state transitions, and URL/route management patterns.

## Table of Contents

- [0) Navigation Architecture](#0-navigation-architecture)
- [1) Route Structure](#1-route-structure)
- [2) State Management](#2-state-management)
- [3) Navigation Patterns](#3-navigation-patterns)
- [4) State Transitions](#4-state-transitions)
- [5) Responsive Navigation](#5-responsive-navigation)
- [6) Deep Linking](#6-deep-linking)
- [7) Browser History Management](#7-browser-history-management)
- [8) Keyboard Navigation](#8-keyboard-navigation)
- [9) Performance Optimization](#9-performance-optimization)
- [10) Assumptions & Open Questions](#10-assumptions--open-questions)

---

## 0) Navigation Architecture

### Primary Navigation Structure

```
{{application_name}}
├── {{primary_section_1}} ({{route_pattern_1}})
│   ├── {{subsection_1_1}}
│   ├── {{subsection_1_2}} ({{route_pattern_1_2}})
│   │   ├── {{sub_subsection_1_2_1}}
│   │   ├── {{sub_subsection_1_2_2}} ({{route_pattern_1_2_2}})
│   │   │   ├── {{detail_view_1_2_2_1}}
│   │   │   └── {{detail_view_1_2_2_2}} ({{route_pattern_1_2_2_2}})
│   │   └── {{sub_subsection_1_2_3}} ({{route_pattern_1_2_3}})
│   └── {{subsection_1_3}} ({{route_pattern_1_3}})
├── {{primary_section_2}} ({{route_pattern_2}})
│   ├── {{subsection_2_1}}
│   ├── {{subsection_2_2}} ({{route_pattern_2_2}})
│   └── {{subsection_2_3}} ({{route_pattern_2_3}})
├── {{primary_section_3}} ({{route_pattern_3}})
│   ├── {{subsection_3_1}}
│   └── {{subsection_3_2}} ({{route_pattern_3_2}})
└── {{primary_section_4}} ({{route_pattern_4}})
    ├── {{subsection_4_1}} ({{route_pattern_4_1}})
    ├── {{subsection_4_2}} ({{route_pattern_4_2}})
    └── {{subsection_4_3}} ({{route_pattern_4_3}})
```

### Navigation Hierarchy Levels

1. **Level 0**: {{level_0_description}}
2. **Level 1**: {{level_1_description}}
3. **Level 2**: {{level_2_description}}
4. **Level 3**: {{level_3_description}}
5. **Level 4**: {{level_4_description}}

---

## 1) Route Structure

### URL Patterns and Components

#### {{primary_section_1}} Routes

```yaml
route_patterns:
  base: "{{base_route_pattern}}"
  routes:
    - pattern: "{{route_pattern_detail_1}}"
      component: "{{component_name_1}}"
      state_requirements: "{{state_requirements_1}}"
      refresh_behavior: "{{refresh_behavior_1}}"

    - pattern: "{{route_pattern_detail_2}}"
      component: "{{component_name_2}}"
      state_requirements: "{{state_requirements_2}}"
      tabs: "{{tab_list_2}}"

    - pattern: "{{route_pattern_detail_3}}"
      component: "{{component_name_3}}"
      state_requirements: "{{state_requirements_3}}"
      features: "{{feature_list_3}}"
```

#### {{primary_section_2}} Routes

```yaml
route_patterns:
  base: "{{base_route_pattern_2}}"
  routes:
    - pattern: "{{route_pattern_2_detail_1}}"
      component: "{{component_name_2_1}}"
      state_requirements: "{{state_requirements_2_1}}"
      actions: "{{action_list_2_1}}"

    - pattern: "{{route_pattern_2_detail_2}}"
      component: "{{component_name_2_2}}"
      state_requirements: "{{state_requirements_2_2}}"
      features: "{{feature_list_2_2}}"
```

#### {{primary_section_3}} Routes

```yaml
route_patterns:
  base: "{{base_route_pattern_3}}"
  routes:
    - pattern: "{{route_pattern_3_detail_1}}"
      component: "{{component_name_3_1}}"
      state_requirements: "{{state_requirements_3_1}}"
      real_time_features: "{{realtime_features_3_1}}"

    - pattern: "{{route_pattern_3_detail_2}}"
      component: "{{component_name_3_2}}"
      state_requirements: "{{state_requirements_3_2}}"
      capabilities: "{{capabilities_3_2}}"
```

---

## 2) State Management

### Global Application State

```yaml
application_state:
  # Authentication & User
  auth:
    is_authenticated: "{{auth_state_type}}"
    user: "{{user_object_structure}}"
    permissions: "{{permission_array_structure}}"

  # System Status
  system:
    connection_status: "{{connection_status_values}}"
    last_update: "{{timestamp_format}}"
    version: "{{version_format}}"
    health: "{{health_object_structure}}"

  # Core Data
  primary_entities:
    list: "{{entity_list_structure}}"
    active_entity: "{{active_entity_structure}}"
    loading: "{{loading_state_type}}"
    error: "{{error_state_structure}}"

  secondary_entities:
    list: "{{secondary_entity_list_structure}}"
    filters: "{{filter_structure}}"
    sorting: "{{sort_configuration}}"
    selection: "{{selection_array_type}}"
    loading: "{{loading_state_type}}"
    error: "{{error_state_structure}}"

  notifications:
    active: "{{notification_array_structure}}"
    rules: "{{rule_array_structure}}"
    history: "{{history_array_structure}}"
    unread_count: "{{unread_count_type}}"

  # UI State
  ui:
    sidebar_open: "{{boolean_type}}"
    theme: "{{theme_options}}"
    notifications: "{{ui_notification_structure}}"
    modals: "{{modal_array_structure}}"

  # Real-time Data
  realtime:
    metrics: "{{metrics_map_structure}}"
    activity_logs: "{{log_map_structure}}"
    events: "{{event_array_structure}}"
```

### Route-Specific State

```yaml
route_state:
  # Current page context
  current_route: "{{current_route_format}}"
  previous_route: "{{previous_route_format}}"
  route_params: "{{params_object_structure}}"
  query_params: "{{query_params_structure}}"

  # Navigation history
  navigation_history: "{{history_array_structure}}"
  can_go_back: "{{boolean_type}}"
  can_go_forward: "{{boolean_type}}"

  # Page-specific data
  page_data: "{{page_data_structure}}"
  page_loading: "{{boolean_type}}"
  page_error: "{{error_state_structure}}"
```

---

## 3) Navigation Patterns

### 1. Primary Navigation Flow

#### Desktop Navigation Pattern

```yaml
primary_navigation:
  dashboard:
    path: "{{dashboard_path}}"
    label: "{{dashboard_label}}"
    icon: "{{dashboard_icon}}"
    badge: "{{dashboard_badge_logic}}"
    active_matching: "{{dashboard_active_logic}}"

  primary_section_1:
    path: "{{section_1_path}}"
    label: "{{section_1_label}}"
    icon: "{{section_1_icon}}"
    badge: "{{section_1_badge_logic}}"
    active_matching: "{{section_1_active_logic}}"

  primary_section_2:
    path: "{{section_2_path}}"
    label: "{{section_2_label}}"
    icon: "{{section_2_icon}}"
    badge: "{{section_2_badge_logic}}"
    badge_color: "{{section_2_badge_color}}"
    active_matching: "{{section_2_active_logic}}"

  primary_section_3:
    path: "{{section_3_path}}"
    label: "{{section_3_label}}"
    icon: "{{section_3_icon}}"
    badge: "{{section_3_badge_logic}}"
    active_matching: "{{section_3_active_logic}}"
```

#### Contextual Navigation

```yaml
contextual_navigation:
  entity_detail:
    overview:
      path: "{{overview_path_pattern}}"
      label: "{{overview_label}}"
    activity_log:
      path: "{{activity_log_path_pattern}}"
      label: "{{activity_log_label}}"
    metrics:
      path: "{{metrics_path_pattern}}"
      label: "{{metrics_label}}"
    configuration:
      path: "{{configuration_path_pattern}}"
      label: "{{configuration_label}}"
    shell:
      path: "{{shell_path_pattern}}"
      label: "{{shell_label}}"

  host_detail:
    overview:
      path: "{{host_overview_path_pattern}}"
      label: "{{host_overview_label}}"
    entities:
      path: "{{host_entities_path_pattern}}"
      label: "{{host_entities_label}}"
    metrics:
      path: "{{host_metrics_path_pattern}}"
      label: "{{host_metrics_label}}"
    configuration:
      path: "{{host_configuration_path_pattern}}"
      label: "{{host_configuration_label}}"
```

### 2. Breadcrumb Navigation

#### Dynamic Breadcrumb Generation

```yaml
breadcrumb_patterns:
  - route_pattern: "{{route_pattern_example_1}}"
    breadcrumb_generation:
      - level: 0
        label: "{{breadcrumb_level_0_label}}"
        path: "{{breadcrumb_level_0_path}}"
        icon: "{{breadcrumb_level_0_icon}}"
      - level: 1
        label: "{{breadcrumb_level_1_label}}"
        path: "{{breadcrumb_level_1_path_pattern}}"
        dynamic_label: "{{breadcrumb_level_1_dynamic_logic}}"
      - level: 2
        label: "{{breadcrumb_level_2_dynamic_logic}}"
        path: "{{breadcrumb_level_2_path_pattern}}"
        active: true

  - route_pattern: "{{route_pattern_example_2}}"
    breadcrumb_generation:
      - level: 0
        label: "{{breadcrumb_2_level_0_label}}"
        path: "{{breadcrumb_2_level_0_path}}"
      - level: 1
        label: "{{breadcrumb_2_level_1_label}}"
        path: "{{breadcrumb_2_level_1_path_pattern}}"
      - level: 2
        label: "{{breadcrumb_2_level_2_dynamic_logic}}"
        path: "{{breadcrumb_2_level_2_path_pattern}}"
      - level: 3
        label: "{{breadcrumb_2_level_3_label}}"
        path: "{{breadcrumb_2_level_3_path_pattern}}"
        active: true
```

### 3. Quick Navigation Patterns

#### Quick Actions Menu

```yaml
quick_actions:
  - id: "{{quick_action_1_id}}"
    label: "{{quick_action_1_label}}"
    icon: "{{quick_action_1_icon}}"
    shortcut: "{{quick_action_1_shortcut}}"
    action_type: "{{quick_action_1_type}}"
    context: "{{quick_action_1_context}}"

  - id: "{{quick_action_2_id}}"
    label: "{{quick_action_2_label}}"
    icon: "{{quick_action_2_icon}}"
    shortcut: "{{quick_action_2_shortcut}}"
    action_type: "{{quick_action_2_type}}"
    context: "{{quick_action_2_context}}"

  - id: "{{quick_action_3_id}}"
    label: "{{quick_action_3_label}}"
    icon: "{{quick_action_3_icon}}"
    shortcut: "{{quick_action_3_shortcut}}"
    action_type: "{{quick_action_3_type}}"
    context: "{{quick_action_3_context}}"
```

#### Search-Driven Navigation

```yaml
search_navigation:
  result_types:
    - type: "{{search_result_type_1}}"
      title_pattern: "{{search_title_pattern_1}}"
      subtitle_pattern: "{{search_subtitle_pattern_1}}"
      path_pattern: "{{search_path_pattern_1}}"
      icon: "{{search_icon_1}}"
      priority_logic: "{{search_priority_logic_1}}"

    - type: "{{search_result_type_2}}"
      title_pattern: "{{search_title_pattern_2}}"
      subtitle_pattern: "{{search_subtitle_pattern_2}}"
      path_pattern: "{{search_path_pattern_2}}"
      icon: "{{search_icon_2}}"
      priority_logic: "{{search_priority_logic_2}}"

    - type: "{{search_result_type_3}}"
      title_pattern: "{{search_title_pattern_3}}"
      subtitle_pattern: "{{search_subtitle_pattern_3}}"
      path_pattern: "{{search_path_pattern_3}}"
      icon: "{{search_icon_3}}"
      priority_logic: "{{search_priority_logic_3}}"

  search_logic:
    entity_matching: "{{entity_search_logic}}"
    ranking_algorithm: "{{ranking_algorithm_description}}"
    result_limit: "{{search_result_limit}}"
```

---

## 4) State Transitions

### 1. Loading State Transitions

#### Page Load Sequence

```yaml
loading_states:
  idle:
    state: "{{idle_state_identifier}}"
    visual_indicator: "{{idle_visual}}"
    user_actions: "{{idle_user_actions}}"

  loading:
    state: "{{loading_state_identifier}}"
    visual_indicator: "{{loading_visual}}"
    animation: "{{loading_animation}}"
    timeout: "{{loading_timeout}}"

  success:
    state: "{{success_state_identifier}}"
    visual_indicator: "{{success_visual}}"
    animation: "{{success_animation}}"
    duration: "{{success_duration}}"

  error:
    state: "{{error_state_identifier}}"
    visual_indicator: "{{error_visual}}"
    animation: "{{error_animation}}"
    retry_options: "{{error_retry_options}}"

  refreshing:
    state: "{{refreshing_state_identifier}}"
    visual_indicator: "{{refreshing_visual}}"
    animation: "{{refreshing_animation}}"

state_transitions:
  - from: "{{transition_from_1}}"
    to: "{{transition_to_1}}"
    trigger: "{{transition_trigger_1}}"
    duration: "{{transition_duration_1}}"
    animation: "{{transition_animation_1}}"

  - from: "{{transition_from_2}}"
    to: "{{transition_to_2}}"
    trigger: "{{transition_trigger_2}}"
    duration: "{{transition_duration_2}}"
    animation: "{{transition_animation_2}}"
```

#### Entity State Transitions

```yaml
entity_states:
  unknown:
    identifier: "{{unknown_state_id}}"
    visual: "{{unknown_state_visual}}"
    actions: "{{unknown_state_actions}}"

  created:
    identifier: "{{created_state_id}}"
    visual: "{{created_state_visual}}"
    actions: "{{created_state_actions}}"

  running:
    identifier: "{{running_state_id}}"
    visual: "{{running_state_visual}}"
    actions: "{{running_state_actions}}"

  paused:
    identifier: "{{paused_state_id}}"
    visual: "{{paused_state_visual}}"
    actions: "{{paused_state_actions}}"

  restarting:
    identifier: "{{restarting_state_id}}"
    visual: "{{restarting_state_visual}}"
    actions: "{{restarting_state_actions}}"

  removing:
    identifier: "{{removing_state_id}}"
    visual: "{{removing_state_visual}}"
    actions: "{{removing_state_actions}}"

  exited:
    identifier: "{{exited_state_id}}"
    visual: "{{exited_state_visual}}"
    actions: "{{exited_state_actions}}"

  error:
    identifier: "{{error_state_id}}"
    visual: "{{error_state_visual}}"
    actions: "{{error_state_actions}}"

entity_state_transitions:
  created:
    start: "{{created_to_running_transition}}"
    remove: "{{created_to_removing_transition}}"

  running:
    stop: "{{running_to_exited_transition}}"
    pause: "{{running_to_paused_transition}}"
    restart: "{{running_to_restarting_transition}}"
    remove: "{{running_to_removing_transition}}"

  paused:
    unpause: "{{paused_to_running_transition}}"
    stop: "{{paused_to_exited_transition}}"

  exited:
    start: "{{exited_to_running_transition}}"
    remove: "{{exited_to_removing_transition}}"
```

### 2. Navigation State Transitions

#### Route Change Handling

```yaml
navigation_transitions:
  - from_pattern: "{{nav_from_pattern_1}}"
    to_pattern: "{{nav_to_pattern_1}}"
    animation: "{{nav_animation_1}}"
    preserve_scroll: "{{preserve_scroll_1}}"
    preload: "{{preload_requirement_1}}"

  - from_pattern: "{{nav_from_pattern_2}}"
    to_pattern: "{{nav_to_pattern_2}}"
    animation: "{{nav_animation_2}}"
    preserve_scroll: "{{preserve_scroll_2}}"
    preload: "{{preload_requirement_2}}"

  - from_pattern: "{{nav_from_pattern_3}}"
    to_pattern: "{{nav_to_pattern_3}}"
    animation: "{{nav_animation_3}}"
    preserve_scroll: "{{preserve_scroll_3}}"
    preload: "{{preload_requirement_3}}"
```

#### Modal State Management

```yaml
modal_states:
  closed:
    state: "{{modal_closed_state}}"
    enter_action: "{{modal_closed_enter}}"
    exit_action: "{{modal_closed_exit}}"
    duration: "{{modal_closed_duration}}"

  opening:
    state: "{{modal_opening_state}}"
    enter_action: "{{modal_opening_enter}}"
    exit_action: "{{modal_opening_exit}}"
    duration: "{{modal_opening_duration}}"

  open:
    state: "{{modal_open_state}}"
    enter_action: "{{modal_open_enter}}"
    exit_action: "{{modal_open_exit}}"
    duration: "{{modal_open_duration}}"

  closing:
    state: "{{modal_closing_state}}"
    enter_action: "{{modal_closing_enter}}"
    exit_action: "{{modal_closing_exit}}"
    duration: "{{modal_closing_duration}}"

modal_transitions:
  closed_to_opening:
    trigger: "{{closed_to_opening_trigger}}"
    animation: "{{closed_to_opening_animation}}"
    duration: "{{closed_to_opening_duration}}"

  opening_to_open:
    trigger: "{{opening_to_open_trigger}}"
    animation: "{{opening_to_open_animation}}"
    duration: "{{opening_to_open_duration}}"

  open_to_closing:
    trigger: "{{open_to_closing_trigger}}"
    animation: "{{open_to_closing_animation}}"
    duration: "{{open_to_closing_duration}}"

  closing_to_closed:
    trigger: "{{closing_to_closed_trigger}}"
    animation: "{{closing_to_closed_animation}}"
    duration: "{{closing_to_closed_duration}}"
```

---

## 5) Responsive Navigation

### 1. Breakpoint-Specific Navigation

#### Desktop Navigation (≥{{desktop_breakpoint}})

```yaml
desktop_navigation:
  layout: "{{desktop_nav_layout}}"
  sidebar: "{{desktop_sidebar_behavior}}"
  breadcrumbs: "{{desktop_breadcrumb_style}}"
  quick_actions: "{{desktop_quick_actions}}"
  search: "{{desktop_search_style}}"
```

#### Tablet Navigation ({{tablet_breakpoint_range}})

```yaml
tablet_navigation:
  layout: "{{tablet_nav_layout}}"
  sidebar: "{{tablet_sidebar_behavior}}"
  breadcrumbs: "{{tablet_breadcrumb_style}}"
  quick_actions: "{{tablet_quick_actions}}"
  search: "{{tablet_search_style}}"
```

#### Mobile Navigation (≤{{mobile_breakpoint}})

```yaml
mobile_navigation:
  layout: "{{mobile_nav_layout}}"
  sidebar: "{{mobile_sidebar_behavior}}"
  breadcrumbs: "{{mobile_breadcrumb_style}}"
  quick_actions: "{{mobile_quick_actions}}"
  search: "{{mobile_search_style}}"
```

### 2. Touch Navigation Patterns

#### Swipe Gestures

```yaml
swipe_gestures:
  - direction: "{{swipe_direction_1}}"
    context: "{{swipe_context_1}}"
    action: "{{swipe_action_1}}"
    threshold: "{{swipe_threshold_1}}"
    feedback: "{{swipe_feedback_1}}"

  - direction: "{{swipe_direction_2}}"
    context: "{{swipe_context_2}}"
    action: "{{swipe_action_2}}"
    threshold: "{{swipe_threshold_2}}"
    feedback: "{{swipe_feedback_2}}"

  - direction: "{{swipe_direction_3}}"
    context: "{{swipe_context_3}}"
    action: "{{swipe_action_3}}"
    threshold: "{{swipe_threshold_3}}"
    feedback: "{{swipe_feedback_3}}"

  - direction: "{{swipe_direction_4}}"
    context: "{{swipe_context_4}}"
    action: "{{swipe_action_4}}"
    threshold: "{{swipe_threshold_4}}"
    feedback: "{{swipe_feedback_4}}"
```

---

## 6) Deep Linking

### URL Structure and Parameters

#### Primary Entity Deep Links

```yaml
entity_deep_links:
  direct_access:
    pattern: "{{direct_entity_pattern}}"
    example: "{{direct_entity_example}}"

  entity_with_view:
    pattern: "{{entity_view_pattern}}"
    example: "{{entity_view_example}}"
    query_params: "{{entity_view_query_params}}"

  entity_metrics:
    pattern: "{{entity_metrics_pattern}}"
    example: "{{entity_metrics_example}}"
    query_params: "{{entity_metrics_query_params}}"

  entity_shell:
    pattern: "{{entity_shell_pattern}}"
    example: "{{entity_shell_example}}"
    query_params: "{{entity_shell_query_params}}"
```

#### Host Deep Links

```yaml
host_deep_links:
  host_overview:
    pattern: "{{host_overview_pattern}}"
    example: "{{host_overview_example}}"

  host_entities_filtered:
    pattern: "{{host_entities_pattern}}"
    example: "{{host_entities_example}}"
    query_params: "{{host_entities_query_params}}"

  host_metrics_dashboard:
    pattern: "{{host_metrics_pattern}}"
    example: "{{host_metrics_example}}"
    query_params: "{{host_metrics_query_params}}"
```

#### Management Deep Links

```yaml
management_deep_links:
  specific_item:
    pattern: "{{management_item_pattern}}"
    example: "{{management_item_example}}"

  filtered_rules:
    pattern: "{{management_rules_pattern}}"
    example: "{{management_rules_example}}"
    query_params: "{{management_rules_query_params}}"

  historical_data:
    pattern: "{{management_history_pattern}}"
    example: "{{management_history_example}}"
    query_params: "{{management_history_query_params}}"
```

### Deep Link Resolution

```yaml
deep_link_resolvers:
  - pattern: "{{resolver_pattern_1}}"
    component: "{{resolver_component_1}}"
    preload_requirements: "{{resolver_preload_1}}"
    fallback_route: "{{resolver_fallback_1}}"

  - pattern: "{{resolver_pattern_2}}"
    component: "{{resolver_component_2}}"
    preload_requirements: "{{resolver_preload_2}}"
    fallback_route: "{{resolver_fallback_2}}"

  - pattern: "{{resolver_pattern_3}}"
    component: "{{resolver_component_3}}"
    preload_requirements: "{{resolver_preload_3}}"
    fallback_route: "{{resolver_fallback_3}}"
```

---

## 7) Browser History Management

### History Stack Management

```yaml
history_management:
  entry_structure:
    path: "{{history_path_format}}"
    state: "{{history_state_format}}"
    timestamp: "{{history_timestamp_format}}"
    title: "{{history_title_format}}"

  navigation_methods:
    forward_navigation:
      behavior: "{{forward_nav_behavior}}"
      state_handling: "{{forward_state_handling}}"
      conflict_resolution: "{{forward_conflict_resolution}}"

    back_navigation:
      behavior: "{{back_nav_behavior}}"
      state_handling: "{{back_state_handling}}"
      validation: "{{back_nav_validation}}"

    replace_navigation:
      behavior: "{{replace_nav_behavior}}"
      use_cases: "{{replace_nav_use_cases}}"
      state_preservation: "{{replace_state_preservation}}"

  history_limits:
    max_entries: "{{max_history_entries}}"
    cleanup_strategy: "{{history_cleanup_strategy}}"
    storage_method: "{{history_storage_method}}"
```

### State Preservation

```yaml
view_state_preservation:
  preserved_state:
    scroll_position: "{{scroll_position_format}}"
    filters: "{{filters_preservation_format}}"
    selection: "{{selection_preservation_format}}"
    sort_order: "{{sort_preservation_format}}"
    expanded_items: "{{expanded_items_format}}"

  preservation_strategy:
    storage_method: "{{state_storage_method}}"
    expiration_policy: "{{state_expiration_policy}}"
    cleanup_triggers: "{{state_cleanup_triggers}}"

  restoration_logic:
    immediate_restoration: "{{immediate_restoration_items}}"
    lazy_restoration: "{{lazy_restoration_items}}"
    validation_requirements: "{{restoration_validation}}"
```

---

## 8) Keyboard Navigation

### Keyboard Shortcuts

```yaml
keyboard_shortcuts:
  global_shortcuts:
    - key: "{{global_key_1}}"
      modifiers: "{{global_modifiers_1}}"
      action: "{{global_action_1}}"
      description: "{{global_description_1}}"

    - key: "{{global_key_2}}"
      modifiers: "{{global_modifiers_2}}"
      action: "{{global_action_2}}"
      description: "{{global_description_2}}"

  navigation_shortcuts:
    - key: "{{nav_key_1}}"
      modifiers: "{{nav_modifiers_1}}"
      action: "{{nav_action_1}}"
      description: "{{nav_description_1}}"

    - key: "{{nav_key_2}}"
      modifiers: "{{nav_modifiers_2}}"
      action: "{{nav_action_2}}"
      description: "{{nav_description_2}}"

  list_navigation:
    - key: "{{list_key_1}}"
      context: "{{list_context_1}}"
      action: "{{list_action_1}}"
      description: "{{list_description_1}}"

    - key: "{{list_key_2}}"
      context: "{{list_context_2}}"
      action: "{{list_action_2}}"
      description: "{{list_description_2}}"

  entity_actions:
    - key: "{{entity_key_1}}"
      context: "{{entity_context_1}}"
      action: "{{entity_action_1}}"
      description: "{{entity_description_1}}"

    - key: "{{entity_key_2}}"
      context: "{{entity_context_2}}"
      action: "{{entity_action_2}}"
      description: "{{entity_description_2}}"
```

---

## 9) Performance Optimization

### Route Performance

```yaml
route_performance:
  lazy_loading:
    strategy: "{{lazy_loading_strategy}}"
    chunk_splitting: "{{chunk_splitting_approach}}"
    preload_priority: "{{preload_priority_rules}}"

  caching_strategy:
    route_data: "{{route_data_caching}}"
    component_cache: "{{component_caching}}"
    state_cache: "{{state_caching_strategy}}"

  optimization_targets:
    initial_load: "{{initial_load_target}}"
    route_transitions: "{{transition_performance_target}}"
    memory_usage: "{{memory_usage_target}}"
```

### State Performance

```yaml
state_performance:
  update_optimization:
    batching_strategy: "{{state_batching_strategy}}"
    debouncing: "{{state_debouncing_config}}"
    selective_updates: "{{selective_update_logic}}"

  memory_management:
    cleanup_triggers: "{{state_cleanup_triggers}}"
    gc_strategy: "{{garbage_collection_strategy}}"
    cache_limits: "{{state_cache_limits}}"

  real_time_optimization:
    update_frequency: "{{realtime_update_frequency}}"
    throttling: "{{realtime_throttling_config}}"
    connection_pooling: "{{connection_pooling_strategy}}"
```

---

## 10) Assumptions & Open Questions

- [ ] {{Navigation_architecture_assumption}}
- [ ] {{State_management_assumption}}
- [ ] {{Performance_constraint_question}}
- [ ] {{Browser_compatibility_question}}
- [ ] {{Mobile_navigation_requirement_question}}
