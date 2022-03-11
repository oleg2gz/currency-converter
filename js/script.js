const API_URL = 'http://api.exchangeratesapi.io/v1/latest'
const API_KEY = '90d652efaac3689e628edc5123060917'
const formConverter = document.getElementById('converter')
const radioGroup = formConverter.querySelectorAll('[type=radio]')
const inputCurrency = document.getElementById('input-currency')
const inputRubles = document.getElementById('input-rubles')

let rateCNY
let rateEUR // base rate
let rateUSD

const getRate = async (currency) => {
  try {
    const response = await fetch(
      `${API_URL}?access_key=${API_KEY}&symbols=${currency}`
    )
    if (!response.ok) throw new Error('Проблемы с сетью?')
    const result = await response.json()
    return result.rates[currency]
  } catch (err) {
    document.querySelector('.error').textContent`Что-то пошло не так: ${
      err.message || 'какая-то ошибка'
    }`
  }
}

const handleRadio = (e) => {
  if (!e.target.matches('input[type=radio]')) return
  inputCurrency.value = ''

  const currencyName = e.target.id.slice(-3).toUpperCase()
  const currencyRate =
    currencyName === 'USD'
      ? rateUSD
      : currencyName === 'EUR'
      ? rateEUR
      : rateCNY
  inputCurrency.dataset.rate = currencyRate
  inputCurrency.nextElementSibling.textContent =
    e.target.previousElementSibling.textContent
}

const handleInput = (e) => {
  if (e.target.matches('input')) {
    e.target.value = e.target.value.replace(/\D/gi, '')
  }
}

const handleSubmit = (e) => {
  e.preventDefault()

  if (!inputCurrency.value && !inputRubles.value) return

  if (!inputCurrency.value) {
    inputCurrency.value = (
      inputRubles.value / inputCurrency.dataset.rate
    ).toFixed(2)
  } else {
    inputRubles.value = (
      inputCurrency.value * inputCurrency.dataset.rate
    ).toFixed(2)
  }
}

formConverter.addEventListener('change', handleRadio)
formConverter.addEventListener('input', handleInput)
formConverter.addEventListener('submit', handleSubmit)

document.querySelector('[data-date]>span').textContent =
  new Date().toLocaleString('ru-Ru', {
    second: '2-digit',
    minute: '2-digit',
    hour: '2-digit',
    day: 'numeric',
    weekday: 'long',
    month: 'long',
    year: 'numeric',
  })

Promise.all([getRate('RUB'), getRate('USD'), getRate('CNY')])
  .then((data) => {
    rateEUR = data[0].toFixed(2)
    rateUSD = (data[0] / data[1]).toFixed(2)
    rateCNY = (data[0] / data[2]).toFixed(2)
    inputCurrency.dataset.rate = rateUSD
    document.querySelector('[data-currency=USD]>span').textContent = rateUSD
    document.querySelector('[data-currency=EUR]>span').textContent = rateEUR
    document.querySelector('[data-currency=CNY]>span').textContent = rateCNY
  })
  .catch((err) => {
    document.querySelector('.error').textContent`Что-то пошло не так: ${
      err.message || 'какая-то ошибка'
    }`
  })
