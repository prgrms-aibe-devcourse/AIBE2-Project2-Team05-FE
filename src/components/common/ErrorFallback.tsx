import styled from 'styled-components';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <Wrapper role="alert">
      <h2>문제가 발생했습니다.</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>다시 시도</button>
    </Wrapper>
  );
}

export default ErrorFallback;

const Wrapper = styled.div`
  padding: 20px;
  border: 1px solid red;
  border-radius: 5px;
  background-color: #fff0f0;

  pre {
    white-space: pre-wrap;
    margin: 10px 0;
  }
`; 