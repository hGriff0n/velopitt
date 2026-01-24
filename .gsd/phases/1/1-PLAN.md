---
phase: 1
plan: 1
wave: 1
depends_on: []
files_modified: []
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Build status is known and documented"
    - "Test status is known and documented"
    - "Code quality baseline is established"
    - "Functional verification baseline is established"
  artifacts:
    - "Build logs"
    - "Test reports"
    - "Audit findings in .gsd/TODO.md"
    - "Requirement mapping in .gsd/REQUIREMENTS.md"
---

# Plan 1.1: Baseline Assessment

<objective>
Establish a definitive baseline of the current project state.
We need to know:
1. Does it build?
2. Does it pass tests?
3. Where are the "hackish" parts exactly?

Purpose: To inform Phase 2 (Testing) and Phase 3 (Hygiene) with concrete data.
Output: Updated .gsd/TODO.md and .gsd/STATE.md with findings.
</objective>

<context>
Load for context:
- package.json
- angular.json (if exists, to check build config)
- tsconfig.json (to check strictness)
- .gsd/SPEC.md
</context>

<tasks>

<task type="auto">
  <name>Verify Build Health</name>
  <files>.gsd/STATE.md</files>
  <action>
    Run `npm install` to ensure dependencies.
    Run `npm run build` (or `ng build`) to verify compilation.
    Capture success/failure status.
    AVOID: Fixing build errors now. Just record them.
  </action>
  <verify>Build command completes (success or failure)</verify>
  <done>Build status recorded in STATE.md</done>
</task>

<task type="auto">
  <name>Verify Test Health</name>
  <files>.gsd/STATE.md</files>
  <action>
    Run `npm test -- --watch=false --browsers=ChromeHeadless` to verify unit tests.
    Capture success/failure and coverage if available.
    AVOID: Fixing tests now. Just record status.
  </action>
  <verify>Test command completes</verify>
  <done>Test status recorded in STATE.md</done>
</task>

<task type="auto">
  <name>Codebase Quality Audit</name>
  <files>.gsd/TODO.md</files>
  <action>
    Search for known "hackish" patterns:
    - `any` usage: `grep -r ": any" src/`
    - `TODO` comments: `grep -r "TODO" src/`
    - Hardcoded secrets/tokens (heuristic)
    - `Zone.js` reliance
    Populate .gsd/TODO.md with a summary of findings.
  </action>
  <verify>Audit commands run and TODO.md updated</verify>
  <done>TODO.md contains specific technical debt items</done>
</task>

<task type="auto">
  <name>Functional Audit & Requirements Mapping</name>
  <files>.gsd/REQUIREMENTS.md</files>
  <action>
    Create .gsd/REQUIREMENTS.md.
    Verify that every Functional Requirement in SPEC.md actually exists in current code.
    Map Component/Service responsibility to each Requirement.
    Document any broken or missing features found during audit.
  </action>
  <verify>REQUIREMENTS.md exists and covers all SPEC items</verify>
  <done>Functional baseline established</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Build status is documented
- [ ] Test status is documented
- [ ] TODO.md lists specific areas for improvement
- [ ] REQUIREMENTS.md maps features to code
</verification>

<success_criteria>
- [ ] All verification steps pass
</success_criteria>
