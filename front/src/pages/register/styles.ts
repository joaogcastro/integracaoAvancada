// styles.ts (ou onde preferir)
import styled from "styled-components";

export const LoginContainer = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative; 
  width: 100vw;
  height: 100vh;
  overflow: hidden; 
  background: linear-gradient(to bottom, #120513, #424242);
`;

export const GlowingCircle = styled.div`
  position: absolute;
  top: 20%; 
  left: 70%; 
  opacity: 0.8;
  border-radius: 50%;
  box-shadow: 0px 0px 174.1px 74px rgba(100, 15, 203, 0.9);
  pointer-events: none; 
  z-index: 0; 
`;

// O container do card de login
export const Card = styled.div`
  background: #eaeaea;
  border-radius: 15px;
  padding: 2rem; // equivale a p-8 (32px)
  width: 100%;
  max-width: 28rem; // max-w-md (448px)
  box-shadow: 0px 8px 15px 0px rgba(255, 255, 255, 0.5);
  z-index: 1; // pra ficar acima do GlowingCircle
`;

// Header do card
export const Header = styled.header`
  text-align: center;
  margin-bottom: 1.5rem;

  h3 {
    font-size: 1.5rem; /* text-2xl */
    font-weight: 600; /* font-semibold */
    color: #2d3748; /* text-gray-800 */
    margin-bottom: 0.25rem;
  }

  p {
    color: #718096; /* text-gray-600 */
  }
`;

// Form container com espaçamento entre inputs
export const Form = styled.form`
  margin-top: 1.5rem; /* mt-6 */
  display: flex;
  flex-direction: column;
  gap: 1rem; /* space-y-4 */
`;

// Input styles
export const Input = styled.input`
  width: 100%;
  padding: 0.5rem 1rem; /* py-2 px-4 */
  border: 1px solid #ccc;
  border-radius: 8px;
  color: #4a5568; /* text-gray-700 */
  outline: none;

  &:focus {
    box-shadow: 0 0 0 2px #3b82f6; /* focus:ring-2 focus:ring-blue-500 */
    border-color: #3b82f6;
  }
`;


export const ShowPasswordButton = styled.button`
  position: absolute;
  right: 0.75rem; /* right-3 */
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  color: #a0aec0; /* text-gray-500 */
  background: transparent;
  border: none;
  cursor: pointer;
`;

;



export const BottomText = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  color: #718096; 

  button {
    background: transparent;
    border: none;
    color: #9C27B0;
    cursor: pointer;
    font-weight: 700;

    &:hover {
      text-decoration: underline;
    }
  }
`;
