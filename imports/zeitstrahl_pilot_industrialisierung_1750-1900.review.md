**Application update — 26 October 2026:** This finalized proposal has now been imported locally with explicit user authorization. Verified totals: 62 events, 62 relationships, 30 sources. Backup: `backups/import-qDTZp0`. All 10 unit and 13 import test groups passed. See `zeitstrahl_pilot_industrialisierung_1750-1900.applied.txt` for the completion record. The review below is retained as the pre-import assessment. Nothing deployed or committed.

---

**Finalized Zeitstrahl pilot import — 26 October 2026**

**Status: final proposal, preview validated; NOT APPLIED.** Finalization started from the existing `.reviewed.json` and this review report. The original import was neither read to regenerate the proposal nor modified. Existing content, website architecture, application code, schemas, importer and tests are unchanged.

Use `zeitstrahl_pilot_industrialisierung_1750-1900.reviewed.json`. The accompanying `.review-decisions.json` retains the previous duplicate decisions and records final corrections. The `.validation.txt` file contains the actual preview and test outputs.

| Collection | Existing | Before final corrections | Final additions | Total if approved |
| --- | ---: | ---: | ---: | ---: |
| Events | 44 | 18 | 18 | 62 |
| Relationships | 60 | 7 | 2 | 62 |
| Sources | 9 | 22 | 21 | 30 |
| Persons | 14 | 0 | 0 | 14 |
| Institutions | 2 | 0 | 0 | 2 |

**Geographical normalization**

17 event geography arrays changed. The existing conventions `Great Britain`, `Germany`, `Europe` and `United States` are reused exactly. Other translations are `India`, `Egypt`, `Africa`, `Caribbean`, `Atlantic Ocean` and `Atlantic World`. Historical English usages such as `Bombay` and `Saint-Domingue`, and names already correct in English, are retained. This translates existing labels without changing historical scope, inventing categories or modifying German descriptions. No geography label remains in the replaced German forms.

**Historical duplicates resolved**

| Incoming event | Preserved existing record | Decision |
| --- | --- | --- |
| E9013 — Bessemer stellt neues Verfahren zur Stahlherstellung vor (1856) | E0022 — Moderne Stahlproduktion (1856) | Both describe the Bessemer process, explicitly named in the existing description. E9013 remains omitted and E0022 remains authoritative. R9006 previously targeted E0022 but is now removed for insufficient evidence. Do not transfer incoming prose or citations into the existing record. |
| E9018 — Bell erhält ein Telefonpatent (1876) | E0020 — Telefon (1876) | The existing record explicitly anchors its date to Bell’s patent. E9018 remains omitted; E0020 remains authoritative. Incoming R9007 stays omitted as a duplicate of existing E0019 → E0020 relationship R0030. |

The [Science Museum account of Bessemer](https://blog.sciencemuseum.org.uk/onward-ever-sir-henry-bessemer-frs-19-1-1813-15-3-1898/) and [National Museums Scotland account of Bell](https://www.nms.ac.uk/discover-catalogue/did-alexander-graham-bell-invent-the-telephone) corroborate the event identities. Neither existing record is overwritten, enriched or deleted. The richer incoming descriptions remain available in the original file for a separate, explicit editorial revision if wanted later.

**Related developments that remain distinct**

| Incoming | Closest existing entry | Assessment |
| --- | --- | --- |
| E9001 Water Frame, 1769 | E0009 Industrialisierung | Specific invention within a broad transformation; retain. |
| E9002 Commercial Watt engines, 1776 | E0007 Dampfmaschine, 1769 | Strong thematic overlap, but distinct milestones: commercial installations versus the separate-condenser patent. Retain the explicitly dated 1776 milestone. |
| E9003 Haitian Revolution, 1791–1804 | E0008 Französische Revolution | Connected revolutions with different actors, geography and outcomes; retain. |
| E9004 Cotton Gin, 1793 | E0009 Industrialisierung | Specific invention and cotton/slavery consequences, not a second general industrialisation entry; retain. |
| E9005 British slave-trade prohibition, 1807 | No equivalent | Retain. Do not equate it with abolition of slavery. |
| E9006 Luddite protests begin, 1811 | E0015 Arbeiterbewegung, 1830–1914 | Distinct earlier protests, not the later broad organised movement; retain. |
| E9007 Liverpool–Manchester opening, 1830 | E0011 Eisenbahn, 1825 | Different railway milestone; existing prose names Stockton–Darlington. Retain. |
| E9008 Factory Act, 1833 | E0015 Arbeiterbewegung | Specific legislation, not a movement; retain. |
| E9009 First Opium War, 1839–1842 | No equivalent | Retain. |
| E9010 Great Exhibition, 1851 | E0023 Eisen- und Glasarchitektur, 1851 | Same setting and year, different subjects: exhibition/trade versus architectural development exemplified by its building. Retain. |
| E9011 Bombay–Thane passenger railway, 1853 | E0011 Eisenbahn | Distinct geographical/institutional milestone, not a duplicate of the British railway anchor; retain. |
| E9012 John Snow’s cholera investigation, 1854 | E0036 Keimtheorie, 1860–1885 | Specific epidemiological investigation, not the later broader microbial theory; retain. |
| E9014 Permanent Atlantic telegraph cable, 1866 | E0019 Elektrische Telegraphie, 1837 | Specific later infrastructure milestone, not the invention of electric telegraphy; retain. |
| E9015 Das Kapital volume I, 1867 | E0014 Marxismus, 1848 | Different publication and date; existing entry explicitly uses the Communist Manifesto as its anchor. Retain. |
| E9016 Meiji Restoration, 1868 | E0009 Industrialisierung | Distinct Japanese political transformation and industrial context; retain. |
| E9017 Suez Canal opening, 1869 | No equivalent | Retain. |
| E9019 Holborn Viaduct electricity supply, 1882 | E0018 Elektrifizierung, 1880–1930 | Local installation within a broader international process; retain. |
| E9020 Berlin Africa Conference, 1884–1885 | No equivalent | Retain. |

Retaining an event here means no historical duplicate was identified in the current dataset; it is not a claim that every sentence has completed publication review.

Evidence checked for the difficult distinctions:

- Watt: the [existing source on the 1769 patent](https://blog.sciencemuseum.org.uk/james-watt-and-the-separate-condenser/) and [incoming biography describing commercial installations in 1776](https://collection.sciencemuseumgroup.org.uk/people/ap24508/watt-james) support separate milestones. Treating E9002 as another general “steam engine” entry would be redundant; retain its commercial-deployment focus.
- The [Science Museum railway record](https://collection.sciencemuseumgroup.org.uk/people/cp29532/liverpool-and-manchester-railway) identifies the 1830 Liverpool–Manchester opening.
- The [V&A exhibition account](https://www.vam.ac.uk/articles/the-great-exhibition-of-1851) distinguishes the exhibition from its Crystal Palace building.
- The [Office of the Historian](https://history.state.gov/milestones/1866-1898/telegraph) distinguishes early electric telegraphy from the successful 1866 Atlantic connection.
- The [DHM object record](https://www.dhm.de/lemo/bestand/objekt/karl-marx-das-kapital-1867) identifies the 1867 first volume of Das Kapital.
- The [NESO account](https://www.neso.energy/energy-101/electricity-explained/how-electricity-generated/how-was-electricity-generated-using-coal) identifies the Holborn Viaduct installation in 1882.

**Final relationship decisions**

Each of the seven previously proposed relationships was reviewed for evidence about its actual endpoints. Five were removed. Their full records and reasons remain in the decisions file.

| ID | Final decision | Evidence assessment |
| --- | --- | --- |
| R9001 | Retain E9001 → contributed_to → E9004, confidence reduced to medium | A bounded economic interpretation: mechanised British cotton production increased raw-cotton demand, connecting to expansion of American cotton processing. It does not claim the Water Frame directly caused Whitney’s invention. S9001 and S9002 support this mechanism. |
| R9002 | Retain E9001 → contributed_to → E9008, confidence reduced to medium | Added S9026, the verified 1832 Hansard debate explicitly relating Arkwright’s spinning machinery to calls for child-labour regulation. Reworded the description to distinguish that debate and wider reform campaigns from a claim that one invention alone caused the 1833 Act. S9001 and S9007 provide historical context. |
| R9003 | Remove | General mechanisation and labour grievances do not establish a specific Water Frame-to-Luddite connection. The identified grievances concerned particular weaving/knitting machinery and wage practices. |
| R9004 | Remove | The cited sources establish Watt’s 1776 commercial installations and the 1830 railway separately, not this specific influence between them. |
| R9005 | Remove | Neither railway source establishes a particular Liverpool–Manchester-to-Bombay–Thane transfer. General British railway influence is insufficient for the specific endpoint pair. |
| R9006 | Remove | The Bessemer source supports steel enabling railway expansion, not a demonstrated contribution from the Liverpool–Manchester opening to Bessemer adoption. It is not sufficient evidence for the asserted direction and endpoints. |
| R9008 | Remove | Steam-engine ancestry alone does not substantiate a specific influence from Watt’s 1776 commercial deployment to the Holborn Viaduct power station. |

The retained economic connection is an editorial synthesis of the [National Park Service history](https://www.nps.gov/articles/lowell-handbook-industrial-revolution-in-england.htm) and [US National Archives account](https://www.archives.gov/education/lessons/cotton-gin-patent), expressed with medium confidence. The second connection has a direct contemporary anchor in [Sadler’s speech, 16 March 1832, especially columns 356–357](https://api.parliament.uk/historic-hansard/commons/1832/mar/16/factories-regulation-bill), interpreted alongside [Parliament’s account of the 1833 Act](https://www.parliament.uk/about/living-heritage/transformingsociety/livinglearning/19thcentury/overview/factoryact/). Sadler’s speech is evidence of reform argumentation, not a neutral survey of all factories.

The [Science Museum railway-company record](https://collection.sciencemuseumgroup.org.uk/people/cp29532/liverpool-and-manchester-railway) and [Indian railway history](https://artsandculture.google.com/story/a-history-of-indian-railways-national-rail-museum/cAVh7RwiKiTtKg?hl=en) were examined for R9005; their milestone accounts do not demonstrate the particular influence claimed. The [Bessemer account](https://blog.sciencemuseum.org.uk/onward-ever-sir-henry-bessemer-frs-19-1-1813-15-3-1898/) does not substantiate R9006’s specific demand-side assertion. These removals mean insufficient support was found, not that every conceivable historical connection has been disproved.

**Preservation of existing-event references**

The mappings E9013 → E0022 and E9018 → E0020 remain authoritative and are retained in the decisions file. No omitted event or duplicate relationship was reinstated. Existing E0022, E0020 and R0030 are byte-for-byte unchanged. R9006 is now absent because it failed the evidence review, so its former E0022 target is documented in the audit rather than retained as an unsupported live relationship. R9007 remains absent because the resolved E0019 → E0020 connection already exists as R0030. The two final proposed relationships reference E9001/E9004/E9008 only.

**National Archives references resolved**

- **S9005:** the original HTML URL still returned HTTP 403. The same titled work is available as the Archives’ [official PDF lesson pack](https://cdn.nationalarchives.gov.uk/documents/why-did-the-luddites-protest.pdf). The browser extraction service rejected the PDF because of its size, but direct download succeeded (12,227,272 bytes). Its 14 PDF pages were parsed locally. The introduction and historical background, PDF pages 2 and 4, support the start in Nottinghamshire in 1811, regional spread, labour/wage grievances and repression. Its catalogue references and interpreted primary documents provide appropriate evidence for E9006. The source’s ID and identity are unchanged; its URL now points to this verified PDF and its notes identify the relevant pages. No uncertain publication year was invented.
- **S9025:** the proclamation page still returned HTTP 403 on direct access. Search-indexed text identified the document as HO 42/118, dated 23 December 1811, but an accessible direct reading could not be confirmed. It is omitted from this batch and from E9006’s source list. E9006 has no claim specific to that proclamation requiring a separate citation; the verified official S9005 lesson pack supplies the needed support. No substitute proclamation or bibliographic detail was invented.

S9012 is omitted because R9006 was its last remaining reference. S9026 is the new verified Hansard source for R9002 (1832, UK Parliament). Thus 22 sources minus S9012 and S9025 plus S9026 yields **21 sources**. Prior omissions S9017 and S9022 remain omitted. Every final proposed source is referenced by at least one final event or relationship.

**Duplicate and integrity checks**

The 18 retained events were rechecked against all 44 existing events and each other. The historical distinctions in the event table above still hold; no additional historical duplicate was identified. Neither geography translation nor source changes alter event identities. All retained event IDs, titles, dates and substantive descriptions are unchanged from the reviewed input. No existing or incoming ID collisions, repeated normalized source URLs, repeated normalized title/author pairs, duplicate directed relationship triples, self-links, missing endpoints, invalid vocabulary references or missing source references remain. Sources on the same topic but representing different works are retained as distinct sources.

**Validation**

The existing importer’s preview was rerun against the final `.reviewed.json`: **18 events, 0 persons, 0 institutions, 2 relationships, 21 sources; exit code 0**.

- `node tests/unit.mjs`: all 10 groups passed.
- `node tests/import.mjs`: all 13 groups passed. Apply/rollback tests used disposable fixture copies only.
- Additional checks: all final event/relationship source lists are nonempty and resolve; all final sources are used; previous duplicate omissions and existing E0022/E0020/R0030 identities are preserved; old German geography forms are absent.
- SHA-256 comparisons confirm all existing `data/`, `js/`, `css/`, `scripts/`, `tests/` and root HTML files are unchanged.

Node.js was run from a checksum-verified temporary official portable runtime inside the project. The runtime and temporary research files were removed afterwards; nothing was installed globally. Browser interaction tests were not rerun because the website code and live data did not change.

**Remaining concerns**

No unresolved structural, ID, reference or duplicate conflicts were identified. Some long descriptions remain below the flexible recommended length, and optional people/institution associations are still empty. This finalization verified the problematic archive references and assessed every retained relationship; it is not a new claim-by-claim audit of every sentence of all 18 events or an approval to publish. The existing importer has no draft/publication distinction, so applying later will make the additions visible on reload.

No live import, deployment or commit was performed. The final file remains a proposal for the user’s approval.
