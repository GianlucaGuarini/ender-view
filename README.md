# ender-view

<img alt="ender-view logo" src="https://github.com/GianlucaGuarini/ender-view/blob/main/ender-view-logo.png?raw=true" width="100%"/>

> Smooth DOM view transitions made easy

A lightweight TypeScript utility for managing View Transitions and CSS animations in modern browsers.<br/>
It provides a simple API to trigger animated transitions between DOM states, leveraging the View Transition API when available, and falling back gracefully otherwise

## Features

- Ultra-lightweight: just 1kb minified
- Simple API to create and trigger view transitions
- Dynamic CSS injection for custom animations
- TypeScript types for strong typing and autocompletion
- Works with both `HTMLElement` and `SVGAElement`
- Graceful fallback if View Transition API is not supported
- Utility `$` selector exported for convenience
- Methods to add/remove elements from a transition group
- Cleanup method to remove injected styles

## Installation

```sh
npm install ender-view
```

## Demos

- <https://gianlucaguarini.com/ender-view/demos/box.html>
- <https://gianlucaguarini.com/ender-view/demos/gallery.html>
- <https://gianlucaguarini.com/ender-view/demos/list.html>

## Usage

### Basic Example

```typescript
import { createViewTransition } from 'ender-view'

// Select the element to animate
const animate = createViewTransition('#my-element', {
  enterCss: 'opacity: 0;',
  leaveCss: 'opacity: 0;',
  easing: 'ease',
  duration: 300,
})

// Trigger the animation when updating the DOM
animate(() => {
  document.querySelector('#my-element')!.textContent = 'New Content!'
})
```

### Multiple Elements Example

```typescript
const animate = createViewTransition(
  [document.querySelector('#el1'), document.querySelector('#el2')],
  {
    enterCss: 'transform: scale(0.5); opacity: 0;',
    leaveCss: 'transform: scale(0.8); opacity: 0;',
    enterProps: { easing: 'ease-in', duration: 400, delay: 0 },
    leaveProps: { easing: 'ease-out', duration: 400, delay: 0 },
  },
)

animate(() => {
  // Update both elements in the DOM
})
```

### API

#### `createViewTransition(target, options)`

Returns an `animate` function with additional methods:

- `animate(domUpdateCallback: () => void, newOptions?: Partial<EnderViewOptions>): ViewTransition`  
  Triggers the transition and runs the DOM update callback. It returns the native ViewTransition object

- `animate.addElement(el: HTMLElement | SVGAElement): void`  
  Add an element to the transition group. Normally that's needed to animate the incoming DOM nodes

- `animate.addElements(selector | HTMLElement[] | SVGAElement[]): void`  
  Add multiple elements to the transition group

- `animate.removeElement(el: HTMLElement | SVGAElement): void`  
  Remove an element from the transition group

- `animate.removeElements(selector | HTMLElement[] | SVGAElement[]): void`  
  Remove multiple elements to the transition group

- `animate.cleanup(): void`  
  Remove injected styles and clean up resources

#### Utility Export

- `$`: A selector utility exported from `bianco.query` for convenience

#### Edge Cases & Notes

- If the View Transition API is not supported, transitions fall back to CSS animations
- If a selector matches no elements, the transition will be a no-op
- If you call `cleanup()`, all injected styles are removed and further transitions will not apply styles
- You can dynamically add or remove elements from the transition group at any time using `add` and `remove`
- The library works with both `HTMLElement` and `SVGAElement`

See the source for full type documentation and advanced options

## Name Origin

The name **ender-view** is inspired by the Ender Pearl from Minecraft. Just as the Ender Pearl allows players to teleport instantly to another location, this library "teleports" your DOM elements to new states with smooth, animated transitions. The goal is to make moving between different views or UI states as seamless and magical as using an Ender Pearl in the game

<img src="https://github.com/GianlucaGuarini/ender-view/blob/main/ender-pearl.webp?raw=true" alt="Ender Pearl"/>
