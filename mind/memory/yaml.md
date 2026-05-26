## Display YAML Data

YAML format is widely used in software.

You can use PlantUML to visualize your data.

To activate this feature, the diagram must:
* begin with ``@startyaml`` keyword
* end with ``@endyaml`` keyword.

<plantuml>
@startyaml
fruit: Apple
size: Large
color:
  - Red
  - Green
@endyaml
</plantuml>

## Complex example

<plantuml>
@startyaml
doe: "a deer, a female deer"
ray: "a drop of golden sun"
pi: 3.14159
xmas: true
french-hens: 3
calling-birds:
	- huey
	- dewey
	- louie
	- fred
xmas-fifth-day:
	calling-birds: four
	french-hens: 3
	golden-rings: 5
	partridges:
		count: 1
		location: "a pear tree"
	turtle-doves: two
@endyaml
</plantuml>

## Specific key (with symbols or unicode)
<plantuml>
@startyaml
@fruit: Apple
$size: Large
&color: Red
❤: Heart
‰: Per mille
@endyaml
</plantuml>

## Highlight parts

### Normal style
<plantuml>
@startyaml
#highlight "french-hens"
#highlight "xmas-fifth-day" / "partridges"

doe: "a deer, a female deer"
ray: "a drop of golden sun"
pi: 3.14159
xmas: true
french-hens: 3
calling-birds:
	- huey
	- dewey
	- louie
	- fred
xmas-fifth-day:
	calling-birds: four
	french-hens: 3
	golden-rings: 5
	partridges:
		count: 1
		location: "a pear tree"
	turtle-doves: two
@endyaml
</plantuml>

### Customised style
<plantuml>
@startyaml
<style>
yamlDiagram {
    highlight {
      BackGroundColor red
      FontColor white
      FontStyle italic
    }
}
</style>
#highlight "french-hens"
#highlight "xmas-fifth-day" / "partridges"

doe: "a deer, a female deer"
ray: "a drop of golden sun"
pi: 3.14159
xmas: true
french-hens: 3
calling-birds:
	- huey
	- dewey
	- louie
	- fred
xmas-fifth-day:
	calling-birds: four
	french-hens: 3
	golden-rings: 5
	partridges:
		count: 1
		location: "a pear tree"
	turtle-doves: two
@endyaml
</plantuml>

## Using different styles for highlight

It is possible to have different styles for different highlights.

<plantuml>
@startyaml
<style>
    .h1 {
      BackGroundColor green
      FontColor white
      FontStyle italic
    }
    .h2 {
      BackGroundColor red
      FontColor white
      FontStyle italic
    }
</style>
#highlight "french-hens" <<h1>>
#highlight "xmas-fifth-day" / "partridges" <<h2>>

doe: "a deer, a female deer"
ray: "a drop of golden sun"
pi: 3.14159
xmas: true
french-hens: 3
calling-birds:
	- huey
	- dewey
	- louie
	- fred
xmas-fifth-day:
	calling-birds: four
	french-hens: 3
	golden-rings: 5
	partridges:
		count: 1
		location: "a pear tree"
	turtle-doves: two
@endyaml
</plantuml>

*(https://forum.plantuml.net/15756/yaml-multiple-highlight-defs), GH-1393]*

## Using (global) style

### Without style *(by default)*
<plantuml>
@startyaml
  -
    name: Mark McGwire
    hr:   65
    avg:  0.278
  -
    name: Sammy Sosa
    hr:   63
    avg:  0.288
@endyaml
</plantuml>

### With style

You can use style to change rendering of elements.

<plantuml>
@startyaml
<style>
yamlDiagram {
  node {
    BackGroundColor lightblue
    LineColor lightblue
    FontName Helvetica
    FontColor red
    FontSize 18
    FontStyle bold
    BackGroundColor Khaki
    RoundCorner 0
    LineThickness 2
    LineStyle 10-5
    separator {
      LineThickness 0.5
      LineColor black
      LineStyle 1-5
    }
  }
  arrow {
    BackGroundColor lightblue
    LineColor green
    LineThickness 2
    LineStyle 2-5
  }
}
</style>
  -
    name: Mark McGwire
    hr:   65
    avg:  0.278
  -
    name: Sammy Sosa
    hr:   63
    avg:  0.288
@endyaml
</plantuml>

## Creole on YAML

You can use Creole or HTML Creole on YAML diagram:

<plantuml>
@startyaml
Creole:
  wave: ~~wave~~
  bold: **bold**
  italics: //italics//
  monospaced: ""monospaced""
  stricken-out: --stricken-out--
  underlined: __underlined__
  not-underlined: ~__not underlined__
  wave-underlined: ~~wave-underlined~~
HTML Creole:
  bold: <b>bold
  italics: <i>italics
  monospaced: <font:monospaced>monospaced
  stroked: <s>stroked
  underlined: <u>underlined
  waved: <w>waved
  green-stroked: <s:green>stroked
  red-underlined: <u:red>underlined
  blue-waved: <w:#0000FF>waved
  Blue: <color:blue>Blue
  Orange: <back:orange>Orange background
  big: <size:20>big
Graphic:
  OpenIconic: account-login <&account-login>
  Unicode: This is <U+221E> long
  Emoji: <:calendar:> Calendar
  Image: <img:https://plantuml.com/logo3.png>
@endyaml
</plantuml>
