/**
 * Sig's Dimming Selector - Firefox plugin
 */

// Lets define some variables we'll be needing:

// `overlay` is a HTML `<canvas>` element that gets drawn on top of everything
let overlay
// `destroyOverlay` is a function, that when called will destroy the `overlay`
let destroyOverlay
// `range` is part of the Selection API, and it contains where the selection begins and ends
let range

/**
 * Creates a new <canvas> element, and does some configuration.
 * @returns the `canvas` element, and the `destroy` method: these will be mapped to `overlay` and `destroyOverlay` later
 */
function createCanvas() {
  // Lets create a new `<canvas>` element
  const canvas = document.createElement('canvas')

  /**
   * This little function handles setting the canvas size.
   */
  const setCanvasSize = () => (
    canvas.width = window.innerWidth,
    canvas.height = window.innerHeight
  )

  // Call `setCanvasSize` to get the initial size
  setCanvasSize()
  // We'll position the `canvas` element on top of everything with `zIndex`
  canvas.style.zIndex = 9999
  // It should *absolutely* be positioned at the top-left corner
  canvas.style.position = 'absolute'
  canvas.style.left = '0px'
  canvas.style.right = '0px'
  // Lets ignore all clicks and touches
  canvas.style.pointerEvents = 'none'
  // Call `paintOverlay` function to draw the initial frame
  paintOverlay(canvas)

  /**
   * This listener will resize the `canvas` element to match screen size, and re-paint.
   */
  const resizeListener = () => {
    // Call `setCanvasSize` to adjust to the new dimensions
    setCanvasSize()
    // Call `paintOverlay` function to re-draw the overlay
    paintOverlay(canvas)
    // Crop out the selected part
    clearSelectionArea()
  }
  // Listen to resize events
  window.addEventListener('resize', resizeListener)

  /**
   * This function handles destroying the `canvas`, and usubscribes from the resize event
   */
  const destroy = () => {
    canvas.remove()
    window.removeEventListener('resize', resizeListener)
  }

  // This function returns an object, with the `canvas` element and `destroy` function.
  return {
    canvas,
    destroy,
  }
}

/**
 * Paint the translucent color on the canvas.
 * @param {HTMLCanvasElement} canvas
 */
function paintOverlay(canvas = overlay) {
  // Get the 2D context of the canvas that allows us to draw
  const ctx = canvas.getContext('2d')
  // Fill is RGB(0, 0, 0) with 0.5 alpha
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  // Draw the fill
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

/**
 * Handles creating the overlay with `createCanvas`, and inserting it into the DOM.
 */
function onSelection() {
  // If `overlay` does not exist, we do nothing
  if (overlay) return
  // Get the `canvas` and `destroy` from the object returned by `createCanvas`
  const { canvas, destroy } = createCanvas()
  // Assign the variables
  overlay = canvas
  destroyOverlay = destroy
  // Append the overlay canvas to the DOM.
  document.body.prepend(overlay)
}

/**
 * Handles removing the overlay.
 */
function afterSelection() {
  // If `destoryOverlay` does not exist, we do nothing
  if (!destroyOverlay) return
  // Call `destroyOverlay` to remove the `canvas` element, and the resize listener
  destroyOverlay()
  // Assign the variables to be `null`
  overlay = null
  destroyOverlay = null
  range = null
}

/**
 * Clears out the area of selection from `overlay`
 */
function clearSelectionArea() {
  // If `range` object does not exist, we do nothing
  if (!range) return
  // Get the bounding box of the Selection Range
  const rect = range.getBoundingClientRect()
  // Get the context for `overlay` so we can paint
  const ctx = overlay.getContext('2d')
  // Clear the area
  ctx.clearRect(rect.left, rect.top, rect.width, rect.height)
}

/**
 * Start listening to the Selection Change event.
 */
document.addEventListener('selectionchange', () => {
  // Get the current selection
  const selection = document.getSelection()
  // If the selection is not type "Range"
  if (selection.type !== "Range") {
    // Clear out the overlay
    return afterSelection()
  }
  // We have selected something, so create canvas etc in `onSelection`
  onSelection()
  // Assign `range` the selection's range
  range = selection.getRangeAt(0)
  // Clear the selected area
  clearSelectionArea()
})
