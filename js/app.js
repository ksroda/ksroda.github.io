const mintPrimary = 'rgb(126, 215, 172)'
const peachPrimary = 'rgb(255, 121, 107)'
const bluePrimary = 'rgb(87, 178, 248)'
const mustardSecondary = 'rgb(254, 200, 60)'
const graySecondary = 'rgb(159, 166, 181)'
const white = 'rgb(255, 255, 255)'

const questionsContainer = document.getElementById('questions-container')
const questionsListing = document.getElementById('questions-listing-container__div')
const startButton = document.getElementById('start__button')
const stopButton = document.getElementById('stop__button')
const toResultsButton = document.getElementById('to-results__button')
let userAnswers = {}
let correctAnswers = {}
let interval = null
let quizTime = 0
let timeUsed = 0
let currentQuestion = 0
let isEnd = true

loadDataToApp()

function assignEventListener (button, callback) {

  if (/Android|webOS|iPhone|iPad|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent)) {
    button.addEventListener('touchstart', callback, false)
  } else {
    button.addEventListener('click', callback)
  }

}

function loadDataToApp () {
  fetch('https://cdn.rawgit.com/kdzwinel/cd08d08002995675f10d065985257416/raw/' +
    '811ad96a0567648ff858b4f14d0096ba241f28ef/quiz-data.json')
    .then(response => response.json())
    .then(data => {
      const questionsContainer = document.getElementById('questions-container')
      const lastIndex = data.questions.length - 1
      quizTime = data.time_seconds
      data.questions.forEach((question, index) => {
        setTimeout(() => renderQuestion(questionsContainer, question, index, lastIndex))
        correctAnswers[question.id] = question.answers.find(answer => answer.correct).id
      })
      setTimeout(() => renderResultPage(questionsContainer, lastIndex))

      assignEventListener(startButton, () => {
        currentQuestion = 1
        isEnd = false
        moveView(lastIndex)
        questionsListing.style.visibility = 'visible'
        countTime(lastIndex)
      })

      assignEventListener(stopButton, () => stopQuiz(lastIndex))
      assignEventListener(toResultsButton, () => {
        currentQuestion = lastIndex + 2
        moveView(lastIndex)
      })
    })
    .catch((err) => {
      alert('Nie udało się pobrać pytań')
    })
}

function moveView (maxIndex) {
  questionsContainer.style.left = `-${currentQuestion * 100}vw`
  stopButton.style.display = isEnd ? 'none' : 'block'
  startButton.style.display = currentQuestion === 0 ? 'block' : 'none'

  if (!isEnd) {
    if (currentQuestion > 0 && currentQuestion <= maxIndex + 1) {
      Array.from(questionsListing.childNodes)
        .map(answerNum => {
          answerNum.style.border = 'solid 1px white'
          if (parseInt(answerNum.textContent) === currentQuestion) {
            answerNum.style.border = 'solid 1px #434e66'
            answerNum.style.backgroundColor = bluePrimary
          } else if (answerNum.style.backgroundColor === bluePrimary) {
            answerNum.style.backgroundColor = mustardSecondary
          }
        })
    }
  } else {
    toResultsButton.style.visibility = currentQuestion === maxIndex + 2 ? 'hidden' : 'visible'

    Array.from(questionsListing.childNodes)
      .map(answerNum => {
        answerNum.style.border = 'solid 1px white'
        if (parseInt(answerNum.textContent) === currentQuestion) {
          answerNum.style.border = 'solid 1px #434e66'
        }
      })
  }
}

function renderQuestion (root, { id, question, answers }, index, maxIndex) {
  let container = document.createElement('div')
  let questionDiv = document.createElement('div')
  let text = document.createElement('span')
  let answersDiv = document.createElement('div')
  let navigation = document.createElement('nav')
  let prevButton = document.createElement('button')
  let nextButton = document.createElement('button')

  let questionNumber = document.createElement('span')
  questionNumber.textContent = id
  questionNumber.id = `${id}-list`
  questionNumber.className = 'question-number'
  questionNumber.style.backgroundColor = graySecondary
  assignEventListener(questionNumber, () => {
    currentQuestion = id
    moveView(maxIndex)
  })

  questionsListing.appendChild(questionNumber)
  answers.map(answer => answersDiv.appendChild(renderAnswer(id, answer)))

  questionDiv.className = 'question-div'
  text.textContent = question
  answersDiv.className = 'answers'
  prevButton.innerHTML = 'poprzednie'
  prevButton.className = 'sg-button-primary sg-button-primary--alt'
  prevButton.style.visibility = index > 0 ? 'visible' : 'hidden'
  assignEventListener(prevButton, () => {
    currentQuestion -= 1
    moveView(maxIndex)
  })
  nextButton.innerHTML = 'następne'
  nextButton.style.visibility = index < maxIndex ? 'visible' : 'hidden'
  nextButton.className = 'sg-button-primary sg-button-primary--alt'
  assignEventListener(nextButton, () => {
    currentQuestion += 1
    moveView(maxIndex)
  })
  navigation.className = 'navigation'

  navigation.appendChild(prevButton)
  navigation.appendChild(nextButton)
  questionDiv.appendChild(navigation)
  questionDiv.appendChild(text)
  questionDiv.appendChild(answersDiv)
  container.appendChild(questionDiv)
  root.appendChild(container)
}

function renderAnswer (_id, { id, answer }) {
  let div = document.createElement('div')
  let divLabel = document.createElement('div')
  let divRadio = document.createElement('div')
  let input = document.createElement('input')
  let label = document.createElement('label')
  let ghostLabel = document.createElement('label')

  input.type = 'radio'
  input.className = 'sg-radio__element'
  input.value = id
  input.id = `${id}-input`
  input.onchange = (e) => handleAnswerClicked(_id, e.target.value)
  input.name = `${_id}-question`
  div.className = 'sg-label sg-label--secondary'
  label.className = 'sg-label__text'
  label.htmlFor = `${id}-input`
  label.textContent = answer
  label.style.color = white
  ghostLabel.className = 'sg-radio__ghost'
  ghostLabel.htmlFor = `${id}-input`
  divLabel.className = 'sg-label__icon'
  divRadio.className = 'sg-radio'

  divRadio.appendChild(input)
  divRadio.appendChild(ghostLabel)
  divLabel.appendChild(divRadio)
  div.appendChild(divLabel)
  div.appendChild(label)

  return div
}

function renderResultPage (root, maxIndex) {
  const container = document.createElement('div')
  const containerInner = document.createElement('div')
  const resultContainerDiv = document.createElement('div')
  const labelResultDiv = document.createElement('label')
  const result = document.createElement('span')
  const timeContainerDiv = document.createElement('div')
  const labelTimeDiv = document.createElement('label')
  const time = document.createElement('span')
  const returnButton = document.createElement('button')

  containerInner.className = 'result-container'
  result.id = 'result-span'
  time.id = 'time-span'
  labelResultDiv.innerHTML = 'Wynik:'
  labelTimeDiv.innerHTML = 'Czas:'
  timeContainerDiv.className = 'time-container'
  returnButton.innerHTML = 'Powtórz quiz'
  returnButton.className = 'sg-button-primary sg-button-primary--alt'

  assignEventListener(returnButton, () => resetQuiz(maxIndex))

  resultContainerDiv.appendChild(labelResultDiv)
  resultContainerDiv.appendChild(result)
  timeContainerDiv.appendChild(labelTimeDiv)
  timeContainerDiv.appendChild(time)
  containerInner.appendChild(resultContainerDiv)
  containerInner.appendChild(timeContainerDiv)
  containerInner.appendChild(returnButton)
  container.appendChild(containerInner)
  root.appendChild(container)
}

function resetQuiz (maxIndex) {
  currentQuestion = 0
  moveView(maxIndex)
  questionsListing.style.visibility = 'hidden'
  toResultsButton.style.visibility = 'hidden'
  userAnswers = {}
  timeUsed = 0
  isEnd = false
  Array.from(document.getElementsByTagName('input')).map(input => input.disabled = false)
  Array.from(document.getElementsByTagName('input')).map(input => input.checked = false)
  Array.from(document.getElementsByTagName('label'))
    .map(child => child.style.color === mintPrimary ? child.style.color = white : null)
  Array.from(questionsListing.childNodes).map(answerNum => answerNum.style.backgroundColor = graySecondary)
}

function stopQuiz (lastIndex) {
  currentQuestion = lastIndex + 2
  isEnd = true
  moveView(lastIndex)
  checkScore(lastIndex + 1)
  clearInterval(interval)
  document.getElementById('timer').innerHTML = ''
  document.getElementById('time-span').innerHTML = timeUsed
}

function handleAnswerClicked (questionId, value) {
  userAnswers[questionId] = parseInt(value)
  if (questionId + 1 <= Object.keys(correctAnswers).length) {
    currentQuestion = currentQuestion + 1
    moveView(Object.keys(correctAnswers).length)
  }
}

function checkScore (lastIndex) {
  let result = Object.keys(userAnswers).reduce((acc, key, index) => (
    userAnswers[key] === correctAnswers[key] ? acc += 1 : acc
  ),0)

  const resultSpan = document.getElementById('result-span')
  resultSpan.innerHTML = `${result} / ${lastIndex}`

  Array.from(questionsListing.childNodes).map((questionNum, index) => {
    questionNum.style.backgroundColor =
      (
        userAnswers[parseInt(questionNum.textContent)] === correctAnswers[parseInt(questionNum.textContent)]
        ? mintPrimary
        : peachPrimary
      )
  })

  Array.from(document.getElementsByTagName('input')).map(input => input.disabled = true)

  Array.from(document.getElementsByClassName('question-div')).map((child, index) => {
    Array.from(child.getElementsByClassName('sg-label__text'))[correctAnswers[index+1]-1].style.color = mintPrimary
  })
}

function countTime (lastIndex) {
  interval = setInterval(() => {
    document.getElementById('timer').innerHTML = `TIMER: ${quizTime - timeUsed}`
    if (quizTime - timeUsed === 0) {
      stopQuiz(lastIndex, timeUsed)
    }
    timeUsed += 1
  },1000)
}
