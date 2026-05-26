## Ditaa

Ditaa *(DIagrams Through Ascii Art)* is an Open Source project that allows to generate general diagrams from a text descriptions. The idea is close to **PlantUML**, and it may be useful for documentation to generate other diagrams than UML.

Then **PlantUML** allows this :

<plantuml>
@startditaa
+--------+   +-------+    +-------+
|        +---+ ditaa +--> |       |
|  Text  |   +-------+    |diagram|
|Document|   |!magic!|    |       |
|     {d}|   |       |    |       |
+---+----+   +-------+    +-------+
    :                         ^
    |       Lots of work      |
    +-------------------------+
@endditaa
</plantuml>

> It is now not possible to use Ditaa with ``@startuml`` by using ``ditaa`` keyword on the very first line of your description.
> You must now use ``@startditaa`` and ``@endditaa``.

⚠ On PlantUML, only **PNG** generation is supported.

## Generalisation (of @start/@end tag)

**PlantUML** now can generate diagrams other than UML. In such cases the usual ``@startuml`` does not make sense anymore. So now we allow diagrams start with ``@startXYZ`` and finish with ``@endXYZ``, where ``XYZ`` can change with the type of diagram and can be any characters (including spaces).

> This means that plugin developers are encouraged to change their code to recognize ``@start`` instead of ``@startuml``.

DITAA diagrams are usually formatted as ``@startditaa...@endditaa``.

## Option supported by PlantUML

You can also use some option, after the ``@startditaa`` or ``ditaa`` keyword:

* ``-E`` or ``--no-separation`` to remove separator
* ``-S`` or ``--no-shadows`` to remove shadow
* ``scale=<XYZ>`` to scale up or down the diagram

### Without option
<plantuml>
@startditaa
+---------+  /--------\   +-------+
| cBLU    +--+cAAA    +---+Version|
|         |  |  Data  |   |   V3  |
|    +----+  |  Base  |   |cRED{d}|
|    |cPNK|  |     {s}|   +-------+
|    |    |  \---+----/
+----+----+
@endditaa
</plantuml>

### Remove separator
<plantuml>
@startditaa < -E
+---------+  /--------\   +-------+
| cBLU    +--+cAAA    +---+Version|
|         |  |  Data  |   |   V3  |
|    +----+  |  Base  |   |cRED{d}|
|    |cPNK|  |     {s}|   +-------+
|    |    |  \---+----/
+----+----+
@endditaa
</plantuml>

### Remove shadow or scale diagram
<plantuml>
@startditaa < --no-shadows, scale=0.7
+---------+  /--------\   +-------+
| cBLU    +--+cAAA    +---+Version|
|         |  |  Data  |   |   V3  |
|    +----+  |  Base  |   |cRED{d}|
|    |cPNK|  |     {s}|   +-------+
|    |    |  \---+----/
+----+----+
@endditaa
</plantuml>

## Tags

| Tag  | Description
| ---- | ------------
| {c}  | Choice or Decision
| {d}  | Document - Symbol representing a document
| {io} | Input/Output - Symbol representing input/output
| {mo} | Manual operation
| {o}  | Ellipse
| {s}  | Storage - Symbol representing a form of storage, like a database or a hard disk.
| {tr} | Trapezoid

<plantuml>
@startditaa
+------+------+------+------+------+------+------+
| c {c}|d {d} |io{io}|mo{mo}|o{o}  |s{s}  |tr{tr}|
+------+------+------+------+------+------+------+
@endditaa
</plantuml>

## More documentation

You will find the complete documentation about **ditaa** on:
* ditaa.sourceforge.net
* github.com/stathissideris/ditaa
