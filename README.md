# Zeitstrahl

Ein statischer, interaktiver Prototyp für Geschichte im Zusammenhang. Sechs Disziplinen teilen sich eine Zeitachse. Die Auswahl eines Eintrags macht sichtbar, welche Ideen und Entwicklungen miteinander verbunden sind. Ein separates Panel berechnet, was gleichzeitig geschah.

Die Anwendung verwendet ausschließlich HTML, CSS, JavaScript-Module, SVG und JSON. Sie benötigt keine Installation von JavaScript-Paketen, keinen Build, keine Datenbank, keine Benutzerkonten und keine externen Dienste. Auch Schriften und Icons funktionieren ohne Internetverbindung, sobald der lokale Server läuft.

## Schnell starten

### Visual Studio Code

1. Öffne den Ordner `zeitstrahl` in VS Code.
2. Falls vorhanden: Starte **Live Server** über „Open with Live Server“ auf `index.html`.
3. Alternativ: Öffne ein Terminal im Ordner und starte mit vorhandenem Python 3:

   ```sh
   python3 -m http.server 8000 --bind 127.0.0.1
   ```

4. Öffne `http://127.0.0.1:8000`.
5. Beende den Server im Terminal mit `Strg+C`.

Wenn dein Terminal im übergeordneten Ordner `App` steht:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory zeitstrahl
```

Ein Doppelklick auf HTML-Dateien (`file://`) reicht nicht: JavaScript-Module und das Laden der JSON-Dateien benötigen einen HTTP-Server. Die Seite erklärt Ladefehler mit einem sichtbaren Hinweis.

## Den Prototyp erkunden

- **Zeitstrahl:** `index.html` stellt den Explorer bereit.
- **Eintrag auswählen:** Klick oder Tastaturfokus und Enter öffnen rechts die Details. Gebogene SVG-Pfeile verbinden den Eintrag mit passenden Ereignissen. Escape oder das Schließen-Symbol beenden die Auswahl.
- **Verbindung lesen:** Zeige auf eine Linie oder fokussiere sie per Tab. Der Hinweis zeigt Richtung, Beziehungstyp, Beschreibung, Stärke und Sicherheit. Das Detailpanel enthält zusätzlich eine lesbare Beziehungsliste.
- **Zeitlich navigieren:** Scrolle horizontal, benutze die Pfeiltasten im fokussierten Zeitstrahl oder die beiden Navigationsbuttons. Unter „Der gesamte Zeitstrahl“ verschiebst du den Ausschnitt durch Ziehen der transparenten Box. Ziehe ihren linken oder rechten Griff, um Beginn oder Ende des sichtbaren Zeitraums anzupassen. Die Griffe lassen sich auch mit Pfeiltasten, Home und End bedienen; Umschalt vergrößert die Schritte. Ein Klick außerhalb der Box springt zum entsprechenden Zeitraum.
- **Zoomen:** „Überblick“, „Entdecken“ und „Im Detail“ ändern Maßstab und Detaildichte. In der Detailstufe sind alle 44 Beispieldatensätze verfügbar.
- **Filtern:** Disziplinen, Themen, Fachgebiete, Zeitraum, Bedeutung und Textsuche sind kombinierbar. Innerhalb einer Mehrfachauswahl gilt ODER, zwischen verschiedenen Filterarten UND. Die Suche berücksichtigt Titel und Kurzbeschreibung ohne Unterscheidung von Groß- und Kleinschreibung.
- **Zeitraum:** Einträge werden angezeigt, wenn ihr Intervall den Filterzeitraum berührt. An den Grenzen abgeschnittene Prozesse behalten ihre tatsächlichen Datumsangaben. Das farbige Prozessband endet am tatsächlichen Endjahr; sein Text darf für bessere Lesbarkeit darüber hinausreichen.
- **Gleichzeitigkeit:** Zeitintervalle überlappen einschließlich ihrer Grenzen. Punktuelle Einträge haben rechnerisch dasselbe Start- und Endjahr. Die Ergebnisliste bevorzugt andere Disziplinen, dann hohe Bedeutung und dann gemeinsame geografische Kennzeichnungen. Sie verwendet den gesamten Datenbestand und ist unabhängig von den aktuellen Filtern.
- **Mehr erfahren:** `event.html?id=E0007` zeigt beispielsweise die vollständige Eintragsseite. `index.html?event=E0007` öffnet den Explorer mit vorausgewähltem Eintrag.
- **Themen und Personen:** Kleine Dialoge bieten einen Einstieg in die zugehörigen Einträge. Personen erscheinen nicht als eigenständige Ereignisse auf der Zeitachse.

Beim Folgen einer Verbindung zu einem ausgefilterten Eintrag werden die Filter zurückgesetzt, um ihn sichtbar zu machen. Bei der Auswahl bleiben relevante Nachbarn auch dann sichtbar, wenn ihre Bedeutung unter der aktuellen Zoomschwelle liegt. Themen-, Zeitraum- und Disziplinfilter werden dabei weiterhin berücksichtigt. Das Panel erklärt, warum weniger Linien als Beziehungen erscheinen können.

Auf dem Desktop stehen Details rechts, auf schmalen Displays unter der Timeline. Die sechs Lanes bleiben in einer gemeinsamen, horizontal verschiebbaren Fläche; lange Ansichten werden über die Seite vertikal gescrollt. Es gibt keine Gestenpflicht: Buttons und Tastatur bieten dieselben Navigationsmöglichkeiten.

## Dateistruktur

```text
zeitstrahl/
├── index.html                 Explorer und Einstieg
├── event.html                 Vollständige Detailansicht
├── admin.html                 Lokale Datenwerkstatt
├── README.md
├── css/
│   ├── main.css               Typografie, Navigation, allgemeine Komponenten
│   ├── timeline.css           Lanes, Ereigniskarten, Linien, Filter, Detailpanel
│   └── admin.css              Formulare und Datensatzlisten
├── js/
│   ├── app.js                 Verbindet Explorer, Auswahl und Navigation
│   ├── config.js              Zentrale Zoom- und Layoutkonfiguration
│   ├── data-loader.js         Lädt und überprüft die sechs JSON-Dateien
│   ├── timeline.js            Positionierung, kollisionsarme Zeilen, Zoom, Miniatur
│   ├── relationships.js       Auswahl und SVG-Darstellung der Beziehungen
│   ├── filters.js             Kombinierte Filter und Filteroberfläche
│   ├── event-detail.js        Detailpanel, Einzelansicht, gleichzeitige Einträge
│   ├── admin.js               Bearbeiten, Browser-Entwurf, Export
│   ├── validation.js          Gemeinsame fachliche Datenvalidierung
│   └── utils.js               Datumslogik, Beschriftungen, sichere HTML-Ausgabe, Icons
├── data/
│   ├── events.json            44 historische Einträge
│   ├── relationships.json     60 gerichtete Beziehungen
│   ├── persons.json           14 Personen
│   ├── institutions.json      Institutionen
│   ├── sources.json           Literatur und Orientierungsquellen
│   ├── vocabularies.json      Kontrollierte IDs, deutsche Labels, Farben
│   ├── event.schema.json      Dokumentiertes JSON-Schema eines Eintrags
│   └── relationship.schema.json  JSON-Schema einer Beziehung
├── assets/
│   ├── images/               Für spätere Abbildungen vorbereitet
│   └── icons/favicon.svg      Lokales Website-Icon
└── tests/
    ├── unit.mjs               Daten-, Filter-, Intervall- und Validierungstests
    ├── browser.html           Testoberfläche im Browser
    └── browser.js             Ende-zu-Ende-Prüfungen der tatsächlichen Seiten
```

Historische Inhalte kommen vollständig aus den JSON-Dateien. Die HTML-Dateien enthalten ausschließlich die Oberfläche. Die beiden Explorer-HTML-Dateien sind bewusst identische statische Einstiegspunkte; bei Änderungen an ihrem Seitenrahmen bitte beide synchron halten.

## Datenmodell

Alle Datendateien außer `vocabularies.json` enthalten ein JSON-Array. Die Schemadateien beschreiben jeweils **einen** Datensatz, nicht das gesamte Array. Englische IDs sind stabile maschinenlesbare Schlüssel; angezeigte Labels sind deutsch.

### Ereignisse

Einträge verwenden `id`, `title`, `entry_type`, `start_year`, `end_year`, `date_precision`, `date_label`, `primary_discipline`, `secondary_disciplines`, `subdisciplines`, `topics`, `geography`, `scope`, `importance`, `short_description`, `long_description`, `persons`, `institutions`, `source_ids`, `confidence` und `notes`.

- `start_year`: Zahl zur Positionierung. `end_year: null` bezeichnet einen punktuellen Eintrag. Ein gleiches Start- und Endjahr wird ebenfalls als Punkt behandelt.
- `date_label`: redaktioneller Anzeigetext, etwa „ca. 1760–1900“. Die Position hängt ausschließlich von den Zahlen ab.
- `date_precision`: `exact`, `approximate`, `decade`, `century` oder `uncertain`.
- `primary_discipline`: genau eine der sechs Disziplin-IDs. Weitere Disziplinen bilden keine zusätzlichen Lanes.
- `entry_type`: kontrollierter Typ aus `vocabularies.json`, etwa `process`, `idea_theory` oder `technical_innovation`.
- `importance`: ganze Zahl 1–5; dient als redaktionelle Gewichtung für die Sichtbarkeit.
- `persons`, `institutions`, `source_ids`: Listen existierender IDs aus den zugehörigen Dateien. Fehlende Zuordnungen werden als leere Arrays gespeichert.
- `geography`: Liste freier, konsistent geschriebener Kennzeichnungen. Im Beispiel sind es englische Länder- und Regionsnamen. Es gibt keine automatische geographische Hierarchie; für regionale Nähe sollten etwa Land **und** Kontinent angegeben werden.
- `scope`: `local`, `regional`, `national`, `continental` oder `global`.
- `confidence`: `high`, `medium` oder `low`; Sicherheit der zeitlichen beziehungsweise historischen Einordnung.

`duration`, `century`, `is_point_event` und `relationship_count` werden durch `derivedValues()` berechnet und nicht gespeichert.

### Beziehungen

Jede Beziehung verwendet `id`, `source_id`, `target_id`, `relationship_type`, `strength`, `confidence`, `description`, `start_year`, `end_year`, `geography` und `source_ids`.

Die Richtung muss als Satz lesbar sein: **Ausgang → Verb → Ziel**. Beispiel: Dampfmaschine → ermöglichte → Eisenbahn. Bei `reaction_to`, `developed_from` und `part_of` zeigt der Pfeil vom reagierenden, abgeleiteten oder kleineren Eintrag auf seinen Bezugspunkt. Daher lautet die Reaktion: Romantik → entstand als Reaktion auf → Industrialisierung.

| Kategorie | Beziehungstypen | Darstellung |
| --- | --- | --- |
| `causal` | `influenced`, `enabled`, `contributed_to`, `accelerated`, `inspired` | durchgezogen |
| `reaction` | `reaction_to`, `conflicted_with` | gestrichelt |
| `development` | `developed_from` | dünne gerichtete Linie |
| `structural` | `part_of` | punktiert |

`strength` ist die Gewichtung einer Verbindung (1–5), `confidence` die Sicherheit ihrer Interpretation. Beides ist unabhängig. Die Sicherheit ist im Tooltip und der Einzelansicht lesbar; sie ändert noch nicht die Linienart. Gleichzeitigkeit wird ausschließlich berechnet und ist **kein** Beziehungstyp.

### Personen, Institutionen und Quellen

- Personen: `id`, `name`, `birth_year`, `death_year`, `short_description`.
- Institutionen: `id`, `name`, `founded_year`, `dissolved_year`, `place`, `short_description`. `null` bedeutet bei Auflösungsjahr „nicht angegeben / noch bestehend“.
- Quellen: `id`, `title`, `author`, `year`, `source_type`, `publisher`, `url`, `notes`. Jahr und URL dürfen `null` sein. Unterstützte Typen: `book`, `academic_article`, `reference_work`, `museum`, `archive`, `official_source`, `reputable_website`.

Die Werkstatt bearbeitet Ereignisse und Beziehungen. Neue Personen, Institutionen und Quellen werden direkt in den entsprechenden JSON-Dateien angelegt.

## Einen Eintrag hinzufügen

1. Öffne `admin.html`, wähle „Ereignisse“ und klicke „+ Neu“.
2. Die Werkstatt erzeugt eine eindeutige ID. Bestehende IDs bleiben unverändert, damit Referenzen erhalten bleiben.
3. Trage Titel, Typ, Startjahr, optionale Zeitspanne und Disziplin ein.
4. Wähle Themen, Unterdisziplinen, Bedeutung, Zeitgenauigkeit und Sicherheit. Mehrfachauswahl in den Formularen: `⌘` unter macOS beziehungsweise `Strg` unter Windows/Linux gedrückt halten.
5. Ergänze Beschreibungen, Geografie, Personen und Quellen. Bei leerem `date_label` setzt die Werkstatt einen einfachen Text aus den Jahreszahlen ein.
6. Klicke „Im Entwurf speichern“. Fehler erscheinen direkt über dem Formular. Der Entwurf wird unter `zeitstrahl-draft-v1` im lokalen Browserspeicher gesichert.
7. Klicke „Ereignisse exportieren“. Der Download heißt `events.json`.
8. Ersetze `data/events.json` durch die heruntergeladene Datei. Lade anschließend den Zeitstrahl neu.

Der Explorer zeigt bewusst nur die JSON-Dateien. Ein Browser-Entwurf wird dort erst nach dem Ersetzen der Datei sichtbar. Speichere offene Formularänderungen vor dem Export. Bei gesperrtem oder vollem Browserspeicher bleiben bestätigte Änderungen für die Sitzung erhalten und können weiterhin exportiert werden.

Alternativ kannst du einen vollständigen JSON-Datensatz direkt an das Array in `events.json` anhängen. Achte auf gültige JSON-Syntax, eindeutige IDs und bestehende Referenzen. Kommentare und abschließende Kommata sind in JSON nicht erlaubt.

## Eine Beziehung hinzufügen

1. Öffne in der Werkstatt „Beziehungen“ und „+ Neu“.
2. Wähle zwei verschiedene Ereignisse und den Beziehungstyp.
3. Prüfe den darüber angezeigten Satz auf die logische Richtung.
4. Trage Stärke, Sicherheit und eine nachvollziehbare Beschreibung ein. Vermeide eine starke Kausalaussage bei indirekten Einflüssen.
5. Ergänze bei Bedarf Zeitraum, Geografie und Quellen.
6. Speichere im Entwurf und exportiere `relationships.json`.
7. Ersetze `data/relationships.json`. Wenn eine Beziehung auf einen neuen Eintrag verweist, ersetze außerdem die zugehörige `events.json`.

Der gleiche Ausgang, das gleiche Ziel und der gleiche Beziehungstyp dürfen nur einmal vorkommen. Unterschiedliche Beziehungstypen für dasselbe Paar sind zulässig, zum Beispiel „trug bei zu“ und „ist Teil von“.

„Entwurf verwerfen“ erfordert eine zweite, sichtbare Bestätigung und stellt die beim Öffnen der Werkstatt geladenen Originaldaten wieder her. Die Dateien auf der Festplatte werden dadurch nicht verändert.

## Konfiguration und Erweiterung

`js/config.js` bündelt die wichtigsten Werte:

| Einstellung | Standard |
| --- | --- |
| Gesamtrahmen | 1450–1950; erweitert sich bei außerhalb liegenden Daten |
| Startfokus | um 1820 |
| Überblick | Maßstab 1; Bedeutung ≥ 4; Beziehungsstärke ≥ 5 |
| Entdecken | Maßstab 2,5; Bedeutung ≥ 3; Beziehungsstärke ≥ 4 |
| Im Detail | Maßstab 5; alle Einträge; Beziehungsstärke ≥ 2 |
| Anfangsansicht | Entdecken |

Neue Themen oder Unterdisziplinen werden in `vocabularies.json` ergänzt. Unterdisziplinen besitzen bereits eine `discipline_id`, sodass spätere eigene Spuren möglich sind. Farben und Icons sind durchgehend einer Disziplin zugeordnet. Die Lanes werden aus dem Vokabular erzeugt; Layout und Daten sind getrennt. Änderungen an kontrollierten Werten müssen auch in den dokumentierenden Schemadateien nachgeführt werden.

## Validierung und Fehlerbehandlung

`validation.js` wird von Loader, Werkstatt und Tests gemeinsam verwendet. Geprüft werden unter anderem eindeutige IDs, Pflichtfelder, kontrollierte Werte, Zahlen, gültige Zeiträume, Referenzen, Stärke/Bedeutung als ganze Zahlen von 1 bis 5 sowie Selbstbeziehungen und Duplikate.

Nicht erreichbare Dateien und ungültiges JSON erzeugen eine lesbare Fehlermeldung. Fehlerhafte Ereignisse und Beziehungen werden übersprungen; eine ausklappbare Warnung und die Browserkonsole nennen den Grund. Insbesondere führen Beziehungen zu nicht vorhandenen Ereignissen nicht zum Absturz. Bei einem Datenexport wird der gesamte Entwurf nochmals validiert. Automatisch übersprungene Quelldatensätze sind nicht Bestandteil des Exports; korrigiere sie bei Bedarf zuerst in den Originaldateien.

Texte aus JSON werden vor HTML-Ausgabe maskiert. Quellenlinks akzeptieren ausschließlich HTTP(S). Der Prototyp ist eine lokale Redaktion ohne Login; ein öffentlich hochgeladenes `admin.html` verändert weiterhin nur den Browser des jeweiligen Besuchers, niemals Serverdateien.

## Tests

Für die Anwendung selbst ist Node.js nicht erforderlich. Falls Node.js vorhanden ist, lassen sich die Logiktests ohne zusätzliche Pakete ausführen:

```sh
node tests/unit.mjs
```

Bei laufendem lokalen Server kannst du `http://127.0.0.1:8000/tests/browser.html` öffnen. Der Browser-Test bedient die echten Seiten und prüft unter anderem Filter, Zoom, Auswahl, Linien, Mini-Timeline, Detailseiten, Entwurfsspeicherung, Export und Validierungsfehler. Er legt kurzzeitig Testdaten im lokalen Entwurf an und stellt den vorherigen Entwurf am Ende wieder her. Während des Tests die Werkstatt nicht parallel bearbeiten; zum Abbrechen ohne Einfluss auf deinen Entwurf empfiehlt sich ein separates Browserprofil.

Die Tests benötigen keine Testbibliotheken. Sie prüfen die reale JSON-Datenbasis und konkrete Interaktionen.

## Beispieldaten und historische Grenzen

Der Datensatz dient der Erprobung des Interfaces, mit einem Schwerpunkt auf europäischer Geschichte von 1450 bis 1950. Er bildet keine vollständige globale Geschichte ab. Prozesse haben vereinfachte Zeitgrenzen. Für viele Einträge und interpretative Verbindungen fehlen noch einzeln überprüfte Belege; dort bleiben Quellenlisten ausdrücklich leer. Die Oberfläche weist in der vollständigen Detailansicht darauf hin. Quellenzuordnung ist keine Behauptung, dass jede Aussage eines Datensatzes bereits wissenschaftlich belegt sei.

Geprüfte Orientierungsquellen umfassen das [Science Museum zu Watts Kondensator](https://blog.sciencemuseum.org.uk/james-watt-and-the-separate-condenser/), die [DHM-Darstellung zu Industrie und Wirtschaft](https://www.dhm.de/lemo/kapitel/kaiserreich/industrie), das [Bauhaus-Archiv](https://www.bauhaus.de/de/das_bauhaus/) und [Luterbacher/Pfister über das Jahr ohne Sommer](https://www.hist.unibe.ch/unibe/portal/fak_historisch/dga/hist/content/e11168/e52524/e69145/e186327/e1752851/pane1753051/e205440/L-LuterbacherPfister2015_NatureGeosci_Tambora_ger.pdf). Bibliografische Angaben und weitere Literatur stehen in `sources.json`.

Eine größere wissenschaftliche Datenbasis, geographische Ontologien, zusätzliche Zeiteinheiten und die redaktionelle Belegprüfung sind mögliche spätere Schritte. Für den Prototyp bleibt der Zusammenhang zwischen Zeit, Disziplin und Beziehung im Mittelpunkt.

## Deployment

Kopiere den Inhalt von `zeitstrahl/` auf einen gewöhnlichen statischen Webserver. Die relativen Pfade erlauben auch die Bereitstellung in einem Unterverzeichnis. Der Server muss `.js` als JavaScript und `.json` als JSON ausliefern. Es sind keine Umgebungsvariablen, Secrets, API-Schlüssel oder Build-Schritte erforderlich.

Die Anwendung speichert keine Daten auf dem Server. Pflege die JSON-Dateien lokal und lade die aktualisierten Dateien erneut hoch. `tests/` kann bei einer öffentlichen Veröffentlichung weggelassen werden.

## Zusätzliche JSON-Daten importieren

Für neue Datensätze gibt es einen lokalen Import mit separater Vorschau und Anwendung, ohne bestehende Datensätze zu überschreiben. Format, Befehle und Sicherung: [DATA_MODEL.md](DATA_MODEL.md). Vorlage: [imports/example.json](imports/example.json). Die Website und Datenwerkstatt funktionieren unverändert.
