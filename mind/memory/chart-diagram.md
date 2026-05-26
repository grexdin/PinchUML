## Chart Diagram

Starting with version **1.2026.0**, PlantUML includes support for chart diagrams, enabling you to create several types of charts directly within your PlantUML documents. Supported chart types include bar charts, line charts, area charts, and scatter plots. The feature also offers advanced styling options, multiple axes, annotations, and full integration with the PlantUML style system.

This new functionality is made possible thanks to the excellent work of David Fyfe, whom we warmly thank for his contribution.

This document is an adapted copy of the original documentation available here.

## Simple Example

A simple bar chart is created using the `@startchart` and `@endchart` keywords:

<plantuml>
@startchart
h-axis [Q1, Q2, Q3, Q4]
v-axis "Revenue" 0 --> 100
bar "Sales" [45, 62, 58, 70] #3498db
legend right
@endchart
</plantuml>

This will display a basic bar chart with quarterly data.

## Bar Chart

Bar charts display data as vertical or horizontal bars. Use the `bar` keyword to create a bar series:

<plantuml>
@startchart
h-axis [Jan, Feb, Mar, Apr]
v-axis 0 --> 100
bar "Revenue" [45, 62, 58, 70] #1f77b4
legend right
@endchart
</plantuml>

## Grouped Bars

Multiple bar series are displayed side-by-side by default:

<plantuml>
@startchart
h-axis [Q1, Q2, Q3, Q4]
v-axis 0 --> 100
stackMode grouped
bar "Revenue" [45, 62, 58, 70] #3498db
bar "Profit" [35, 48, 52, 61] #2ecc71
legend right
@endchart
</plantuml>

## Stacked Bars

Bars can be stacked on top of each other:

<plantuml>
@startchart
h-axis [Q1, Q2, Q3, Q4]
v-axis 0 --> 100
stackMode stacked
bar "Revenue" [45, 62, 58, 70] #3498db
bar "Costs" [25, 30, 28, 32] #e74c3c
legend right
@endchart
</plantuml>

## Horizontal Bars

Bars can be oriented horizontally:

<plantuml>
@startchart
orientation horizontal
v-axis [Product A, Product B, Product C]
h-axis "Revenue" 0 --> 100
bar [75, 55, 30] #3498db
@endchart
</plantuml>

## Line Chart

Line charts connect data points with lines. Use the `line` keyword:

<plantuml>
@startchart
h-axis [Q1, Q2, Q3, Q4, Q5, Q6]
v-axis "Performance" 0 --> 100 spacing 20
line "Sales" [45, 62, 58, 70, 83, 78] #1f77b4
line "Target" [50, 55, 60, 65, 70, 75] #ff7f0e
legend right
@endchart
</plantuml>

###Coordinate-Pair Notation

Line and scatter charts support an alternative coordinate-pair notation for plotting data at specific x-coordinates. This is useful for mathematical functions, irregular data points, or when you need precise control over point positioning.

**Syntax**: `[(x1,y1), (x2,y2), (x3,y3), ...]`

**Requirements**:
- Only supported for `line` and `scatter` chart types
- Requires numeric h-axis with explicit range (e.g., `h-axis "x" -5 --> 5`)
- NOT compatible with categorical h-axis (e.g., `h-axis [Q1, Q2, Q3, Q4]`)
- All series in a chart must use the same format (either all coordinate pairs or all index-based)
- X-coordinates must fall within the h-axis range

**Example**:

<plantuml>
@startchart
h-axis "t" -10 --> 10 spacing 2 label-right
v-axis "f(t)" -10 --> 50 spacing 10 label-top
line "Trajectory" [(-10,0), (2,10), (5,30), (8,45), (10,50)] #3498db
scatter "Checkpoints" [(1,12), (6,34), (7,47)] #e74c3c
legend right
@endchart
</plantuml>

**Behavior**:
- Line charts connect points with straight line segments
- Scatter charts display individual markers at each coordinate
- Points can be unevenly spaced along the x-axis
- Gaps between points are left empty (no interpolation)

## Area Chart

Area charts are similar to line charts but with filled regions:

<plantuml>
@startchart
h-axis [Jan, Feb, Mar, Apr, May, Jun]
v-axis 0 --> 140 spacing 20
area "Product A" [45, 62, 58, 70, 83, 78] #3498db
area "Product B" [25, 35, 42, 38, 45, 40] #2ecc71
legend right
@endchart
</plantuml>

## Scatter Chart

Scatter plots display data as individual points with customizable marker shapes:

<plantuml>
@startchart
<style>
.datapoints {
MarkerColor #1f77b4
MarkerShape circle
MarkerSize 10
}
.highlights {
MarkerColor #e74c3c
MarkerShape triangle
MarkerSize 10
}
</style>
h-axis [Q1, Q2, Q3, Q4, Q5]
v-axis 0 --> 100
scatter <<datapoints>> "Data Points" [20, 40, 60, 80, 70]
scatter <<highlights>> "Highlights" [30, 55, 65, 75, 85]
legend right
@endchart
</plantuml>

Available marker shapes:
- `circle` (default)
- `square`
- `triangle`

**Note:** For scatter plots with custom marker shapes, use stereotype-based styling with the `MarkerColor`, `MarkerShape`, and `MarkerSize` properties in a style block. This provides the most reliable color and shape control

## Axes Configuration

### Horizontal Axis

The horizontal axis (x-axis) is configured using the `h-axis` keyword:

<plantuml>
@startchart
h-axis "Quarters" [Q1, Q2, Q3, Q4]
v-axis 0 --> 100
bar [45, 62, 58, 70] #3498db
@endchart
</plantuml>

For numeric ranges:

<plantuml>
@startchart
orientation horizontal
v-axis [Product A, Product B, Product C]
h-axis "Revenue" 0 --> 100
bar [45, 62, 58] #3498db
@endchart
</plantuml>

Custom tick spacing:

<plantuml>
@startchart
h-axis [Jan, Feb, Mar, Apr, May, Jun] spacing 2
v-axis 0 --> 100
bar [45, 62, 58, 70, 83, 78] #3498db
@endchart
</plantuml>

### Vertical Axis

The vertical axis (y-axis) is configured using the `v-axis` keyword:

<plantuml>
@startchart
h-axis [Q1, Q2, Q3, Q4]
v-axis "Revenue ($M)" 0 --> 100
bar [45, 62, 58, 70] #3498db
@endchart
</plantuml>

Custom tick labels:

<plantuml>
@startchart
title Performance
h-axis [Q1, Q2, Q3, Q4]
v-axis 0 --> 100 ticks [0:"Poor", 50:"Average", 100:"Excellent"]
bar [30, 60, 85, 95] #3498db
@endchart
</plantuml>

Custom tick spacing:

<plantuml>
@startchart
h-axis [Q1, Q2, Q3, Q4]
v-axis "Revenue ($K)" 0 --> 100 spacing 25
bar [45, 62, 58, 70] #3498db
@endchart
</plantuml>

This displays tick marks at intervals of 25 (0, 25, 50, 75, 100) instead of the default 5 evenly-spaced ticks.

Negative axis values:

<plantuml>
@startchart
h-axis [Q1, Q2, Q3, Q4]
v-axis "Profit/Loss ($K)" -50 --> 50 spacing 25
bar "Product A" [-20, 10, 30, 25] #3498db
@endchart
</plantuml>

When the v-axis range includes zero, the horizontal axis is automatically positioned at the zero line, providing a clear visual separation between positive and negative values.

### Secondary Y-Axis

A secondary v-axis (v2) can be added on the right side for dual-scale charts:

<plantuml>
@startchart
h-axis [Q1, Q2, Q3, Q4]
v-axis "Revenue" 0 --> 100
v2-axis "Market Share %" 0 --> 50
bar "Sales" [45, 62, 58, 70]
line "Market Share" [15, 20, 18, 25] v2
@endchart
</plantuml>

Use the `v2` flag in series commands to bind them to the secondary axis.

### Axis Label Positioning

By default, axis labels are positioned as follows:
- V-axis labels: vertically along the left side (reading bottom-to-top)
- V2-axis labels: vertically along the right side (reading top-to-bottom)
- H-axis labels: horizontally below the axis (centered)

You can override these positions using the `label-top` and `label-right` options:

#### V-Axis with label-top

Position the v-axis label horizontally at the top:

<plantuml>
@startchart
h-axis [Q1, Q2, Q3, Q4]
v-axis "Revenue ($K)" 0 --> 100 label-top
bar "Sales" [45, 62, 58, 70] #3498db
@endchart
</plantuml>

#### H-Axis with label-right

Position the h-axis label at the far right:

<plantuml>
@startchart
h-axis "Quarters" [Q1, Q2, Q3, Q4] label-right
v-axis "Revenue ($K)" 0 --> 100
bar "Sales" [45, 62, 58, 70] #3498db
@endchart
</plantuml>

#### Combined Label Positioning

You can combine both options for a more compact layout:

<plantuml>
@startchart combined-label-positioning
h-axis "   Time" [Q1, Q2, Q3, Q4] label-right
v-axis "Revenue" 0 --> 100 label-top
v2-axis "Profit" 0 --> 50 label-top
bar "Revenue" [40, 60, 75, 90]
line "Profit" [10, 20, 30, 40] v2
legend right
@endchart
</plantuml>

## Data Series Options

### Series Name

Add a series name for display in the legend:

<plantuml>
@startchart
h-axis [Q1, Q2, Q3, Q4]
v-axis 0 --> 100
bar "Revenue" [45, 62, 58, 70]
legend right
@endchart
</plantuml>

### Colors

Specify colors using hex codes or color names:

<plantuml>
@startchart
h-axis [Q1, Q2, Q3, Q4]
v-axis 0 --> 100
bar "Series 1" [45, 62, 58, 70] #3498db
bar "Series 2" [35, 48, 52, 61] #2ecc71
bar "Series 3" [25, 30, 28, 32] #red
legend right
@endchart
</plantuml>

### Data Labels

Display values on data points using the `labels` keyword:

<plantuml>
@startchart
h-axis [Q1, Q2, Q3, Q4]
v-axis 0 --> 100
bar "Sales" [45, 62, 58, 70] #3498db labels
line "Target" [70, 75, 80, 85] #ff7f0e labels
legend right
@endchart
</plantuml>

## Layout Options

### Legend

Display a legend showing all series:

<plantuml>
@startchart
h-axis [Q1, Q2, Q3, Q4]
v-axis 0 --> 100
bar "Revenue" [45, 62, 58, 70] #3498db
bar "Profit" [35, 48, 52, 61] #2ecc71
legend right
@endchart
</plantuml>

Available positions:
- `left` - Left side of chart
- `right` - Right side of chart
- `top` - Top of chart
- `bottom` - Bottom of chart

### Grid Lines

Display grid lines for better readability. Add the optional `grid` keyword at the end of any axis line to enable gridlines for that axis. By default, no grid lines are shown.

Grid on both axes:

<plantuml>
@startchart
h-axis [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct] grid
v-axis 0 --> 100 grid
line [45, 62, 58, 70, 83, 78, 65, 72, 80, 85] #3498db
@endchart
</plantuml>

Grid on vertical axis only:

<plantuml>
@startchart
h-axis 0 --> 100
v-axis 0 --> 100 grid
scatter [(10,45), (25,62), (40,58), (55,70)] #3498db
@endchart
</plantuml>

Bar chart with v-axis grid:

<plantuml>
@startchart
h-axis [Q1, Q2, Q3, Q4]
v-axis 0 --> 100 grid
bar [45, 62, 58, 70] #3498db
@endchart
</plantuml>

The `grid` keyword can be added to:
- `h-axis` - Enable horizontal axis gridlines (vertical lines)
- `v-axis` or `v2-axis` - Enable vertical axis gridlines (horizontal lines)
- Major gridlines only are displayed

## Annotations

Add text annotations to highlight specific data points:

<plantuml>
@startchart
h-axis [Q1, Q2, Q3, Q4, Q5]
v-axis 0 --> 100
bar "Sales" [45, 62, 58, 70, 83] #3498db
line "Target" [50, 55, 60, 65, 70] #ff7f0e
annotation "Peak sales" at (Q5, 83) <<arrow>>
annotation "Target line" at (Q3, 60)
legend right
@endchart
</plantuml>

Annotations can include:
- Text label
- Position coordinates (x, y)
- Optional `<<arrow>>` pointing to the data point

## Styling

### Inline Styling

Apply colors directly to series:

```
bar "Revenue" [45, 62, 58, 70] #3498db
line "Target" [50, 55, 60, 65] #e74c3c
```

### Style Blocks

Use PlantUML's style system for comprehensive styling:

<plantuml>
@startchart
<style>
chartDiagram {
    BackGroundColor white
    FontName Arial
    FontSize 12
    bar {
        LineColor #2c3e50
        LineThickness 2.0
        BackGroundColor #3498db
        BarWidth 0.7
    }
    line {
        LineColor #e74c3c
        LineThickness 2.5
    }
    scatter {
        MarkerShape square
        MarkerSize 14
        MarkerColor #9b59b6
    }
    axis {
        LineColor #34495e
        LineThickness 1.5
        FontSize 11
        FontColor #7f8c8d
    }
    grid {
        LineColor #ecf0f1
        LineThickness 0.8
    }
    legend {
        FontSize 12
        FontColor #2c3e50
        BackGroundColor #f5f5f5
        Padding 10
        Margin 5
    }
}
</style>
@endchart
</plantuml>
