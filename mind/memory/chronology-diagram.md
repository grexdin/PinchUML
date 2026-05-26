## Chronology Diagram

The Chronology Diagram, adapted from Gantt Chart, is described in *natural* language, using very simple sentences (subject-verb-complement).

To activate this feature, the diagram must:
* begin with ``@startchronology`` keyword
* end with ``@endchronology`` keyword.

## Declaring tasks or milestone

Tasks defined using square bracket.

<plantuml>
@startchronology
title Chronology Diagram
[A: 2024-01-15 01:08:12] happens on 2024-01-15 01:08:12
[B] happens on 2024-01-15 13:08:12
[C] happens on 2024-01-15 22:12:08
@endchronology
</plantuml>
