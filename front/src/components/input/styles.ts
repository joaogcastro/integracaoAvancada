import styled, { css } from "styled-components";
import type { inputStyle } from ".";

const primary = css`
  ${({ theme }) => {
    return css`
      background-color: ${theme.colors.brand.white};
      border: 1px solid ${theme.colors.grayscale.gray_30};
      ${theme.font.p.normal};
      color: ${theme.colors.grayscale.gray_80};
    `;
  }}
`;
const secondary = css`
  ${({ theme }) => {
    return css`
      background-color: ${theme.colors.brand.white};
      border: 1px solid ${theme.colors.grayscale.gray_30};
      ${theme.font.p.normal};
      color: ${theme.colors.brand.white};
    `;
  }}
`;

export const errorStyle = css`
  ${({ theme }) => {
    return css`
      input {
        color: ${theme.colors.support.error};
      }
      .input-container {
        background-color: transparent;
        border: 1px solid;
        ${theme.font.p.normal};
        color: ${theme.colors.support.error};
      }
    `;
  }}
`;

const styles = {
  primary,
  secondary,
};

interface inputStyleProps {
  $inputStyle: inputStyle;
  $required?: boolean;
  $disabled?: boolean;
  $error?: string;
}

export const InputContainer = styled.div<inputStyleProps>`
  transition: 0.3s;
  ${({ $disabled }) => {
    if ($disabled) {
      return css`
        opacity: 0.5;

        input {
          background-color: ${({ theme }) => theme.colors.grayscale.gray_10};
        }
      `;
    }
  }}

  input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.8em 0.8em;
    text-align: left;
    cursor: pointer;
    justify-content: flex-start;
    color: ${({ theme }) => theme.colors.grayscale.gray_90};
    ${({ theme }) => theme.font.p.normal};
    border-radius: 0.5em;
    cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
    outline: none;
  }

  .input-label {
    ${({ theme }) => theme.font.p.small};
    color: ${({ $inputStyle, theme }) =>
      $inputStyle === "secondary"
        ? theme.colors.brand.dark_blue
        : theme.colors.grayscale.gray_70};
    margin-bottom: 0.4em;
    display: block;
  }

  .error-container {
    ${({ theme }) => theme.font.p.small};
    color: ${({ theme }) => theme.colors.support.error};
    margin-top: 0.5em;
  }

  .affix-container {
    padding: 0 15px;
  }

  .input-container {
    display: flex;
    align-items: center;
    border-radius: 0.5em;
    position: relative;
    ${({ $inputStyle }) => styles[$inputStyle]}

    ${({ $required, theme }) => {
      if ($required) {
        return css`
          &:after {
            content: attr(data-required-text);
            color: ${theme.colors.grayscale.gray_60};
            background-color: ${({ theme }) => theme.colors.brand.white};
            padding: 0.2em 0.5em;
            border-radius: 0.2em;
            ${({ theme }) => theme.font.p.extra_small};
            position: absolute;
            top: -13px;
            right: 0.9em;
          }
        `;
      }
    }}
  }

  .input-container:focus-within {
    border: 1px solid ${({ theme }) => theme.colors.brand.blue};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.brand.light_blue};
  }

  ${({ $error }) => $error && errorStyle}
`;
