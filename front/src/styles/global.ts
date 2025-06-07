import { createGlobalStyle } from "styled-components";

export default createGlobalStyle`

* {
margin: 0;
padding: 0;
box-sizing: border-box;
list-style-type: none;
-webkit-font-smoothing: antialiased;
}
  #root {
    width: 100%;
    min-height: 100% !important;
    display: flex;

  }


  *::-webkit-scrollbar {
      width: 0.5em;
      height: 0.8em;
      border-radius: 99px;
    }

    *::-webkit-scrollbar-track {
      background:transparent;

    }

    *::-webkit-scrollbar-thumb {
      border-radius: 99px;
      background: ${({ theme }) => theme.colors.grayscale.gray_20};
    }

    *::-webkit-scrollbar-thumb:hover {
      background:${({ theme }) => theme.colors.grayscale.gray_30};
    }

button{
  cursor:pointer;
}

  input, button{
      background:none;
      border:0;
  }


  
  html, body {
  min-height: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.grayscale.gray_05};
  scroll-behavior: smooth;
}

body{
    pointer-events: unset !important;
    overscroll-behavior: none;
  }

h1{
    ${({ theme }) => theme.font.h1}
    color:${({ theme }) => theme.colors.brand.black} ;
  }
  h2{
    ${({ theme }) => theme.font.h2}
    color:${({ theme }) => theme.colors.brand.black} ;
  }
  h3{
    ${({ theme }) => theme.font.h3}
    color:${({ theme }) => theme.colors.brand.black} ;
  }
  p{
    ${({ theme }) => theme.font.p.medium}
    color:${({ theme }) => theme.colors.brand.black} ;
}

input{
  &::-webkit-calendar-picker-indicator{
  opacity:0.6;
  cursor:pointer;
  }

}


li[data-mounted="true"]{
  padding: 1em;
}

`;