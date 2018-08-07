import _suffle from 'lodash/shuffle'
import getTextPosition, { Position } from './GetTextPosition'
import EventEmitter, { EventName } from './EventEmitter'

const $btn: HTMLButtonElement = document.getElementById('fixText') as HTMLButtonElement
const $inputText: HTMLInputElement = document.getElementById('inputText') as HTMLInputElement

$btn.addEventListener('click', (event: Event): void => {
  event.preventDefault()
  event.stopPropagation()

  const textVal: string = $inputText.value
  const positions: Position[] = _suffle(getTextPosition(textVal))

  EventEmitter.emit(EventName.ON_INPUT_TEXT, positions)

}, false)
