import $ from 'bianco.query'

/**
 * Represents the supported DOM element types for EnderView operations
 * Can be either an HTMLElement or an SVGAElement
 */
export type EnderViewSupportedElement = HTMLElement | SVGAElement

/**
 * Represents valid CSS timing function values for transitions and animations
 * Includes standard keywords, step and cubic-bezier functions, and allows custom strings
 * Example values: 'ease', 'linear', 'steps(4, end)', 'cubic-bezier(0.4, 0, 0.2, 1)', etc
 */
export type EnderViewCSSEasing =
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'linear'
  | 'step-start'
  | 'step-end'
  | `steps(${number}, ${'start' | 'end'})`
  | `cubic-bezier(${number}, ${number}, ${number}, ${number})`
  | (string & {}) // for custom timing functions

/**
 * Properties for configuring an EnderView animation
 * @property easing - The CSS easing function to use for the animation
 * @property duration - Duration of the animation in milliseconds
 * @property delay - Delay before the animation starts in milliseconds
 * @property animationName - Optional name of the animation
 */
export type EnderViewAnimationProperties = {
  easing: EnderViewCSSEasing
  duration: number
  delay: number
  animationName?: string
}

export type EnderView<
  T extends EnderViewSupportedElement | EnderViewSupportedElement[] | string,
> = {
  cleanup: () => EnderView<T>
  updateOptions: (newOptions: Partial<EnderViewOptions>) => EnderView<T>
  addElement: (el: EnderViewSupportedElement) => EnderView<T>
  removeElement: (el: EnderViewSupportedElement) => EnderView<T>
  addElements: (selector: T) => EnderView<T>
  removeElements: (selector: T) => EnderView<T>
}

/**
 * Options for configuring a view transition in EnderView
 *
 * Combines basic animation properties (easing, duration, delay) with additional
 * configuration for view transitions, including:
 * - viewTransitionName: The name of the view transition
 * - leaveProps: Animation properties for the leave state
 * - enterProps: Animation properties for the enter state
 * - leaveCss: CSS to apply during the leave animation
 * - enterCss: CSS to apply during the enter animation
 */
export type EnderViewOptions = Pick<
  EnderViewAnimationProperties,
  'easing' | 'duration' | 'delay'
> & {
  viewTransitionName: string
  leaveProps: EnderViewAnimationProperties
  enterProps: EnderViewAnimationProperties
  leaveCss: string
  enterCss: string
}

/**
 * Represents a subset of CSSStyleDeclaration properties managed by EnderView
 * Includes only the 'viewTransitionName' and 'viewTransitionClass' properties
 */
export type EnderViewManagedCssDeclarations = Pick<
  CSSStyleDeclaration,
  'viewTransitionName' | 'viewTransitionClass'
>

/**
 * Applies view transition-related CSS styles to a given HTML element
 *
 * @param el - The target HTML element to which the styles will be applied
 * @param options - An object containing optional view transition properties:
 *   - viewTransitionName: The name for the view transition (defaults to 'match-element')
 *   - viewTransitionClass: The transition class name to identify the target elements via CSS
 */
const applyViewTransitionStyles = (
  el: EnderViewSupportedElement,
  {
    viewTransitionName,
    viewTransitionClass,
  }: Partial<EnderViewOptions> & { viewTransitionClass: string },
) =>
  Object.assign(el.style, {
    viewTransitionClass: viewTransitionClass,
    viewTransitionName: viewTransitionName ?? 'match-element',
  } satisfies EnderViewManagedCssDeclarations)

/**
 * Merges the provided options with default EnderViewOptions
 *
 * @param options - Optional partial options to override the defaults
 * @returns The merged options object, satisfying Partial<EnderViewOptions>
 */
const getOptions = (options?: Partial<EnderViewOptions>) =>
  ({
    easing: 'ease-in-out',
    delay: 0,
    duration: 200,
    ...options,
  }) satisfies Partial<EnderViewOptions>

/**
 * Creates a CSS style manager that allows adding and removing a stylesheet dynamically
 *
 * The manager encapsulates a single `CSSStyleSheet` instance. When `add` is called with a CSS string,
 * it replaces the stylesheet's content and adopts it into the document. The `remove` method
 * detaches the stylesheet from the document's adopted stylesheets
 *
 * @returns An object with `add(css: string)` and `remove()` methods to manage the stylesheet
 */
const createCssStyleManager = () => {
  const styleSheet = new CSSStyleSheet()

  return {
    /**
     * Adds or replaces the CSS rules in the managed stylesheet and adopts it into the document
     * @param css - The CSS string to add
     */
    add(css: string) {
      if (css) styleSheet.replaceSync(css)
      document.adoptedStyleSheets.push(styleSheet)
    },
    /**
     * Removes the managed stylesheet from the document's adopted stylesheets
     */
    remove() {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
        (s) => s !== styleSheet,
      )
    },
  }
}

/**
 * Generates a unique id for view transitions
 * Each call returns a new identifier with an incremented int
 *
 * @returns {string} A unique id string in the format "ender-view-transition-id-{n}"
 */
const createUniqueViewTrasitionId = ((id: number) => () => {
  id += 1
  return `ender-view-transition-id-${id}`
})(0)

/**
 * Generates CSS rules for view transition enter and leave states
 *
 * @param viewTransitionId - The unique class name or identifier used for the view transition
 * @param options - Partial EnderViewOptions object. Can include:
 *   - enterCss: CSS to apply when entering
 *   - leaveCss: CSS to apply when leaving
 *   - enterProps: Animation properties (delay, duration, easing, animationName) for the enter state
 *   - leaveProps: Animation properties (delay, duration, easing, animationName) for the leave state
 *   - delay: Default animation delay for the group
 *   - easing: Default animation timing function for the group
 *   - duration: Default animation duration for the group
 * @returns A string containing the CSS rules for the specified transition class, including keyframes and animation properties for both enter and leave states
 */
const createTransitionCss = (
  viewTransitionId: string,
  {
    enterCss,
    leaveCss,
    enterProps,
    leaveProps,
    delay,
    easing,
    duration,
  }: Partial<EnderViewOptions>,
) => `
  ::view-transition-new(.${viewTransitionId}):only-child { 
    animation-name: ${enterProps?.animationName ?? `${viewTransitionId}-enter`};
    ${enterProps?.delay ? `animation-delay: ${enterProps.delay}ms;` : ''}
    ${enterProps?.duration ? `animation-duration: ${enterProps.duration}ms;` : ''}
    ${enterProps?.easing ? `animation-timing-function: ${enterProps.easing};` : ''}
  }

  ::view-transition-old(.${viewTransitionId}):only-child { 
    animation-name: ${leaveProps?.animationName ?? `${viewTransitionId}-leave`};
    ${leaveProps?.delay ? `animation-delay: ${leaveProps.delay}ms;` : ''}
    ${leaveProps?.duration ? `animation-duration: ${leaveProps.duration}ms;` : ''}
    ${leaveProps?.easing ? `animation-timing-function: ${leaveProps.easing};` : ''}
  }

  ::view-transition-group(.${viewTransitionId}) {
    animation-delay: ${delay}ms;
    animation-duration: ${duration}ms;
    animation-timing-function: ${easing};
  }

  ${
    enterCss
      ? `
  @keyframes ${viewTransitionId}-enter {
    from { ${enterCss} }
  }`
      : ''
  }

  ${
    leaveCss
      ? `
  @keyframes ${viewTransitionId}-leave {
    to { ${leaveCss} }
  }`
      : ''
  }
`

// Forward the $ bianco selector for convenience
export { default as $ } from 'bianco.query'

/**
 * Checks if the View Transition API is supported in the current environment
 * @returns {boolean} True if `document.startViewTransition` is available, false otherwise
 */
export const isViewTransitionSupported = (): boolean =>
  typeof document !== 'undefined' && !!document.startViewTransition

/**
 * Creates and manages view transitions for the specified DOM elements
 *
 * @template T - The selector type, can be a supported element, array of elements, or string
 * @param selector - The DOM selector or element(s) to manage with the view transition
 * @param options - Optional configuration for the view transition
 * @returns An object with methods to control the transition and manage elements
 *
 * The returned object provides the following methods:
 *   - cleanup(): Removes all applied styles and injected CSS
 *   - updateOptions(newOptions): Updates the transition options
 *   - addElement(el): Adds a single element to be managed by the transition
 *   - removeElement(el): Removes a single element from management
 *   - addElements(selector): Adds multiple elements by selector
 *   - removeElements(selector): Removes multiple elements by selector
 */
export const createEnderView = <
  T extends EnderViewSupportedElement | EnderViewSupportedElement[] | string,
>(
  selector: T,
  options?: Partial<EnderViewOptions>,
): EnderView<T> => {
  // Create the elements set to store the DOM nodes we have upgraded to support the animations
  const els: Set<EnderViewSupportedElement> = new Set()
  // Create a manager for dynamic CSS injection and removal
  const styleSheetManager = createCssStyleManager()
  // Generate a unique identifier for the view transition
  const viewTransitionId = createUniqueViewTrasitionId()
  // Store the internal animation state
  const mergedOptions = getOptions(options)

  /**
   * Adds the view transition inline style to a single element
   * @param el - The element to style
   */
  const addInlineStyleToEl = (el: EnderViewSupportedElement) =>
    applyViewTransitionStyles(el, {
      viewTransitionName: mergedOptions.viewTransitionName,
      viewTransitionClass: viewTransitionId,
    })
  /**
   * Removes the view transition inline style from a single element
   * @param el - The element to clean up
   */
  const removeInlineStyleFromEl = (el: EnderViewSupportedElement) =>
    applyViewTransitionStyles(el, {
      viewTransitionName: '',
      viewTransitionClass: '',
    })
  /**
   * Updates the injected CSS for the transition with new options
   * @param newOptions - The new options to use for the CSS
   */
  const updateCss = (newOptions: Partial<EnderViewOptions>) =>
    styleSheetManager.add(createTransitionCss(viewTransitionId, newOptions))

  const enderView: EnderView<T> = {
    /**
     * Cleans up the applied view transition styles and removes the injected CSS
     */
    cleanup() {
      // remove the inline css on the DOM nodes
      els.forEach(removeInlineStyleFromEl)
      // remove the injected css
      styleSheetManager.remove()
      // clean up the set
      els.forEach(els.delete.bind(els))

      return this
    },
    /**
     * Update the initial options merging them with the new object provided
     */
    updateOptions(newOptions: Partial<EnderViewOptions>) {
      updateCss(getOptions({ ...options, ...newOptions }))

      return this
    },
    /**
     * Adds a single element to be managed by the view transition
     * @param el - The element to add
     */
    addElement(el: EnderViewSupportedElement) {
      addInlineStyleToEl(el)
      els.add(el)

      return this
    },
    /**
     * Removes a single element from being managed by the view transition
     * @param el - The element to remove
     */
    removeElement(el: EnderViewSupportedElement) {
      removeInlineStyleFromEl(el)
      els.delete(el)

      return this
    },
    /**
     * Adds multiple elements by selector to be managed by the view transition
     * @param selector - The selector or elements to add
     */
    addElements(selector: T) {
      const newElements = $(
        selector as string,
      ) satisfies EnderViewSupportedElement[]

      newElements.forEach(this.addElement)

      return this
    },
    /**
     * Removes multiple elements by selector from being managed by the view transition
     * @param selector - The selector or elements to remove
     */
    removeElements(selector: T) {
      const newElements = $(
        selector as string,
      ) satisfies EnderViewSupportedElement[]

      newElements.forEach(this.removeElement)

      return this
    },
  }

  // initial setup

  // Create the initial css needed for the transitions
  updateCss(mergedOptions)

  // Setup the DOM Nodes for the view transitions
  enderView.addElements(selector)

  return enderView
}

/**
 * Triggers the view transition animation
 *
 * @param domUpdateFn - The function or object that updates the DOM
 * @returns The ViewTransition object or a mock if unsupported
 */
export const animate = (
  domUpdateFn: ViewTransitionUpdateCallback | { update: () => void },
): ViewTransition => {
  // Handle the view transitions only if they are supported
  if (isViewTransitionSupported()) {
    return document.startViewTransition(domUpdateFn)
  }

  // Otherwise just trigger the DOM update
  if (typeof domUpdateFn === 'function') domUpdateFn()
  else domUpdateFn?.update()

  // Provide a mock ViewTransition object for unsupported environments
  return {
    types: new Set(),
    // noop
    skipTransition: () => {},
    finished: Promise.resolve(),
    ready: Promise.resolve(),
    updateCallbackDone: Promise.resolve(),
  }
}
