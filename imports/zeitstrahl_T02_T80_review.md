# Zeitstrahl T02–T80 – Gesamtbericht

79 Themen aus dem angehängten Themenkatalog wurden als zusammenhängende, selektive Ergänzungsrunde bearbeitet. Die Dateien liefern für jedes Thema einen Import und einen Prüfbericht. **Die breite Runde ist keine vollständige wissenschaftliche Ausarbeitung aller 79 Themen in der Tiefe eines eigenen Forschungsprojekts.** Pro Thema werden wenige zentrale Ergänzungen ausgewählt; wesentliche weitere Lücken sind ausdrücklich dokumentiert.

| Datensatzart | Neu |
|---|---:|
| Ereignisse | 84 |
| Beziehungen | 25 |
| Personen | 6 |
| Institutionen | 3 |
| Quellen | 115 |

## Nutzung

Empfohlen ist `zeitstrahl_T02_T80_import.json`. Alternativ können die 79 Einzelimporte T02 bis T80 in aufsteigender Reihenfolge angewandt werden. Einzelne Dateien benötigen frühere Teile; die Abhängigkeiten stehen im Manifest und im jeweiligen Bericht. Gemeinsam verwendete Datensätze werden nur einmal angelegt. Gesamt- und Einzelimporte dürfen nicht nacheinander auf denselben Bestand angewandt werden.

Der T01-Import wird nicht mitgeliefert und ist keine Voraussetzung. Seine IDs E9021–E9026, P0015, R9003–R9012 und S9027–S9035 wurden freigehalten. Ein bereits dort enthaltener Zusammenhang zwischen Watt-Entwicklung und kommerziellem Einsatz wurde bei der Prüfung erkannt und hier entfernt.

## Bestand und Quellen

Verfügbar waren sämtliche fünf Datenbestände, Vokabular, Beispielimport, CONTENT_GUIDELINES und DATA_MODEL. Der aktuelle Themenkatalog lag als DOCX vor und wurde vollständig ausgelesen. Die alten Dateien wurden nicht verändert. Die ID-Prüfung bezieht sich auf diese gelieferten Daten, nicht auf eventuell zwischenzeitlich lokal ergänzte Datensätze.

Die Recherche nutzt Museen, Archive, öffentliche Einrichtungen und wissenschaftliche Beiträge. Quellenverknüpfungen stehen in den Ereignissen und Beziehungen sowie in `quellenbelege.csv`. Online-Passagen und Katalogeinträge ersetzen keine vollständige Monografieauswertung. Gesperrte direkte Abrufe, bibliografische Grenzen und Interpretationsfragen sind in den Themenberichten vermerkt.

## Auswahl und Beziehungen

Es gibt keine künstliche Quote von 8–20 Ereignissen. Die Runde liefert 84 neue Ereignisse und nutzt vorhandene sowie neu entstandene Themenanker gemeinsam. Sie bildet zahlreiche Themen bislang nur punktuell ab, insbesondere regionale Wirtschafts- und Staatsgeschichte, Musik, antikoloniale Literaturinterpretation und koloniale Medizin aus Sicht lokaler Akteure. Diese Einschränkung ist redaktionell wesentlich.

Die 25 Beziehungen wurden auf konkrete Endpunkte begrenzt. Europäisch abgegrenzte Bestandsknoten wurden nicht ungeprüft auf New York oder Yellowstone erweitert. Gleiche Akteure und historische Nähe gelten nicht als Einflussnachweis. Wiederverwendete alte Beziehungen wurden nicht pauschal inhaltlich bestätigt; insbesondere prototypeigene Kausalitäten bleiben Gegenstand späterer Prüfung.

## Tatsächlich durchgeführte Prüfung

- Pflichtfelder, Typen, Vokabular und Wertebereiche geprüft.
- IDs gegen Grundbestand und T01 reserviert; Referenzen auch ohne T01 vollständig.
- Datierungen, Titelgleichheit und gerichtete Beziehungstripel geprüft.
- Themenimporte in aufsteigender Reihenfolge als append-only simuliert; Gesamtmenge identisch.
- Inhaltliche Abgrenzung zu bestehenden Ereignissen redaktionell kontrolliert; fachliche Restprüfung bleibt erforderlich.

Nicht ausgeführt wurden der Originalimporter und die Website-Tests, da deren Programmdateien nicht Bestandteil der Anhänge waren. Der Schritt im aktuellen VS-Code-Projekt bleibt:

```sh
node scripts/import-data.mjs preview imports/zeitstrahl_T02_T80_import.json
```

Erst nach fehlerfreier Vorschau und Prüfung des aktuellen Datenstands den vorgesehenen Apply-Schritt verwenden.

## Themenübersicht

| Thema | Neue Ereignisse | Neue Beziehungen | Direkte Voraussetzungen |
|---|---:|---:|---|
| T02 – Kohle, Dampf und industrielle Energie | 1 | 1 | – |
| T03 – Eisen, Stahl und industrielle Massenproduktion | 2 | 1 | – |
| T04 – Fabrikarbeit, Kinderarbeit und Sozialreformen | 1 | 1 | – |
| T05 – Elektrifizierung von Wirtschaft und Alltag | 1 | 1 | – |
| T06 – Erdöl, Verbrennungsmotor und fossile Mobilität | 1 | 0 | – |
| T07 – Japans industrielle Transformation | 1 | 0 | – |
| T08 – Exportwirtschaft und Industrialisierung Lateinamerikas | 1 | 0 | – |
| T09 – Handelsnetzwerke des Indischen Ozeans | 1 | 0 | – |
| T10 – Atlantische Expansion und Columbian Exchange | 1 | 0 | – |
| T11 – Atlantische Sklaverei, Widerstand und Emanzipation | 1 | 0 | – |
| T12 – Koloniale Plantagen- und Rohstoffökonomien | 1 | 1 | – |
| T13 – Handelskompanien und imperiale Macht | 2 | 0 | – |
| T14 – Opiumhandel und erzwungene Marktöffnung | 1 | 1 | – |
| T15 – Koloniale Aufteilung Afrikas und afrikanischer Widerstand | 1 | 0 | – |
| T16 – Antikoloniale Netzwerke und Unabhängigkeitsbewegungen | 1 | 0 | – |
| T17 – Entwaldung, Forstwirtschaft und Waldregime | 1 | 0 | – |
| T18 – Bergbau, Rohstoffe und ökologische Veränderungen | 1 | 0 | – |
| T19 – Industrielle Luft- und Wasserverschmutzung | 1 | 1 | – |
| T20 – Flussregulierung, Dämme und Bewässerung | 1 | 0 | – |
| T21 – Klimaschwankungen und Gesellschaften der Kleinen Eiszeit | 1 | 0 | – |
| T22 – Klimaschwankungen, Dürren und Hungersnöte | 1 | 0 | – |
| T23 – Naturschutz, Schutzgebiete und Landrechte | 1 | 0 | – |
| T24 – Bodendegradation und ökologische Krisen der Landwirtschaft | 2 | 1 | – |
| T25 – Landbesitz, Einhegungen und Agrarreformen | 1 | 0 | – |
| T26 – Agrarproduktion und globale Nahrungsmittelmärkte | 1 | 0 | – |
| T27 – Zucker, Tee, Kaffee und Kautschuk als Weltwaren | 1 | 0 | – |
| T28 – Pflanzenverbreitung, Krankheiten und Agrarökologie | 1 | 0 | – |
| T29 – Wachstum der Großstädte und Wohnverhältnisse | 1 | 0 | – |
| T30 – Trinkwasser, Kanalisation und städtische Gesundheit | 1 | 1 | T19 |
| T31 – Hungersnöte zwischen Naturereignis und Politik | 2 | 1 | T22, T26 |
| T32 – Kühlketten, Transport und Ernährung der Städte | 1 | 0 | – |
| T33 – Staatsbildung, Besteuerung und Verwaltung | 1 | 0 | – |
| T34 – Reformation, religiöse Konflikte und Herrschaft | 1 | 1 | – |
| T35 – Atlantische Revolutionen und ihre Verflechtungen | 1 | 0 | – |
| T36 – Unabhängigkeit und Staatsbildung Lateinamerikas | 1 | 0 | – |
| T37 – Reformen und Verfassungskonflikte in Großreichen | 1 | 0 | – |
| T38 – Imperiale Konkurrenz und Erster Weltkrieg | 1 | 1 | – |
| T39 – Verfassungen, Wahlrechte und politische Teilhabe | 1 | 0 | – |
| T40 – Zweiter Weltkrieg und neue Weltordnung | 1 | 0 | – |
| T41 – Abschaffung der Sklaverei und Fortbestand von Zwangsarbeit | 1 | 0 | – |
| T42 – Frauenbewegungen, Bildung und Wahlrecht | 1 | 1 | – |
| T43 – Indigene Gesellschaften, Landverlust und Widerstand | 2 | 1 | – |
| T44 – Migration, Vertragsarbeit und Diasporas | 1 | 1 | T41 |
| T45 – Arbeiterbewegung, Gewerkschaften und Sozialstaat | 1 | 1 | – |
| T46 – Schulbildung, Alphabetisierung und soziale Mobilität | 1 | 1 | – |
| T47 – Rassistische Ordnungen, Segregation und Gegenbewegungen | 1 | 0 | – |
| T48 – Migration, Seuchen und demografische Umbrüche | 1 | 1 | T10 |
| T49 – Wissenschaftliche Wissenssysteme und Austausch | 1 | 0 | – |
| T50 – Buchdruck, Publikationskulturen und Wissensverbreitung | 1 | 0 | – |
| T51 – Astronomie, Navigation und Kartografie | 1 | 0 | – |
| T52 – Pockenprävention, Impfungen und Gesundheitspolitik | 1 | 0 | – |
| T53 – Keimtheorie, Laborwissenschaft und Gesundheitswesen | 1 | 1 | – |
| T54 – Koloniale Medizin und Tropenkrankheiten | 1 | 0 | – |
| T55 – Die Influenza-Pandemie von 1918–1920 | 1 | 1 | – |
| T56 – Chemie, Physik und neue industrielle Technologien | 1 | 0 | – |
| T57 – Dampfschifffahrt, Kanäle und maritime Knotenpunkte | 1 | 0 | – |
| T58 – Eisenbahnen und globale Infrastruktur | 1 | 0 | – |
| T59 – Telegrafie, Seekabel und Informationsnetze | 1 | 0 | – |
| T60 – Telefon, Radio und frühe Massenkommunikation | 1 | 0 | – |
| T61 – Elektrizitätsnetze und städtische Infrastruktur | 1 | 0 | – |
| T62 – Automobil, Straßenbau und fossile Verkehrsordnung | 1 | 0 | – |
| T63 – Luftfahrt zwischen Mobilität, Wissenschaft und Krieg | 1 | 0 | – |
| T64 – Standardzeit, Vermessung und internationale Normen | 1 | 0 | – |
| T65 – Aufklärung, Reformdenken und Menschenrechtsbegriffe | 1 | 3 | T35 |
| T66 – Religiöse Reformbewegungen und lokale Reaktionen | 1 | 0 | – |
| T67 – Liberalismus, Sozialismus und Nationalismus | 1 | 0 | – |
| T68 – Rassenwissenschaft, Sozialdarwinismus und Imperialismus | 1 | 1 | – |
| T69 – Museen, Weltausstellungen und imperiale Wissensordnungen | 1 | 0 | – |
| T70 – Musik, Kunst und kulturelle Begegnungen | 1 | 1 | – |
| T71 – Fotografie, Film, Presse und moderne Öffentlichkeit | 1 | 0 | – |
| T72 – Literatur, antikoloniales Denken und Selbstrepräsentation | 1 | 0 | – |
| T73 – China zwischen Ming- und Qing-Zeit | 1 | 0 | – |
| T74 – Mogulreich und Nachfolgestaaten in Südasien | 1 | 0 | – |
| T75 – Westafrikanische Staaten und Gelehrtennetzwerke | 1 | 0 | – |
| T76 – Ostafrikanische Küstengesellschaften und das Hinterland | 1 | 0 | – |
| T77 – Südostasiatische Reiche und maritime Ökonomien | 1 | 0 | – |
| T78 – Indigene politische Ordnungen Amerikas im Wandel | 1 | 0 | – |
| T79 – Ozeanien: Handel, Begegnung und Kolonisierung | 1 | 0 | – |
| T80 – Nahöstliche Reiche, Reformen und regionale Verflechtungen | 1 | 0 | – |

Die Tabellenzählung folgt der tatsächlichen Importdatei. Thematisch gemeinsam genutzte Ereignisse stehen in den Einzelberichten; sie werden nicht mehrfach gezählt.
