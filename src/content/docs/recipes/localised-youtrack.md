---
title: A localised YouTrack instance
description: Field names in another language, non-English ticket prose, and a long state ladder.
sidebar:
  order: 6
---

A YouTrack instance set to French calls the state field `État` and the assignee `Responsable`. The adapter reads both fields by name, so tell it the names this instance uses:

```json
"youtrack": { "stateField": "État", "assigneeField": "Responsable" }
```

The wizard proposes the project's real state and user fields and asks. Both keys default to the English names when absent, so a config that predates them behaves as before. The field is never selected by its type, because a project can drive its ladder from an ordinary enum field and a guess would be silently wrong there.

Without the keys every read returns unknown, and since a write is judged by the state **changing**, every successful move reports as a failure. That is the symptom to recognise.

A renamed or localised subtask link type goes in the same block as `subtaskLinkType`; `split` will not guess it.

## Ticket prose in the instance's language

```json
"language": "French"
```

`/dev-task` and `/dev-bug` write issue titles and bodies in that language. Code identifiers, paths, endpoints and error messages stay verbatim.

## A ladder longer than three rungs

```json
"states": {
  "ladder": ["Submitted", "Open", "In Progress", "In Review", "Staging", "Ready For Production", "Live on Production"],
  "start": "In Progress",
  "review": "In Review",
  "done": "Staging",
  "abandon": "Open"
}
```

`ladder` is every state the project has, so a session never invents one. Only `start`, `review` and `done` are applied by the skills. `done` is whatever the project treats as finished; here work is done at `Staging`, and the states after it are moved by hand. `sync` only ever moves forward along the ladder and never touches a state off it.

## State names the wizard read for you

`dw init` reads the project's real State, Type and Priority values off the API, so the ladder above comes from the instance, not from memory. To re-read them after the project's workflow changes:

```bash
dw update --reconfigure
```

## Verify a write path once

The commands API returns 200 for commands it did not apply, so a dry run proves nothing. Move one ticket for real and read the state line back:

```bash
node _dev-workflow/scripts/dev.mjs update ABC-42 state start
```

The printed state is what the tracker reported afterwards. Trust that line, not the exit code.
