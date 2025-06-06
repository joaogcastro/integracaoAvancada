import styled, { css, keyframes } from "styled-components";
import type { buttonSize, buttonStyles, buttonStylesType } from ".";

interface buttonProps {
  $buttonSize: buttonSize;
  $buttonStyles: buttonStyles;
  $loading: boolean;
  $buttonStylesType: buttonStylesType;
}

const loading = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const primaryStyle = css<buttonProps>`
  ${({ $buttonStylesType }) => {
    if ($buttonStylesType === "fill") {
      return css`
        background-color: ${({ theme }) => theme.colors.brand.blue};
        color: white;
        box-shadow: 0px 4px 6.1px -5px #0000009e;

        &:hover {
          background-color: ${({ theme }) => theme.colors.brand.dark_blue};
          color: ${({ theme }) => theme.colors.brand.white};
        }
      `;
    }

    return css`
      color: ${({ theme }) => theme.colors.brand.blue};
      border: 1px solid;
      background-color: transparent;

      &:hover {
        background-color: ${({ theme }) => theme.colors.brand.blue};
        color: white;
      }
    `;
  }}
`;

const textStyle = css<buttonProps>`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.brand.black};
  &:hover {
    background-color: ${({ theme }) => theme.colors.grayscale.gray_10};
  }
`;

const deleteStyle = css<buttonProps>`
  ${({ $buttonStylesType }) => {
    if ($buttonStylesType === "fill") {
      return css`
        background-color: ${({ theme }) => theme.colors.support.error};
        color: ${({ theme }) => theme.colors.brand.white};
        box-shadow: 0px 4px 6.1px -5px #0000009e;

        &:hover {
          background-color: white;
          color: red;
        }
      `;
    }

    return css`
      border: 1px solid;
      color: ${({ theme }) => theme.colors.support.error};
      ${({ theme }) => theme.font.p.small};

      &:hover {
        background-color: ${({ theme }) => theme.colors.support.error};
        color: white;
      }
    `;
  }}
`;

const confirmStyle = css<buttonProps>`
  ${({ $buttonStylesType }) => {
    if ($buttonStylesType === "fill") {
      return css`
        background-color: ${({ theme }) => theme.colors.support.success};
        color: ${({ theme }) => theme.colors.brand.white};
        box-shadow: 0px 4px 6.1px -5px #0000009e;

        &:hover {
          background-color: white;
          border: 1px solid;
          color: ${({ theme }) => theme.colors.support.success};
        }
      `;
    }

    return css`
      border: 1px solid;
      color: ${({ theme }) => theme.colors.support.success};
      ${({ theme }) => theme.font.p.small};

      &:hover {
        background-color: ${({ theme }) => theme.colors.support.success};
        color: white;
      }
    `;
  }}
`;

const styles = {
  primary: primaryStyle,
  text: textStyle,
  delete: deleteStyle,
  confirm: confirmStyle,
};

const smallSize = css`
  ${({ theme }) => theme.font.p.small};
`;
const normalSize = css`
  ${({ theme }) => theme.font.p.normal};
`;
const largeSize = css`
  ${({ theme }) => theme.font.p.large};
`;

const sizes = {
  small: smallSize,
  normal: normalSize,
  large: largeSize,
};

export const ButtonsLoginContainer = styled.button<buttonProps>`
  padding: 0.5em 0.8em;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  gap: 10px;
  transition: 0.4s;

  ${({ $buttonStyles }) => styles[$buttonStyles]};
  ${({ $buttonSize }) => sizes[$buttonSize]};

  ${({ $loading }) => {
    if ($loading) {
      return css`
        pointer-events: none;
      `;
    }
  }}
  .loading-button {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    border-radius: 0.5em;
    background-color: rgba(0, 0, 0, 0.5);
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    .load-icon {
      width: 20px;
      color: ${({ theme }) => theme.colors.brand.white};
      animation: 1s ${loading} infinite linear;
    }
  }
`;