import { styled } from '@linaria/react';
import HomePage from './HomePage';

const Wrapper = styled.section`
    padding: 4em;
    background: papayawhip;
`;

const App = () => {
    return (
        <Wrapper>
            <h1>Testing App React Component</h1>
            <HomePage />
        </Wrapper>
    );
};

export default App;
