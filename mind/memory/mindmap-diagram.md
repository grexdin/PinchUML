## MindMap

A **MindMap diagram**, in the context of **PlantUML**, is an effective tool for **brainstorming**, organizing ideas, and project planning. MindMap diagrams, or mind maps, are **visual representations** of information, where central ideas branch out into related topics, creating a spider-web of concepts. PlantUML facilitates the creation of these diagrams with its simple, **text-based syntax**, allowing for the efficient organization and visualization of complex ideas.

Using PlantUML for MindMaps is particularly advantageous due to its **integration with other tools** and systems. This integration streamlines the process of incorporating mind maps into larger project documentation. PlantUML's text-based approach also enables easy modification and **version control** of the mind maps, making it a dynamic tool for collaborative brainstorming and idea development.

MindMaps in PlantUML can be used for various purposes, from outlining the structure of a project to brainstorming product features or business strategies. The **hierarchical and intuitive layout** of mind maps helps in identifying relationships between different ideas and concepts, making it easier to see the bigger picture and to pinpoint areas that require further exploration. This makes PlantUML an invaluable tool for project managers, developers, and business analysts who require a method to visually organize and present complex information in a clear and concise manner.

## OrgMode syntax

This syntax is compatible with OrgMode and its tree syntax.

<plantuml>
@startmindmap
* Debian
** Ubuntu
*** Linux Mint
*** Kubuntu
*** Lubuntu
*** KDE Neon
** LMDE
** SolydXK
** SteamOS
** Raspbian with a very long name
*** <s>Raspmbc</s> => OSMC
*** <s>Raspyfi</s> => Volumio
@endmindmap
</plantuml>

## Markdown syntax

This syntax is compatible with Markdown.

### Markdown Header

You can use Markdown header:
<plantuml>
@startmindmap
# root node
## some first level node

### second level node

### another second level node

## another first level node
@endmindmap
</plantuml>

### Markdown indented list

You can use Markdown list or GFM list:
<plantuml>
@startmindmap
* root node
	* some first level node
		* second level node
		* another second level node
	* another first level node
@endmindmap
</plantuml>

## Arithmetic notation

You can use the following notation to choose diagram side.

<plantuml>
@startmindmap
+ OS
++ Ubuntu
+++ Linux Mint
+++ Kubuntu
+++ Lubuntu
+++ KDE Neon
++ LMDE
++ SolydXK
++ SteamOS
++ Raspbian
-- Windows 95
-- Windows 98
-- Windows NT
--- Windows 8
--- Windows 10
@endmindmap
</plantuml>

## Multilines

You can use ``:`` and ``;`` to have multilines box.

<plantuml>
@startmindmap
* Class Templates
**:Example 1
<code>
template <typename T>
class cname{
void f1()<U+003B>
...
}
</code>
;
**:Example 2
<code>
other template <typename T>
class cname{
...
</code>
;
@endmindmap
</plantuml>

<plantuml>
@startmindmap
+ root
**:right_1.1
right_1.2;
++ right_2

left side

-- left_1
-- left_2
**:left_3.1
left_3.2;
@endmindmap
</plantuml>

## Multiroot Mindmap

You can create multiroot mindmap, as:

<plantuml>
@startmindmap
* Root 1
** Foo
** Bar
* Root 2
** Lorem
** Ipsum
@endmindmap
</plantuml>

## Colors

It is possible to change node color.

### With inline color

* OrgMode syntax mindmap
<plantuml>
@startmindmap
*[#Orange] Colors
**[#lightgreen] Green
**[#FFBBCC] Rose
**[#lightblue] Blue
@endmindmap
</plantuml>

* Arithmetic notation syntax mindmap
<plantuml>
@startmindmap
+[#Orange] Colors
++[#lightgreen] Green
++[#FFBBCC] Rose
--[#lightblue] Blue
@endmindmap
</plantuml>

* Markdown syntax mindmap
<plantuml>
@startmindmap
*[#Orange] root node
 *[#lightgreen] some first level node
  *[#FFBBCC] second level node
  *[#lightblue] another second level node
 *[#lightgreen] another first level node
@endmindmap
</plantuml>

### With style color

* OrgMode syntax mindmap
<plantuml>
@startmindmap
<style>
mindmapDiagram {
  .green {
    BackgroundColor lightgreen
  }
  .rose {
    BackgroundColor #FFBBCC
  }
  .your_style_name {
    BackgroundColor lightblue
  }
}
</style>
* Colors
** Green <<green>>
** Rose <<rose>>
** Blue <<your_style_name>>
@endmindmap
</plantuml>

* Arithmetic notation syntax mindmap
<plantuml>
@startmindmap
<style>
mindmapDiagram {
  .green {
    BackgroundColor lightgreen
  }
  .rose {
    BackgroundColor #FFBBCC
  }
  .your_style_name {
    BackgroundColor lightblue
  }
}
</style>
+ Colors
++ Green <<green>>
++ Rose <<rose>>
-- Blue <<your_style_name>>
@endmindmap
</plantuml>

* Markdown syntax mindmap
<plantuml>
@startmindmap
<style>
mindmapDiagram {
  .green {
    BackgroundColor lightgreen
  }
  .rose {
    BackgroundColor #FFBBCC
  }
  .your_style_name {
    BackgroundColor lightblue
  }
}
</style>
* root node
 * some first level node <<green>>
  * second level node <<rose>>
  * another second level node <<your_style_name>>
 * another first level node <<green>>
@endmindmap
</plantuml>

* Apply style to a branch

<plantuml>
@startmindmap
<style>
mindmapDiagram {
  .myStyle * {
    BackgroundColor lightgreen
  }
}
</style>
+ root
++ b1 <<myStyle>>
+++ b11
+++ b12
++ b2
@endmindmap
</plantuml>

## Removing box

You can remove the box drawing using an underscore.

<plantuml>
@startmindmap
* root node
** some first level node
***_ second level node
***_ another second level node
***_ foo
***_ bar
***_ foobar
** another first level node
@endmindmap
</plantuml>
<plantuml>
@startmindmap
*_ root node
**_ some first level node
***_ second level node
***_ another second level node
***_ foo
***_ bar
***_ foobar
**_ another first level node
@endmindmap
</plantuml>

<plantuml>
@startmindmap
+ root node
++ some first level node
+++_ second level node
+++_ another second level node
+++_ foo
+++_ bar
+++_ foobar
++_ another first level node
-- some first right level node
--_ another first right level node
@endmindmap
</plantuml>

## Changing diagram direction

It is possible to use both sides of the diagram.

<plantuml>
@startmindmap
* count
** 100
*** 101
*** 102
** 200

left side

** A
*** AA
*** AB
** B
@endmindmap
</plantuml>

## Change (whole) diagram orientation

You can change (whole) diagram orientation with:
- `left to right direction` _(by default)_
- `top to bottom direction`
- `right to left direction`
- `bottom to top direction` _(not yet implemented/issue then use workaround)_

### Left to right direction _(by default)_

<plantuml>
@startmindmap
* 1
** 2
*** 4
*** 5
** 3
*** 6
*** 7
@endmindmap
</plantuml>

### Top to bottom direction

<plantuml>
@startmindmap
top to bottom direction
* 1
** 2
*** 4
*** 5
** 3
*** 6
*** 7
@endmindmap
</plantuml>

### Right to left direction

<plantuml>
@startmindmap
right to left direction
* 1
** 2
*** 4
*** 5
** 3
*** 6
*** 7
@endmindmap
</plantuml>

### Bottom to top direction

<plantuml>
@startmindmap
top to bottom direction
left side
* 1
** 2
*** 4
*** 5
** 3
*** 6
*** 7
@endmindmap
</plantuml>

## Complete example

<plantuml>
@startmindmap
caption figure 1
title My super title

* <&flag>Debian
** <&globe>Ubuntu
*** Linux Mint
*** Kubuntu
*** Lubuntu
*** KDE Neon
** <&graph>LMDE
** <&pulse>SolydXK
** <&people>SteamOS
** <&star>Raspbian with a very long name
*** <s>Raspmbc</s> => OSMC
*** <s>Raspyfi</s> => Volumio

header
My super header
endheader

center footer My super footer

legend right
  Short
  legend
endlegend
@endmindmap
</plantuml>

## Changing style

### node, depth
<plantuml>
@startmindmap
<style>
mindmapDiagram {
    node {
        BackgroundColor lightGreen
    }
    :depth(1) {
      BackGroundColor white
    }
}
</style>
* Linux
** NixOS
** Debian
*** Ubuntu
**** Linux Mint
**** Kubuntu
**** Lubuntu
**** KDE Neon
@endmindmap
</plantuml>

### boxless
<plantuml>
@startmindmap
<style>
mindmapDiagram {
  node {
    BackgroundColor lightGreen
  }
  boxless {
    FontColor darkgreen
  }
}
</style>
* Linux
** NixOS
** Debian
***_ Ubuntu
**** Linux Mint
**** Kubuntu
**** Lubuntu
**** KDE Neon
@endmindmap
</plantuml>

## Word Wrap

Using ``MaximumWidth`` setting you can control automatic word wrap. Unit used is pixel.

<plantuml>
@startmindmap

<style>
node {
    Padding 12
    Margin 3
    HorizontalAlignment center
    LineColor blue
    LineThickness 3.0
    BackgroundColor gold
    RoundCorner 40
    MaximumWidth 100
}

rootNode {
    LineStyle 8.0;3.0
    LineColor red
    BackgroundColor white
    LineThickness 1.0
    RoundCorner 0
    Shadowing 0.0
}

leafNode {
    LineColor gold
    RoundCorner 0
    Padding 3
}

arrow {
    LineStyle 4
    LineThickness 0.5
    LineColor green
}
</style>

* Hi =)
** sometimes i have node in wich i want to write a long text
*** this results in really huge diagram
**** of course, i can explicit split with a\nnew line
**** but it could be cool if PlantUML was able to split long lines, maybe with an option

@endmindmap
</plantuml>

## Creole on Mindmap diagram

You can use Creole or HTML Creole on Mindmap:

<plantuml>
@startmindmap
* Creole on Mindmap
left side
**:==Creole
  This is **bold**
  This is //italics//
  This is ""monospaced""
  This is --stricken-out--
  This is __underlined__
  This is ~~wave-underlined~~
--test Unicode and icons--
  This is <U+221E> long
  This is a <&code> icon
  Use image : <img:https://plantuml.com/logo3.png>
;
**: <b>HTML Creole
  This is <b>bold</b>
  This is <i>italics</i>
  This is <font:monospaced>monospaced</font>
  This is <s>stroked</s>
  This is <u>underlined</u>
  This is <w>waved</w>
  This is <s:green>stroked</s>
  This is <u:red>underlined</u>
  This is <w:#0000FF>waved</w>
-- other examples --
  This is <color:blue>Blue</color>
  This is <back:orange>Orange background</back>
  This is <size:20>big</size>
;
right side
**:==Creole line
You can have horizontal line
----
Or double line
====
Or strong line
____
Or dotted line
..My title..
Or dotted title
//and title... //
==Title==
Or double-line title
--Another title--
Or single-line title
Enjoy!;
**:==Creole list item
**test list 1**
* Bullet list
* Second item
** Sub item
*** Sub sub item
* Third item
----
**test list 2**
# Numbered list
# Second item
## Sub item

## Another sub item
# Third item
;
@endmindmap

</plantuml>
