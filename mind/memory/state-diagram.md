## State Diagram

**State diagrams** provide a visual representation of the various states a system or an object can be in, as well as the transitions between those states. They are essential in modeling the dynamic behavior of systems, capturing how they respond to different events over time. State diagrams depict the system's life cycle, making it easier to understand, design, and optimize its behavior.

Using **PlantUML** to create state diagrams offers several advantages:
- **Text-Based Language**: Quickly define and visualize the states and transitions without the hassle of manual drawing.
- **Efficiency and Consistency**: Ensure streamlined diagram creation and easy version control.
- **Versatility**: Integrate with various documentation platforms and support multiple output formats.
- **Open-Source & Community Support**: Backed by a **strong community** that continuously contributes to its enhancements and offers invaluable resources.

## Simple State
You can use ``[*]`` for the starting point and ending point of
the state diagram.

Use ``-->`` for arrows.

<plantuml>
@startuml

[*] --> State1
State1 --> [*]
State1 : this is a string
State1 : this is another string

State1 -> State2
State2 --> [*]

@enduml
</plantuml>

## Change state rendering

You can use ``hide empty description`` to render state as simple box.

<plantuml>
@startuml
hide empty description
[*] --> State1
State1 --> [*]
State1 : this is a string
State1 : this is another string

State1 -> State2
State2 --> [*]
@enduml
</plantuml>

## Composite state

A state can also be composite. You have to define it using the ``state``
keywords and brackets.

###  Internal sub-state

<plantuml>
@startuml
scale 350 width
[*] --> NotShooting

state NotShooting {
  [*] --> Idle
  Idle --> Configuring : EvConfig
  Configuring --> Idle : EvConfig
}

state Configuring {
  [*] --> NewValueSelection
  NewValueSelection --> NewValuePreview : EvNewValue
  NewValuePreview --> NewValueSelection : EvNewValueRejected
  NewValuePreview --> NewValueSelection : EvNewValueSaved

  state NewValuePreview {
     State1 -> State2
  }

}
@enduml
</plantuml>

### Sub-state to sub-state

<plantuml>
@startuml
state A {
  state X {
  }
  state Y {
  }
}

state B {
  state Z {
  }
}

X --> Z
Z --> Y
@enduml
</plantuml>

<plantuml>
@startuml
state A.X
state A.Y

state B.Z

X --> Z
Z --> Y
@enduml
</plantuml>

## Long name

You can also use the ``state`` keyword to use long description
for states.

<plantuml>
@startuml
scale 600 width

[*] -> State1
State1 --> State2 : Succeeded
State1 --> [*] : Aborted
State2 --> State3 : Succeeded
State2 --> [*] : Aborted
state State3 {
  state "Accumulate Enough Data\nLong State Name" as long1
  long1 : Just a test
  [*] --> long1
  long1 --> long1 : New Data
  long1 --> ProcessData : Enough Data
}
State3 --> State3 : Failed
State3 --> [*] : Succeeded / Save Result
State3 --> [*] : Aborted

@enduml
</plantuml>

## History [[H], [H*]]

You can use ``[H]`` for the history and ``[H*]`` for the deep history of a substate.

<plantuml>
@startuml
[*] -> State1
State1 --> State2 : Succeeded
State1 --> [*] : Aborted
State2 --> State3 : Succeeded
State2 --> [*] : Aborted
state State3 {
  state "Accumulate Enough Data" as long1
  long1 : Just a test
  [*] --> long1
  long1 --> long1 : New Data
  long1 --> ProcessData : Enough Data
  State2 --> [H]: Resume
}
State3 --> State2 : Pause
State2 --> State3[H*]: DeepResume
State3 --> State3 : Failed
State3 --> [*] : Succeeded / Save Result
State3 --> [*] : Aborted
@enduml
</plantuml>

## Fork [fork, join]

You can also fork and join using the ``<<fork>>`` and ``<<join>>`` stereotypes.

<plantuml>
@startuml

state fork_state <<fork>>
[*] --> fork_state
fork_state --> State2
fork_state --> State3

state join_state <<join>>
State2 --> join_state
State3 --> join_state
join_state --> State4
State4 --> [*]

@enduml
</plantuml>

## Concurrent state [--, ||]

You can define concurrent state into a composite state using either ``--``
or ``||`` symbol as separator.

### Horizontal separator ``--``
<plantuml>
@startuml
[*] --> Active

state Active {
  [*] -> NumLockOff
  NumLockOff --> NumLockOn : EvNumLockPressed
  NumLockOn --> NumLockOff : EvNumLockPressed
  --
  [*] -> CapsLockOff
  CapsLockOff --> CapsLockOn : EvCapsLockPressed
  CapsLockOn --> CapsLockOff : EvCapsLockPressed
  --
  [*] -> ScrollLockOff
  ScrollLockOff --> ScrollLockOn : EvScrollLockPressed
  ScrollLockOn --> ScrollLockOff : EvScrollLockPressed
}

@enduml
</plantuml>

### Vertical separator ``||``
<plantuml>
@startuml
[*] --> Active

state Active {
  [*] -> NumLockOff
  NumLockOff --> NumLockOn : EvNumLockPressed
  NumLockOn --> NumLockOff : EvNumLockPressed
  ||
  [*] -> CapsLockOff
  CapsLockOff --> CapsLockOn : EvCapsLockPressed
  CapsLockOn --> CapsLockOff : EvCapsLockPressed
  ||
  [*] -> ScrollLockOff
  ScrollLockOff --> ScrollLockOn : EvScrollLockPressed
  ScrollLockOn --> ScrollLockOff : EvScrollLockPressed
}

@enduml
</plantuml>

## Conditional [choice]

The stereotype ``<<choice>>`` can be used to use conditional state.

<plantuml>
@startuml
state "Req(Id)" as ReqId <<sdlreceive>>
state "Minor(Id)" as MinorId
state "Major(Id)" as MajorId

state c <<choice>>

Idle --> ReqId
ReqId --> c
c --> MinorId : [Id <= 10]
c --> MajorId : [Id > 10]
@enduml
</plantuml>

## Stereotypes full example [start, choice, fork, join, end, history, history*]

### Start, choice, fork, join, end
<plantuml>
@startuml
state start1  <<start>>
state choice1 <<choice>>
state fork1   <<fork>>
state join2   <<join>>
state end3    <<end>>

[*]     --> choice1 : from start\nto choice
start1  --> choice1 : from start stereo\nto choice

choice1 --> fork1   : from choice\nto fork
choice1 --> join2   : from choice\nto join
choice1 --> end3    : from choice\nto end stereo

fork1   ---> State1 : from fork\nto state
fork1   --> State2  : from fork\nto state

State2  --> join2   : from state\nto join
State1  --> [*]     : from state\nto end

join2   --> [*]     : from join\nto end
@enduml
</plantuml>

*(https://forum.plantuml.net/404/choice-pseudostate?show=436#c436), QA-1159 and GH-887]*

### History, history*
<plantuml>
state A {
   state s1 as "Start 1" <<start>>
   state s2 as "H 2" <<history>>
   state s3 as "H 3" <<history*>>
}
</plantuml>

### Minimal example with all stereotypes
<plantuml>
@startuml
state start1  <<start>>
state choice1 <<choice>>
state fork1   <<fork>>
state join2   <<join>>
state end3    <<end>>
state sdlreceive <<sdlreceive>>
state history <<history>>
state history2 <<history*>>
@enduml
</plantuml>

## Point [entryPoint, exitPoint]

You can add **point** with `<<entryPoint>>` and `<<exitPoint>>` stereotypes:

<plantuml>
@startuml
state Somp {
  state entry1 <<entryPoint>>
  state entry2 <<entryPoint>>
  state sin
  state exitA <<exitPoint>>

  entry1 --> sin
  entry2 -> sin
  sin -> sin2
  sin2 --> exitA
}

[*] --> entry1
exitA --> Foo
Foo1 -> entry2
@enduml
</plantuml>

## Pin [inputPin, outputPin]

You can add **pin** with `<<inputPin>>` and `<<outputPin>>` stereotypes:

<plantuml>
@startuml
state Somp {
  state entry1 <<inputPin>>
  state entry2 <<inputPin>>
  state sin
  state exitA <<outputPin>>

  entry1 --> sin
  entry2 -> sin
  sin -> sin2
  sin2 --> exitA
}

[*] --> entry1
exitA --> Foo
Foo1 -> entry2
@enduml
</plantuml>

## Expansion [expansionInput, expansionOutput]

You can add **expansion** with `<<expansionInput>>` and `<<expansionOutput>>` stereotypes:

<plantuml>
@startuml
state Somp {
  state entry1 <<expansionInput>>
  state entry2 <<expansionInput>>
  state sin
  state exitA <<expansionOutput>>

  entry1 --> sin
  entry2 -> sin
  sin -> sin2
  sin2 --> exitA
}

[*] --> entry1
exitA --> Foo
Foo1 -> entry2
@enduml
</plantuml>

## Arrow direction

You can use ``->`` for horizontal arrows. It is possible to
force arrow's direction using the following syntax:
* ``-down->`` or ``-->``
* ``-right->`` or ``->`` *(default arrow)*
* ``-left->``
* ``-up->``

<plantuml>
@startuml

[*] -up-> First
First -right-> Second
Second --> Third
Third -left-> Last

@enduml
</plantuml>
You can shorten the arrow definition by using only the first character of the direction (for example, ``-d-`` instead of
``-down-``)
or the two first characters (``-do-``).

Please note that you should not abuse this functionality : *Graphviz* gives usually good results without tweaking.

## Change line color and style

You can change line color and/or line style.

<plantuml>
@startuml
State S1
State S2
S1 -[#DD00AA]-> S2
S1 -left[#yellow]-> S3
S1 -up[#red,dashed]-> S4
S1 -right[dotted,#blue]-> S5

X1 -[dashed]-> X2
Z1 -[dotted]-> Z2
Y1 -[#blue,bold]-> Y2
@enduml
</plantuml>

## Change head or tail of arrow line

<plantuml>
@startuml
state a

a -> b : ->
c x-> d : x->
e ->o f : <U+0020>->o
g x->o h : x->o
@enduml
</plantuml>

## Note

You can also define notes using
``note left of``, ``note right of``, ``note top of``, ``note bottom of``
keywords.

You can also define notes on several lines.
<plantuml>
@startuml

[*] --> Active
Active --> Inactive

note left of Active : this is a short\nnote

note right of Inactive
  A note can also
  be defined on
  several lines
end note

@enduml
</plantuml>

You can also add note on start or end state:
<plantuml>
@startuml
state start <<start>>
start -> A
note left of start : this is a short note on start

state end <<end>>
A -> end

note right of end
 note
 on end
end note
@enduml
</plantuml>

You can also have floating notes.
<plantuml>
@startuml

state foo
note "This is a floating note" as N1

@enduml
</plantuml>

## Note on link

You can put notes on state-transition or link, with ``note on link`` keyword.

<plantuml>
@startuml
[*] -> State1
State1 --> State2
note on link
  this is a state-transition note
end note
@enduml
</plantuml>

## More in notes

You can put notes on composite states.
<plantuml>
@startuml

[*] --> NotShooting

state "Not Shooting State" as NotShooting {
  state "Idle mode" as Idle
  state "Configuring mode" as Configuring
  [*] --> Idle
  Idle --> Configuring : EvConfig
  Configuring --> Idle : EvConfig
}

note right of NotShooting : This is a note on a composite state

@enduml
</plantuml>

## Inline color

<plantuml>
@startuml
state CurrentSite #pink {
    state HardwareSetup #lightblue {
       state Site #brown
        Site -[hidden]-> Controller
        Controller -[hidden]-> Devices
    }
    state PresentationSetup{
        Groups -[hidden]-> PlansAndGraphics
    }
    state Trends #FFFF77
    state Schedule #magenta
    state AlarmSupression
}
@enduml
</plantuml>

## Skinparam

You can use the skinparam command to change colors and fonts for the drawing.

You can use this command :
* In the diagram definition, like any other commands,
* In an included file,
* In a configuration file, provided in the command line or the Ant task.
You can define specific color and fonts for stereotyped states.

<plantuml>
@startuml
skinparam backgroundColor LightYellow
skinparam state {
  StartColor MediumBlue
  EndColor Red
  BackgroundColor Peru
  BackgroundColor<<Warning>> Olive
  BorderColor Gray
  FontName Impact
}

[*] --> NotShooting

state "Not Shooting State" as NotShooting {
  state "Idle mode" as Idle <<Warning>>
  state "Configuring mode" as Configuring
  [*] --> Idle
  Idle --> Configuring : EvConfig
  Configuring --> Idle : EvConfig
}

NotShooting --> [*]
@enduml
</plantuml>

### Test of all specific skinparam to State Diagrams
<plantuml>
@startuml
skinparam State {
  AttributeFontColor blue
  AttributeFontName serif
  AttributeFontSize  9
  AttributeFontStyle italic
  BackgroundColor palegreen
  BorderColor violet
  EndColor gold
  FontColor red
  FontName Sansserif
  FontSize 15
  FontStyle bold
  StartColor silver
}

state A : a a a\na
state B : b b b\nb

[*] -> A  : start
A -> B : a2b
B -> [*] : end
@enduml
</plantuml>

## Changing style

You can change style.

<plantuml>
@startuml

<style>
stateDiagram {
  BackgroundColor Peru
  'LineColor Gray
  FontName Impact
  FontColor Red
  arrow {
    FontSize 13
    LineColor Blue
  }
}
</style>

[*] --> NotShooting

state "Not Shooting State" as NotShooting {
  state "Idle mode" as Idle <<Warning>>
  state "Configuring mode" as Configuring
  [*] --> Idle
  Idle --> Configuring : EvConfig
  Configuring --> Idle : EvConfig
}

NotShooting --> [*]
@enduml
</plantuml>

<plantuml>
@startuml
<style>
  diamond {
    BackgroundColor #palegreen
    LineColor #green
    LineThickness 2.5
}
</style>
state state1
state state2
state choice1 <<choice>>
state end3    <<end>>

state1  --> choice1 : 1
choice1 --> state2  : 2
choice1 --> end3    : 3
@enduml
</plantuml>

## Change state color and style (inline style)

You can change the color or style of individual state using the following notation:

* `#color ##[style]color`

With background color first (`#color`), then line style and line color (`##[style]color` ).

<plantuml>
@startuml
state FooGradient #red-green ##00FFFF
state FooDashed #red|green ##[dashed]blue {
}
state FooDotted ##[dotted]blue {
}
state FooBold ##[bold] {
}
state Foo1 ##[dotted]green {
state inner1 ##[dotted]yellow
}

state out ##[dotted]gold

state Foo2 ##[bold]green {
state inner2 ##[dotted]yellow
}
inner1 -> inner2
out -> inner2
@enduml
</plantuml>

* `#color;line:color;line.[bold|dashed|dotted];text:color`

[[#FFD700#FIXME]] 🚩
`text:color` seems not to be taken into account
[[#FFD700#FIXME]]

<plantuml>
@startuml
@startuml
state FooGradient #red-green;line:00FFFF
state FooDashed #red|green;line.dashed;line:blue {
}
state FooDotted #line.dotted;line:blue {
}
state FooBold #line.bold {
}
state Foo1 #line.dotted;line:green {
state inner1 #line.dotted;line:yellow
}

state out #line.dotted;line:gold

state Foo2 #line.bold;line:green {
state inner2 #line.dotted;line:yellow
}
inner1 -> inner2
out -> inner2
@enduml
@enduml
</plantuml>
<plantuml>
@startuml
state s1 : s1 description
state s2 #pink;line:red;line.bold;text:red : s2 description
state s3 #palegreen;line:green;line.dashed;text:green : s3 description
state s4 #aliceblue;line:blue;line.dotted;text:blue   : s4 description
@enduml
</plantuml>

*Adapted from [QA-3770]*

## Alias

With State you can use `alias`, like:

<plantuml>
@startuml
state alias1
state "alias2"
state "long name" as alias3
state alias4 as "long name"

alias1 : ""state alias1""
alias2 : ""state "alias2"""
alias3 : ""state "long name" as alias3""
alias4 : ""state alias4 as "long name"""

alias1 -> alias2
alias2 -> alias3
alias3 -> alias4
@enduml
</plantuml>

or:
<plantuml>
@startuml
state alias1 : ""state alias1""
state "alias2" : ""state "alias2"""
state "long name" as alias3 : ""state "long name" as alias3""
state alias4 as "long name" : ""state alias4 as "long name"""

alias1 -> alias2
alias2 -> alias3
alias3 -> alias4
@enduml
</plantuml>

*(https://forum.plantuml.net/1748/one-line-declaration-in-state-diagram), QA-14560]*

## Display JSON Data on State diagram

### Simple example
<plantuml>
state "A" as stateA
state "C" as stateC {
 state B
}

json jsonJ {
   "fruit":"Apple",
   "size":"Large",
   "color": ["Red", "Green"]
}
</plantuml>

For another example, see on JSON page.

## State description

You can add description to a state or to a composite state.

<plantuml>
@startuml
hide empty description

state s0

state "This is the State 1" as s1 {
  s1: State description
  state s2
  state s3: long descr.
  state s4
  s4: long descr.
}

[*] -> s0
s0 --> s2

s2 -> s3
s3 -> s4
@enduml
</plantuml>

## Style for Nested State Body

<plantuml>
@startuml
<style>
.foo {
  state,stateBody {
    BackGroundColor lightblue;
  }
}
</style>

state MainState <<foo>> {
  state SubA
}
@enduml
</plantuml>

## Mainframe and frame

### Mainframe
You can use global mainframe:
<plantuml>
@startuml
mainframe mainframe
state a

state b
a --> b
b--> [*]
@enduml
</plantuml>

_See also: Mainframe on all diagram._

### Frame
Or simply local frame:
<plantuml>
@startuml
frame frame {
state a
}
state b
a --> b
b--> [*]
@enduml
</plantuml>

## Specific SkinParameter

### By default

By default label are near arrow.

<plantuml>
@startuml
[*] --> State1
State1 --> State2 : next step
State2 --> State3 : next step
State3 --> [*]
@enduml
</plantuml>
<plantuml>
@startuml
[*] --> Opened

Opened --> Closed : close
Opened <-- Closed : open

Closed --> Locked : lock
Closed <-- Locked : unlock
@enduml
</plantuml>

### Edge Label Style

You can use `skinparam  stateDiagramEdgeLabelStyle node` to put label on the middle of the arrow, and create a pseudo node.

<plantuml>
@startuml
skinparam stateDiagramEdgeLabelStyle node
skinparam ranksep 20

[*] --> State1
State1 --> State2 : next step
State2 --> State3 : next step
State3 --> [*]
@enduml
</plantuml>
<plantuml>
@startuml
skinparam stateDiagramEdgeLabelStyle node
skinparam ranksep 20

[*] --> Opened

Opened --> Closed : close
Opened <-- Closed : open

Closed --> Locked : lock
Closed <-- Locked : unlock
@enduml
</plantuml>

### Mix label defintion

By using localy `-[node]->` form.

<plantuml>
@startuml
skinparam ranksep 30
[*] --> State1
State1 --> State2 : next step
State2 -[node]-> State3 : next step\n(on the middle of the arrow)
State3 --> [*]
@enduml
</plantuml>
