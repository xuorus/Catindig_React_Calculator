import { useState } from 'react';
import { buttons } from './utils/buttons';
import { MODES } from './utils/modes';
import Button from './Button';
import ChangeStyle from './ChangeStyle';
import {
  endsWithNegativeSign,
  endsWithOperator,
  isOperator,
} from './utils/validator';
import './styles/App.css';

function App() {
  const [formula, setFormula] = useState('');
  const [currentValue, setCurrentValue] = useState('0');
  const [prevValue, setPrevValue] = useState('0');
  const [evaluate, setEvaluate] = useState(false);

  const [mode, setMode] = useState(MODES.purple);

  function handlerNumber({ target: { innerText } }) {
    setEvaluate(false);
    if (evaluate) {
      setCurrentValue(innerText);
      setFormula(innerText !== '0' ? innerText : '');
    } else {
      setCurrentValue(
        currentValue === '0' || isOperator.test(currentValue)
          ? innerText
          : currentValue + innerText
      );
      setFormula(
        currentValue === '0' && innerText === '0'
          ? formula === ''
            ? innerText
            : formula
          : // Si la formula es '0' o si hay un '0' luego de un operador
          // Ej: 12 - 0, 12 * 0
          /([^.0-9]0|^0)$/.test(formula)
          ? formula.slice(0, -1) + innerText
          : formula + innerText
      );
    }
  }

  function handlerDecimal() {
    if (evaluate) {
      setCurrentValue('0.');
      setFormula('0.');
      setEvaluate(false);
    } else {
      if (!currentValue.includes('.')) {
        if (
          endsWithOperator.test(formula) ||
          (currentValue === '0' && formula === '')
        ) {
          setCurrentValue('0.');
          setFormula(formula + '0.');
        } else {
          setCurrentValue(formula.match(/(\d+\d*)$/)[0] + '.');
          setFormula(formula + '.');
        }
      }
    }
  }

  function handlerEqual() {
    if (evaluate || endsWithOperator.test(formula)) return;

    let result = '';

    try {
      result = eval(formula) ?? NaN;
    } catch (error) {
      return;
    }

    setCurrentValue(result);
    setPrevValue(result);
    setFormula(
      isFinite(result) || isNaN(result) ? formula + '=' + result : result
    );
    setEvaluate(true);
  }

  function handlerOperator({ target: { innerText } }) {
    if (evaluate) {
      setFormula(currentValue + innerText);
      setCurrentValue(innerText);
      setEvaluate(false);
    } else {
      setCurrentValue(innerText);

      if (!endsWithOperator.test(formula)) {
        setPrevValue(formula);
        setFormula(formula + innerText);

      } else if (!endsWithNegativeSign.test(formula)) {
        setFormula(
          (endsWithNegativeSign.test(formula + innerText)
            ? formula
            : prevValue) + innerText
        );

      } else if (innerText !== '-') {
        setFormula(prevValue + innerText);
      }
    }
  }

  function handlerInitialize() {
    setFormula('');
    setCurrentValue('0');
    setPrevValue('0');
    setEvaluate(false);
  }

  function changeMode(mode) {
    setMode(mode);
  }

  return (
    <div className={'container ' + mode}>
      <div className='calculator'>
        <ChangeStyle change={changeMode} />
        <div className='screen'>
          <div className='formula'>{formula}</div>
          <div className='output'>{currentValue}</div>
        </div>
        <div className='buttons'>
          {buttons.map((button) => (
            <Button
              key={button.id}
              number={handlerNumber}
              decimal={handlerDecimal}
              equal={handlerEqual}
              operator={handlerOperator}
              initialize={handlerInitialize}
              type={button.type}
              id={button.id}
            >
              {button.value}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
