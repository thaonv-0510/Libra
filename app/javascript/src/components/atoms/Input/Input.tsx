import React from 'react'
import styled from "styled-components"

const BorderInput = styled.div`
  border: ${props => props.hasError ? '1px solid #df0808' : '1px solid rgb(23 57 165 / 20%)'};
  border-radius: 5px;
  height: 40px;
  padding: 0px 16px;
  background: rgb(23 57 165 / 5%);

  input {
    border: none;
    vertical-align: middle;
    width: 100%;
    height: 100%;
    color: #091F6C;
    background: none;
    margin: 0;
    padding: 0;

    :focus {
      outline: none;
    }
  }
`

const TextError = styled.p`
  color: #ff4e4e;
  margin-top: 5px;
  margin-left: -15px;
  font-size: 12px;
`

interface Props {
  hasError?: boolean;
  errorMessage?: string;
}

const Input: React.FC<Props & React.HTMLProps<HTMLInputElement>> = ({
  hasError,
  errorMessage,
  ...props
}) => {
  return(
    <BorderInput key="border-input" hasError={hasError}>
      <input
        key="input"
        type='text'
        data-testid="atom-input"
        {...props}
      />
        {hasError && errorMessage && (
          <TextError>{errorMessage}</TextError>
        )}
    </BorderInput>
  )
}

Input.defaultProps = {
  hasError: false
}

export default Input;
