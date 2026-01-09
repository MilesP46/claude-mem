# Issue Overview — Release {{X}}

**MVP-First Development Strategy**  
{{YYYY-MM-DD}} | {{N issues}} issues | {{X weeks}} MVP delivery

## MVP Definition

**Core MVP Features:**
- {{MVP core features}}
- {{MVP core features}}
- {{MVP core features}}

**MVP Success Criteria:**
{{MVP success criteria}}

**Explicitly NOT in MVP:**
- {{Post-MVP enhancements}}
- {{Post-MVP enhancements}}
- {{Post-MVP enhancements}}

## MVP Development Flow

```mermaid
%% version:1.0 – {{YYYY-MM-DD}}
flowchart TD
    START["*milestone*<br>Project Start"] --> SETUP["*phase*<br>Foundation Setup"]
    SETUP --> MVP_DEV["*phase*<br>MVP Development"]
    MVP_DEV --> MVP_DONE["*milestone*<br>MVP Complete"]
    MVP_DONE --> ENHANCE["*phase*<br>Post-MVP Enhancements"]
    ENHANCE --> FUTURE["*milestone*<br>Enhanced Product"]

    classDef component fill:#e1f5fe,color:#00223d,stroke:#01579b,stroke-width:2px
    classDef success fill:#c8e6c9,color:#1b5e20,stroke:#4caf50,stroke-width:2px

    class SETUP,MVP_DEV,ENHANCE component
    class START,MVP_DONE,FUTURE success
```


## Delivery Timeline

```mermaid
%% version:1.0 – {{YYYY-MM-DD}}
gantt
    title MVP vs Enhancement Timeline
    dateFormat YYYY-MM-DD
    axisFormat %m/%d

    section MVP Phase
    Project Setup           :milestone, mvp_start, {{YYYY-MM-DD}}, 0d
    {{MVP timeline}}        :active, mvp_dev, after mvp_start, {{X weeks}}
    MVP Complete            :milestone, mvp_done, after mvp_dev, 0d

    section Post-MVP
    Enhancement Planning    :enhance_plan, after mvp_done, 1d
    {{Enhancement timeline}} :enhance_dev, after enhance_plan, {{X weeks}}
    Enhanced Product        :milestone, enhanced_done, after enhance_dev, 0d
```

## Post-MVP Roadmap

**After MVP is established, we will add:**

### Enhancement Phase 1
- {{Post-MVP enhancements}}
- {{Post-MVP enhancements}}
- {{Post-MVP enhancements}}

### Enhancement Phase 2
- {{Post-MVP enhancements}}
- {{Post-MVP enhancements}}
- {{Post-MVP enhancements}}

**Enhancement Timeline:** {{Enhancement timeline}}

---

**MVP Target:** {{MVP timeline}} | **Enhanced Product:** {{Enhancement timeline}}
