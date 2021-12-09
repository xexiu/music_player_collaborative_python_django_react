import { styled } from '@linaria/react';

const Wrapper = styled.section`
  padding: 4em;
  background: papayawhip;
`;

const App = (props: any) => {
    return (
        <Wrapper>
            <h1>Testing React Component</h1>
        </Wrapper>
    )
}

export default App;
