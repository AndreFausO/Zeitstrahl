# Zeitstrahl data model and simple imports

The application still reads the same six files in `data/`. Five contain arrays of records; `vocabularies.json` contains named arrays of controlled values. There is no manifest, database or build step.

## Import commands

Use Node.js 22.7 or newer. No packages need installing. Run from the Zeitstrahl folder in the VS Code terminal:

```sh
node scripts/import-data.mjs preview imports/my-content.json
node scripts/import-data.mjs apply imports/my-content.json
```

Preview is read-only and reports counts and errors. Apply repeats validation, saves and verifies all six original content files and the import history in a new `backups/import-…/` directory, then appends records only to affected files. Existing record values and order are preserved; affected files are formatted with two-space indentation. Unaffected files remain byte-for-byte unchanged. Reload the website after applying.

Use `imports/example.json` as a format template, not historical content: its fictional placeholder text must be replaced. The import is an object with any of `events`, `persons`, `institutions`, `relationships`, `sources`, each containing an array. Omitted collections mean no additions. Related records may reference existing records or other records in the same import, regardless of collection order. Vocabulary imports are not supported.

All fields below are required, including those allowing null or empty arrays/text. Unknown fields, duplicate IDs (existing or incoming), duplicate relationship triples, invalid vocabulary values and missing references reject the entire batch. Repeating an applied import is rejected without changes; it never updates existing records. Different IDs with similar historical content are not automatically detected or merged: review titles and descriptions yourself.

## Import history

Successful `apply` runs prepend a timestamp, project-relative input filename and counts to `data/import-history.json`. The analysis page loads this history automatically on reload, newest first, independently of analysis filters. Preview, rejected, duplicate and empty imports do not add entries. History is written last within the same backup and rollback process as the content; a history write failure rolls back the content additions. Keep this file with the site when publishing. Direct edits or manual replacements of data files are not tracked.

The initial history contains two previously documented imports. The older undated entry retains its known relative order without inventing a timestamp. Import history is required for applying imports; do not delete it or replace it with an import batch.

## IDs

Keep existing IDs unchanged. Follow the existing conventions: events `E0001`, persons `P0001`, institutions `I0001`, relationships `R0001`, sources `S0001`. Pick unused numbers after inspecting the relevant file; the template IDs are not reserved and may already be taken later. IDs must match `[A-Za-z0-9_-]+` and be unique within their collection. References are case-sensitive. The importer does not assign or renumber IDs.

## Event fields

- Text: `id`, nonblank `title`, `date_label`, `short_description`, `long_description`, `notes`.
- Controlled IDs: `entry_type`, `primary_discipline`, `date_precision`, `scope`, `confidence`.
- Numbers: `start_year`; `end_year` is a number or null; `importance` is an integer 1–5.
- Arrays of unique strings: `secondary_disciplines`, `subdisciplines`, `topics`, `geography`, `persons`, `institutions`, `source_ids`. Empty arrays are valid.

`end_year: null` means a point event, not an ongoing period. Otherwise it must be at least `start_year`; equal years also display as a point. Years use the existing numeric representation; do not supply date strings. `date_label` carries human-readable qualifications such as “ca. 1800”; `date_precision` expresses uncertainty. No new calendar convention is introduced. Geography is free text, preferably consistent with existing records. Developments use the same event structure, for example `entry_type: "process"`. Person, institution and source arrays reference the corresponding collections. Derived duration/century/relationship counts are not stored.

## Other records

| Collection | Required fields and types |
| --- | --- |
| persons | `id`, nonblank `name`, numeric `birth_year`, numeric or null `death_year`, text `short_description` |
| institutions | `id`, nonblank `name`, numeric `founded_year`, numeric or null `dissolved_year`, text `place`, text `short_description` |
| sources | `id`, nonblank `title`, text `author`, numeric or null `year`, controlled `source_type`, text `publisher`, HTTP(S) URL or null `url`, text `notes` |
| relationships | `id`, event IDs `source_id` and `target_id`, controlled `relationship_type`, integer `strength` 1–5, controlled `confidence`, nonblank text `description`, numeric or null `start_year` and `end_year`, unique string arrays `geography` and `source_ids` |

Death/dissolution years cannot precede birth/foundation. Null means unspecified (it does not prove a person is alive). A relationship end requires a start and must not precede it. Relationships connect events only; people and institutions are linked through event arrays. Source and target must differ. The same directed source/target/type triple may appear only once. Read direction as “source → relationship verb → target”; `reaction_to` points from the reaction to its reference event. Strength and historical confidence are independent.

Sources provide attribution, not automatic verification. Do not invent citations. Empty source lists are allowed by the PoC. Use existing `notes` for editorial qualifications; do not add new metadata fields.

## Vocabulary values

Use IDs, not German labels. `data/vocabularies.json` is authoritative. The following lists reflect the current file:

- **disciplines**: `politics_society`, `science`, `technology_economy`, `philosophy_religion`, `art_culture`, `environment_nature`.

- **entry_types**: `event`, `process`, `idea_theory`, `movement`, `technical_innovation`, `work_publication`, `institution`, `political_legal_change`, `natural_environmental_event`.

- **date_precisions**: `exact`, `approximate`, `decade`, `century`, `uncertain`.

- **scopes**: `local`, `regional`, `national`, `continental`, `global`.

- **confidence**: `high`, `medium`, `low`.

- **topics**: `energy`, `mobility`, `production`, `industrialisation`, `urbanisation`, `work`, `trade`, `communication`, `knowledge`, `religion`, `state`, `rights`, `war`, `health`, `nature`, `climate`, `resources`, `media`, `technology`, `science`, `education`.

- **subdisciplines**: `architecture`, `literature`, `painting`, `music`, `design`, `physics`, `biology`, `chemistry`, `astronomy`, `medicine`, `energy`, `mechanical_engineering`, `communication`, `transport`, `production`, `trade`, `social_history`, `political_history`, `philosophy`, `theology`, `climate_history`, `ecology`.

- **relationship_types**: `influenced`, `enabled`, `contributed_to`, `accelerated`, `inspired`, `reaction_to`, `conflicted_with`, `developed_from`, `part_of`.

- **source_types**: `book`, `academic_article`, `reference_work`, `museum`, `archive`, `official_source`, `reputable_website`.

Subdisciplines also have a `discipline_id` in the vocabulary file. Vocabulary records contain `id` and `label`; disciplines additionally contain `color` and `tint`, and relationship types have a rendering `category`. The importer leaves this file unchanged. Existing event and relationship schemas remain in `data/`; the tool reuses their structural rules and `js/validation.js`, with small additional checks for supporting records. It validates the combined dataset, so pre-existing invalid records also block imports.

## Safety and recovery

Do not edit data files or run another importer while applying. `.import-data.lock` prevents simultaneous runs of this tool. Normal write failures trigger rollback using the original bytes. A process interruption or power failure can interrupt a multi-file write: keep the printed backup path. After confirming no import is running, restore the six content `.json` files and `import-history.json` (when present) from that backup to `data/` if necessary, remove the leftover `.import-data.lock`, and preview again. `.pending` files are prepared new data, not backups. Backup folders are local recovery copies; they are not read by the website. Do not delete a backup until the result is checked.

The Datenwerkstatt is unchanged. An older browser draft can still overwrite newer imports if exported and manually used to replace data files. Export any work you need first, then discard the old draft and reload the workshop after importing. The importer never modifies browser storage.

## Tests

```sh
node tests/unit.mjs
node tests/import.mjs
```

Import tests use disposable copies inside the project and never apply the template to the real dataset. The existing browser tests remain available at `tests/browser.html` on your local server.
