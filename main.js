import './style.css'
import { BLOCK_SIZE, BOARD_WIDTH, BOARD_HEIGHT, EVENT_MOVEMENTS } from './consts'

// 1. inicializar el canvas
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const $score = document.querySelector('span')

let score = 0

canvas.width = BLOCK_SIZE * BOARD_WIDTH
canvas.height = BLOCK_SIZE * BOARD_HEIGHT

context.scale(BLOCK_SIZE, BLOCK_SIZE)

// 3. board
const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT)

//(MODIFICADO PARA DEJAR EL COLOR DE LA PIEZA cuando cae)
function createBoard(width, height) {
  return Array(height).fill().map(() => Array(width).fill(null))
}


// 6. random pieces
//colores (NUEVO)
const COLORS = ['red', 'cyan', 'blue', 'orange', 'green', 'purple', 'yellow', 'pink']
const PIECES = [
  [
    [1, 1],
    [1, 1]
  ],
  [
    [1, 1, 1, 1]
  ],
  [
    [0, 1, 0],
    [1, 1, 1]
  ],
  [
    [1, 1, 0],
    [0, 1, 1]
  ],
  [
    [1, 0],
    [1, 0],
    [1, 1]
  ],
  [
    [1, 1],
    [0, 1],
    [1, 1]
  ],
  [
    [0, 1],
    [0, 1],
    [0, 1]
  ],
  [
    [0, 1, 1],
    [1, 1, 0]
  ]
]
// 4. pieza player (MODIFICADO)
const piece = {
  position: { x: 5, y: 5 },
  shape: PIECES[Math.floor(Math.random() * PIECES.length)],
  color: COLORS[Math.floor(Math.random() * COLORS.length)]
}

// 2. game loop
//function update() {
//  draw()
//  window.requestAnimationFrame(update)
//}

// 5. auto drop
let dropCounter = 0
let lastTime = 0

function update(time = 0) {
  const deltaTime = time - lastTime
  lastTime = time

  dropCounter += deltaTime

  if (dropCounter > 1000) {
    piece.position.y++
    dropCounter = 0

    if (checkCollision()) {
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
  }

  draw()
  window.requestAnimationFrame(update)
}

function draw() {
  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      //MODIFICADO para dibujar bloques con su color guardado
      if (value) {
        context.fillStyle = value.color
        context.fillRect(x, y, 1, 1)
      }
    })
  })

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        // (MODIFICADO para que la pieza tenga color)
        context.fillStyle = piece.color
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1)
      }
    })
  })

  $score.innerText = score
}

document.addEventListener('keydown', event => {
  if (event.key == EVENT_MOVEMENTS.LEFT) {
    piece.position.x--
    if (checkCollision()) {
      piece.position.x++
    }
  }

  if (event.key == EVENT_MOVEMENTS.RIGHT) {
    piece.position.x++
    if (checkCollision()) {
      piece.position.x--
    }
  }

  if (event.key == EVENT_MOVEMENTS.DOWN) {
    piece.position.y++
    if (checkCollision()) {
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
  }

  if (event.key == 'ArrowUp') {
    const rotated = []

    for (let i = 0; i < piece.shape[0].length; i++) {
      const row = []

      for (let j = piece.shape.length - 1; j >= 0; j--) {
        row.push(piece.shape[j][i])
      }

      rotated.push(row)
    }

    const previousShape = piece.shape
    piece.shape = rotated
    if (checkCollision()) {
      piece.shape = previousShape
    }
  }
})

function checkCollision() {
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      return (
        value != 0 &&
        //MODIFICADO por que la función checkCollision() busca que el valor en el board sea distinto de 0. Pero ahora ya no hay ceros ni unos, hay null o un objeto.
        board[y + piece.position.y]?.[x + piece.position.x] !== null
      )
    })
  })
}

function solidifyPiece() {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value == 1) {
        //MODIFICADO para guardar el color de la pieza al caer
        board[y + piece.position.y][x + piece.position.x] = { color: piece.color }
      }
    })
  })

  // reset position
  piece.position.x = Math.floor(BOARD_WIDTH / 2 - 2)
  piece.position.y = 0
  // get random shape (MODIFICADO)
  piece.shape = PIECES[Math.floor(Math.random() * PIECES.length)]
  piece.color = COLORS[Math.floor(Math.random() * COLORS.length)]
  //game over
  if (checkCollision()) {
    window.alert('Game over!!! Sorry!')
    board.forEach((row) => row.fill(0))
  }
}

//NUEVO para el sonido de removeRows.
const lineClearSound = new Audio('./clear.mp3')
function removeRows() {
  const rowsToRemove = []

  board.forEach((row, y) => {
    //MODIFICADO Antes (versión antigua, ya no funciona con objetos).
    if (row.every(cell => cell !== null)) {
      rowsToRemove.push(y)
    }
  })

  if (rowsToRemove.length > 0) {
    lineClearSound.currentTime = 0
    lineClearSound.play()
  }

  rowsToRemove.forEach(y => {
    board.splice(y, 1)
    const newRow = Array(BOARD_WIDTH).fill(null)
    board.unshift(newRow)
    score += 10
  })
}

const $section = document.querySelector('section')
$section.addEventListener('click', () => {
  update()

  $section.remove()
  const audio = new window.Audio('./tetris.mp3')
  audio.volume = 0.5
  audio.play()
})

