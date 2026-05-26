## Object Diagram

An **object diagram** is a graphical representation that showcases objects and their relationships at a specific moment in time. It provides a snapshot of the system's structure, capturing the static view of the instances present and their associations.

**PlantUML** offers a simple and intuitive way to create object diagrams using plain text. Its user-friendly syntax allows for quick diagram creation without the need for complex GUI tools. Moreover, the PlantUML forum provides a platform for users to discuss, share, and seek assistance, fostering a collaborative community. By choosing PlantUML, users benefit from both the efficiency of markdown-based diagramming and the support of an active community.

## Definition of objects

You define instances of objects using the ``object``
keyword.

<plantuml>
@startuml
object firstObject
object "My Second Object" as o2
@enduml
</plantuml>

## Relations between objects

Relations between objects are defined using the following symbols :

| Type           | Symbol   | Purpose                                       |
| -------------- | -------- | --------------------------------------------- |
| Extension      | ``<|--`` | Specialization of a class in a hierarchy      |
| Implementation | ``<|..`` | Realization of an interface by a class        |
| Composition    | ``*--``  | The part cannot exist without the whole       |
| Aggregation    | ``o--``  | The part can exist independently of the whole |
| Dependency     | ``-->``  | The object uses another object                |
| Dependency     | ``..>``  | A weaker form of dependency                   |

It is possible to replace ``--`` by ``..`` to have a dotted line.

Knowing those rules, it is possible to draw the following drawings.

It is possible a add a label on the relation, using ``:`` followed by the text of the label.

For cardinality, you can use double-quotes ``""`` on
each side of the relation.

<plantuml>
@startuml
object Object01
object Object02
object Object03
object Object04
object Object05
object Object06
object Object07
object Object08

Object01 <|-- Object02
Object03 *-- Object04
Object05 o-- "4" Object06
Object07 .. Object08 : some labels
@enduml
</plantuml>

## Associations objects

<plantuml>
@startuml
object o1
object o2
diamond dia
object o3

o1  --> dia
o2  --> dia
dia --> o3
@enduml
</plantuml>

## Adding fields

To declare fields, you can use the symbol ``:`` followed by
the field's name.

<plantuml>
@startuml

object user

user : name = "Dummy"
user : id = 123

@enduml
</plantuml>

And you can mix objet's fields definition:
<plantuml>
@startuml

object user1
object user2

user1 : name = "User A"
user2 : name = "User B"

user1 : id = 123
user2 : id = 456

@enduml
</plantuml>

It is also possible to group all fields between brackets ``{}``.

<plantuml>
@startuml

object user {
  name = "Dummy"
  id = 123
}

@enduml
</plantuml>

## Common features with class diagrams

* Hide attributes, methods...
* Defines notes
* Use packages
* Skin the output

## Map table or associative array

You can define a map table or associative array, with `map` keyword and `=>` separator.

<plantuml>
@startuml
map CapitalCity {
 UK => London
 USA => Washington
 Germany => Berlin
}
@enduml
</plantuml>

<plantuml>
@startuml
map "Map **Contry => CapitalCity**" as CC {
 UK => London
 USA => Washington
 Germany => Berlin
}
@enduml
</plantuml>

<plantuml>
@startuml
map "map: Map<Integer, String>" as users {
 1 => Alice
 2 => Bob
 3 => Charlie
}
@enduml
</plantuml>

And add link with object.
<plantuml>
@startuml
object London

map CapitalCity {
 UK *-> London
 USA => Washington
 Germany => Berlin
}
@enduml
</plantuml>

<plantuml>
@startuml
object London
object Washington
object Berlin
object NewYork

map CapitalCity {
 UK *-> London
 USA *--> Washington
 Germany *---> Berlin
}

NewYork --> CapitalCity::USA
@enduml
</plantuml>

<plantuml>
@startuml
package foo {
    object baz
}

package bar {
    map A {
        b *-> foo.baz
        c =>
    }
}

A::c --> foo
@enduml
</plantuml>

<plantuml>
@startuml
object Foo
map Bar {
  abc=>
  def=>
}
object Baz

Bar::abc --> Baz : Label one
Foo --> Bar::def : Label two
@enduml
</plantuml>

## Program (or project) evaluation and review technique (PERT) with map

You can use `map table` in order to make Program (or project) evaluation and review technique (PERT) diagram.

<plantuml>
@startuml PERT
left to right direction
' Horizontal lines: -->, <--, <-->
' Vertical lines: ->, <-, <->
title PERT: Project Name

map Kick.Off {
}
map task.1 {
    Start => End
}
map task.2 {
    Start => End
}
map task.3 {
    Start => End
}
map task.4 {
    Start => End
}
map task.5 {
    Start => End
}
Kick.Off --> task.1 : Label 1
Kick.Off --> task.2 : Label 2
Kick.Off --> task.3 : Label 3
task.1 --> task.4
task.2 --> task.4
task.3 --> task.4
task.4 --> task.5 : Label 4
@enduml
</plantuml>

## Display JSON Data on Class or Object diagram

### Simple example
<plantuml>
@startuml
class Class
object Object
json JSON {
   "fruit":"Apple",
   "size":"Large",
   "color": ["Red", "Green"]
}
@enduml
</plantuml>

For another example, see on JSON page.
