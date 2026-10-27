# Lokale Importprüfung T02–T80

Stand der Prüfung: 27.10.2026. **Anschließend auf ausdrückliche Nutzeranweisung importiert. Bestehende Datensätze unverändert.**

Importabschluss: `zeitstrahl_T02_T80.applied.txt`; verifiziertes Backup: `backups/import-WmETy1`. Nach dem Import bestanden erneut 10 Unit- und 13 Import-Testgruppen. Zunächst kollidierte die feste Test-Institutions-ID I0003 mit dem neuen Bestand. Die Importtests erzeugen jetzt freie Test-IDs und passen die internen Referenzen an; die historische Beispielvorlage bleibt unverändert. `zeitstrahl_T02_T80.post-import-integrity.txt` bestätigt die exakte Ergänzung des Bestands. Die folgenden Prüfaussagen und Preview-Protokolle dokumentieren den Stand vor dem Import.

Prüfergebnis: Der Originalimport ist strukturell gültig. Die inhaltliche Prüfung hat keine eindeutigen historischen Duplikate zum aktuellen Bestand und keine doppelten neuen Beziehungen ergeben. Eine separate, nachgebesserte Datei liegt unter `zeitstrahl_T02_T80_import.reviewed.json`: **84 Ereignisse, 25 Beziehungen, 6 Personen, 3 Institutionen und 116 Quellen**. Alle vorhandenen Datensätze werden unverändert weiterverwendet. Neue Quellenzahl: 115 − 1 unbrauchbarer Eintrag + 2 gezielte Belege.

## Grundlage und Reichweite

Gelesen wurden CONTENT_GUIDELINES.md, DATA_MODEL.md, das aktuelle Vokabular, alle fünf Bestandskollektionen, der vollständige Import sowie Gesamtbericht, Manifest, Prüfprotokoll und Quellenbelegliste. Der Bestand umfasst 62 Ereignisse, 62 Beziehungen, 14 Personen, 2 Institutionen und 30 Quellen. Die neun im gelieferten Manifest gespeicherten SHA-256-Prüfsummen stimmen sämtlich mit den entsprechenden lokalen Dateien überein. Es liegt also tatsächlich dieselbe Datenbasis vor, auf die sich der Forschungsbericht bezieht.

Alle 84 Ereignisse wurden auf historische Identität und Abgrenzung zum Bestand gelesen; alle 25 Beziehungen auf Endpunkte, Richtung, inhaltliche Überschneidung und konkrete Belege geprüft. Die Beziehungsevidenz wurde zusätzlich online nachgelesen, bei einzelnen Abrufsperren über indexierte Seitentexte oder einen dokumentierten Ersatzbeleg. Dies ist keine vollständige unabhängige Nachrecherche jeder Aussage aller 84 Ereignisse oder sämtlicher 116 Quellen.

Die im Gesamtbericht erwähnten 79 Einzelimporte und Einzelthemenberichte liegen hier nicht vor. Ihre behauptete Reihenfolgensimulation und ihre detaillierten Forschungslücken lassen sich mit den vorhandenen Dateien nicht nachprüfen. Maßgeblich ist ausschließlich der geprüfte Gesamtimport.

## Historische Duplikate und Abgrenzungen

Kein Ereignis-, Personen-, Institutions- oder Quellendatensatz muss wegen gesicherter Identität auf eine andere Bestands-ID umgelegt werden. Es wäre sachlich falsch, bloße Themenverwandtschaft als Identität zu behandeln. Insbesondere:

| Import | Vorhandener Datensatz | Entscheidung |
|---|---|---|
| E9027 Newcomen, 1712 | E0007 Watt-Kondensator, 1769; E9002 kommerzieller Watt-Einsatz, 1776 | Technischer Vorläufer, eigene Entwicklung. |
| E9028 Koksverhüttung, 1709 | E0022 Bessemer-Stahl, 1856 | Anderes Verfahren und Produkt. |
| E9029 Iron Bridge | E0023 Eisen-/Glasarchitektur, Crystal Palace | Anderes Bauwerk, anderer Zeitpunkt. |
| E9030 Ten Hours Act, 1847 | E9008 Factory Act, 1833 | Eigenständiger späterer Rechtsakt. |
| E9031 Pearl Street | E9019 Holborn Viaduct; E0018 Elektrifizierung | Andere Anlage und Stadt; konkretes Beispiel neben dem Prozess. |
| E9033 Yawata; E9076 Gakusei | E9016 Meiji-Restauration | Konkrete spätere Maßnahmen, kein zweiter Eintrag zur Restauration. |
| E9038 Saint-Domingues Plantagen | E9003 Haitianische Revolution | Vorgeschichte und wirtschaftliche Struktur statt Revolutionsverlauf. |
| E9041 Vertrag von Nanjing | E9009 Erster Opiumkrieg | Vertrag und Krieg sind getrennte Gegenstände. |
| E9042 Adwa | E9020 Berliner Konferenz | Eigenständiges afrikanisches Ereignis. |
| E9046 Great Stink; E9058 Kanalisation | E9012 Snow, 1854; E0012 Urbanisierung | Andere Ereignisse beziehungsweise Bauprozess; keine unbelegte Snow-Kausalität hinzugefügt. |
| E9048 Huaynaputina | E0029 Kleine Eiszeit; E0030 Tambora; E0031 Jahr ohne Sommer | Anderer Vulkan und Zeitraum; kein Duplikat der Klimaperiode. |
| E9050 Yellowstone | E0032 europäische Naturschutzbewegung | Eigener Rechtsakt und anderer geografischer Fokus. |
| E9062 Westfälischer Friede; E9063 Trient; E9080 Septembertestament | E0004 Reformation; E0001 Buchdruck | Konkrete Verträge, Konzil und Publikation; keine zweite Reformation oder Druckerfindung. |
| E9067 Sarajevo | E0025 Erster Weltkrieg | Konkretes Attentat als Anlass der Krise, nicht Gesamtkrieg. |
| E9068 Neuseeländisches Frauenwahlrecht; E9071 Seneca Falls | E0038 Frauenwahlrechtsbewegung | Rechtsakt beziehungsweise Konvention; Neuseeland erweitert nicht stillschweigend den geografisch begrenzten Bestandsprozess. |
| E9069 UN-Charta; E9095 Erklärung von 1789 | E0041 Allgemeine Erklärung von 1948; E0008 Französische Revolution | Verschiedene Dokumente; 1789 bleibt konkreter Teil der Revolution. |
| E9070 Abschaffungsgesetz, 1833–1838 | E9005 Sklavenhandelsverbot, 1807 | Abschaffung der Sklaverei ist nicht Verbot des Handels. |
| E9075 ILO | E0015 Arbeiterbewegung | Institutionelle Gründung statt Bewegung. |
| E9082 Variolation, 1721 | E0035 Jenner-Impfung, 1796 | Unterschiedliche Verfahren und historische Schritte. |
| E9083 Tuberkulose-Erregernachweis | E0036 Keimtheorie | Konkretes Forschungsergebnis innerhalb des Prozesses. |
| E9087 Panama; E9088 US-Bahn; E9089 Telegraphenunion | E9017 Suez; E0011/E9007/E9011 Bahnen; E0019/E9014 Telegraphie | Andere Infrastruktur beziehungsweise Regelungsinstitution. |
| E9090 BBC, 1922; E9091 britisches Stromnetz | E0027 Radio, 1920; E0018 Elektrifizierung | Konkreter Programmbeginn beziehungsweise Netzausbau statt allgemeiner Einführung. |
| E9098 Eugenik; E9100 Japonismus; E9101 Kino | E0013 Evolution; E0017 Impressionismus; E0016 Fotografie | Eigenständige Ideen, Austauschprozesse und Medienereignisse. |

Auch innerhalb des Imports bleiben beispielsweise Umweltkrise/Bodenschutzbehörde (E9051/E9052), Vertreibungsgesetz/Deportation (E9072/E9073) und Columbian Exchange/Pockenepidemie (E9036/E9078) unterscheidbar. Keine dieser Paare wurde zusammengelegt.

Die sechs neuen Personen und drei Institutionen haben keine identischen Gegenstücke im Bestand. Quellen wurden anhand von Titel, Gegenstand und URL verglichen: keine identische Bestandsquelle erneut angelegt. Verschiedene Artikel desselben Museums oder verschiedene Katalogbelege für dasselbe historische Dokument sind nicht automatisch derselbe Quellen-Datensatz. Für R9013 wird die bereits vorhandene Quelle **S0002** zusätzlich referenziert, nicht neu angelegt.

## Beziehungen: vollständige Entscheidungsliste

Alle 25 neuen Verbindungen haben andere gerichtete Endpunktpaare als die 62 vorhandenen Beziehungen; auch ein anderer Beziehungstyp oder umgekehrte Richtung verdeckt hier keine identische Bestandsverbindung. R9035 ähnelt thematisch R0009, betrifft aber konkret die Rechteerklärung statt den gesamten Revolutionsprozess. Die `part_of`-Kanten präzisieren eigenständige Ereignisse; sie ersetzen oder bestätigen keine anderen Bestandskanten pauschal.

| ID | Entscheidung und konkreter Beleg |
|---|---|
| R9013 | Behalten; S9036 nennt Newcomen als Vorläufer. Vorhandene S0002 zusätzlich für Wärmeproblem und separaten Kondensator. `developed_from` zeigt korrekt von Watt zu Newcomen. |
| R9014 | Behalten; S9039, „Pioneers of industry“/„A bold idea“, verbindet Koksverhüttung, lokale Eisenproduktion und Brückenprojekt; Darby I und III bleiben getrennt. |
| R9015 | Nachgebessert; S9040 ist nur eine Chronologie. Neue S9151 benennt ausdrücklich die Reformfolge 1833–1844–1847. Beschreibung nennt den Zwischenschritt 1844; confidence bleibt medium. |
| R9016 | Behalten; S9018 nennt das öffentliche Londoner Kohlekraftwerk von 1882. Sachliche Einordnung unter den europäischen Elektrifizierungsprozess, kein Einfluss auf Pearl Street behauptet. |
| R9017 | Behalten; S9103, „Christianization, Conquest, and Coexistence“, nennt eingeschleppte Pocken und die Epidemie vor der Belagerung von 1521. Indexierter englischer Seitentext geprüft. |
| R9018 | Behalten; S9051/S9147 verbinden Plantagengewalt und Aufstand ausdrücklich. Beide Artikel auf der Hauptdomain gelesen; fehlerhafte Subdomains ersetzt. |
| R9019 | Behalten; S9008 beschreibt militärische Niederlage und erzwungenen Vertrag. Der Artikel enthält eine abweichende Tagesdatierung; diese wird nicht übernommen. Vertragsdatum und Einzelbestimmungen bleiben bei S9056. |
| R9020 | Behalten; S9064, „Population explosion overwhelms the city“, erklärt die Überlastung durch Bevölkerungswachstum. |
| R9021 | Behalten; S9072 beschreibt Staubstürme während der Kongressberatungen und den anschließenden Soil Conservation Act. `reaction_to` zeigt korrekt von Behörde zu Krise. |
| R9022 | Behalten; S9075, „Corn Law repeal moves“, behandelt Peels Aufhebung im Zusammenhang mit der irischen Hungerkrise. Keine Behauptung, sie habe die Krise gelöst. |
| R9023 | Behalten und S9064 ergänzt: dort werden Geldmangel, Great Stink und das beschleunigte Finanzierungsgesetz konkret verknüpft. S9080 bestätigt den Zusammenhang mit Bazalgettes System. |
| R9024 | Behalten; S9084, Eintrag 1545, nennt innerkirchliche Reform und Eindämmung der protestantischen Ausbreitung ausdrücklich. |
| R9025 | Behalten; S9127 nennt die amerikanische Erklärung als Inspiration der französischen. |
| R9026 | Behalten mit neuem Beleg S9152, „The Outbreak of War“. S9089 mit Titel „The“ und gesperrtem PDF wird ersetzt; Ereignis E9067 ebenfalls umreferenziert. |
| R9027 | Behalten; S9094 nennt die Konvention als frühen Organisationsschritt der US-Frauenrechtsbewegung einschließlich Wahlrechtsforderung. |
| R9028 | Behalten; S9096/S9097 unterscheiden Gesetz, Treaty of New Echota und militärische Deportation. Keine unmittelbare Vertreibungsanordnung durch den Gesetzeswortlaut behauptet. |
| R9029 | Vorsichtiger formuliert, confidence medium. S9098, „Brief synthesis“, verbindet Vertragsarbeit mit dem Umbau nach der britischen Abschaffungsgesetzgebung. Kein bereits überall abgeschlossener Emanzipationsprozess vorausgesetzt; E9074 entsprechend präzisiert. |
| R9030 | Behalten; S9099, „Founding of the ILO“, nennt Weltkrieg, Friedenskonferenz und Verankerung im Versailler Vertrag. |
| R9031 | Behalten; S9148 beschreibt Zentralisierung nach der Meiji-Restauration, Bildungsministerium und Gakusei-Ausschuss; S9100 beschreibt Ausarbeitung und Verkündung. |
| R9032 | Behalten; deutschsprachiger indexierter RKI-Text S9110 beschreibt Bakteriologie und konkreten Tuberkulosenachweis. `part_of` ist eine sachliche Zuordnung, kein umfassender Kausalanspruch. |
| R9033 | Behalten, medium; S9113, „The outset“, nennt massive transatlantische und innereuropäische Truppentransporte als Verbreitungswege. Indexierter Volltext gelesen, bibliografische Angaben ergänzt. |
| R9034 | Behalten; S9127 beschreibt Beschluss durch die verfassunggebende Nationalversammlung und Einbindung in die Verfassung von 1791. |
| R9035 | Behalten; S9127 nennt die Aufklärung ausdrücklich als geistigen Bezugspunkt der Erklärung. Keine Verdopplung von R0009. |
| R9036 | Behalten; S9130 nennt Darwins Werk von 1859 und die Anregung Galtons durch dessen Züchtungsdarstellung. Kein Legitimitätsargument für Eugenik. |
| R9037 | Behalten; S9133 erläutert konkrete kompositorische Anregungen japanischer Druckgrafik, insbesondere bei Degas. Die spätere Cassatt-Rezeption wird nicht allein zum Beleg für den Zeitraum 1874–1886 gemacht. |

Die Quellen-IDs in dieser Tabelle werden vollständig durch `zeitstrahl_T02_T80.reviewed-quellenbelege.csv` aufgelöst. Zentrale nachgebesserte Belege: [Fabrikgesetzgebung](https://www.parliament.uk/about/living-heritage/transformingsociety/livinglearning/19thcentury/overview/laterfactoryleg/), [Kriegsausbruch](https://encyclopedia.ushmm.org/content/en/article/world-war-i-and-its-aftermath-key-dates?series=20), [Aapravasi Ghat](https://whc.unesco.org/en/list/1227/).

## Bereinigung, Klassifikationen und Referenzen

- Keine Ereignis- oder Beziehungs-ID umnummeriert. Reservierte T01-IDs bleiben frei; T01 ist keine Voraussetzung.
- S9089 aus der geprüften Kopie entfernt und alle zugehörigen Referenzen auf S9152 umgelegt. Dies ist ein **Belegersatz**, keine historische Dublettenfusion.
- S9151 als konkreter zusätzlicher Beleg angelegt. S0002 und S9064 wiederverwendet.
- S9051/S9147: funktionierende Hauptdomain und tatsächlicher Herausgeber statt fehlerhafter Subdomain. S9103: englischer Hauptpfad. S9110: überprüfbare deutsche RKI-Fassung desselben biografischen Gegenstands. S9113: Harald Brüssow, 2022, Microbial Biotechnology 15(5), 1301–1317; DOI in notes ergänzt.
- Alle kontrollierten Werte sind gültig. Unterdisziplinen passen zu Primär- oder Sekundärdisziplin. Keine neue Klassifikation eingeführt. Alle IDs, Pflichtfelder, Datentypen, Wertebereiche und Referenzen werden mit dem bestehenden Importer am zusammengeführten Datenbestand validiert.
- Personen/Institutionen werden nur von Ereignissen referenziert; Beziehungen verbinden ausschließlich Ereignisse. Keine Selbstbezüge, ungültigen Zeitintervalle oder doppelten gerichteten Tripel.
- Die vollständigen Änderungen an 15 Datensätzen einschließlich Vorher/Nachher stehen in `zeitstrahl_T02_T80.review-decisions.json`. Originalimport und ursprüngliche Begleitdateien bleiben unverändert. Deren alte Zählung und Quellenbelegliste gelten nicht für die bereinigte Kopie.

## Schutz des Bestands und Tests

Der Importer hängt nur neue Datensätze an. Eine kollidierende ID führt zur Ablehnung, niemals zur Aktualisierung. Die kombinierte Preview-Datenstruktur wurde zusätzlich darauf geprüft, dass jeder bestehende Datensatz unverändert an derselben Position erhalten bleibt; das Vokabular bleibt identisch. Ein späterer Import würde die dargestellten Netzwerke und abgeleiteten Beziehungszahlen vorhandener Ereignisse durch neue Kanten erweitern, aber keine gespeicherten Bestandsfelder ändern. Betroffene JSON-Dateien würden vom Importer neu formatiert; das ist von inhaltlichen Datensatzänderungen zu unterscheiden.

Ausgeführt mit Node v22.14.0 (vorübergehend im Projekt heruntergeladen, anhand des offiziellen SHA-256-Verzeichnisses geprüft):

- Originalimport: `node scripts/import-data.mjs preview imports/zeitstrahl_T02_T80_import.json` — erfolgreich.
- Bereinigter Import: `node scripts/import-data.mjs preview imports/zeitstrahl_T02_T80_import.reviewed.json` — erfolgreich; separates Preview-Protokoll gespeichert.
- `node tests/unit.mjs` — **10 Testgruppen erfolgreich**.
- `node tests/import.mjs` — **13 Testgruppen erfolgreich**; Schreib-/Rollbacktests ausschließlich in automatisch entfernten Projekt-Testkopien.
- Zusätzliche Prüfung: ID-Konventionen, Unterdisziplinzuordnung, Endpunktpaare unabhängig von Typ/Richtung, vollständige Quellenbelegliste, Erhaltung bestehender Datensätze in der Preview und SHA-256-Vergleich aller `data/*.json`.

Die Browser-UI-Tests `tests/browser.html` wurden nicht ausgeführt; die beiden in DATA_MODEL.md vorgesehenen Node-Tests wurden ausgeführt. Keine Anwendung des Imports auf den echten Bestand, kein Commit und kein Deployment. Die vorher bereits vorhandene `.import-test-xhn7fF` wurde nicht verändert. Die temporäre Node-Laufzeit wurde nach Abschluss wieder entfernt.

## Offene fachliche Fragen

1. **Publikationsreife der Breite:** Der Gesamtbericht selbst bezeichnet die 79-Themen-Runde als selektiv. Die Einzelberichte fehlen. Eine Freigabe aller Ereignisbehauptungen ist nicht mit einem bestandenen Schema-Preview gleichzusetzen.
2. **Belegqualität einzelner Ereignisse:** E9059 (Bengalen) stützt sich auf eine Studie zur Dürre, die keine vollständige Erklärung der Hungerkrise liefert. E9066 nutzt eine Kapitelzusammenfassung; E9102 sichert vor allem die Publikationsgeschichte. Diese bereits markierten Grenzen bleiben bestehen.
3. **Bibliografie:** Mehrere unbearbeitete Quellen enthalten verkürzte Suchergebnistitel, etwa S9050/S9054/S9057/S9093, oder unspezifische Metadaten wie S9087. Ihre bibliografische Vervollständigung ist vor einer wissenschaftlichen Veröffentlichung sinnvoll. Es wurden keine fehlenden Angaben erfunden.
4. **Geografische Reichweite:** `scope` bezeichnet teils Wirkungsraum statt Schauplatz (etwa globale Plantagen-/Rohstoffprozesse). Diese gültigen Zuordnungen wurden nicht eigenmächtig vereinheitlicht. Für eine spätere redaktionelle Runde sollte die Auslegung konsistent festgelegt werden.
5. **Mauritius:** Die konkrete lokale Abfolge von Abschaffung, Apprenticeship und Vertragsarbeit verdient eine vertiefte Darstellung. Die bereinigte Fassung vermeidet bereits die pauschale Gleichsetzung von 1834 mit überall abgeschlossener Emanzipation.

Vorschlag: Die bereinigte Gesamtdatei als technische Importgrundlage verwenden, die genannten fachlichen Grenzen bei der redaktionellen Freigabe berücksichtigen und unmittelbar vor einem später autorisierten Import erneut Preview ausführen.
