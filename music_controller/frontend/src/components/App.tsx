import { styled } from '@linaria/react';
import HomePage from './HomePage';

const Wrapper = styled.section`
    padding: 4em;
    background: papayawhip;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;

const App = () => {
    return (
        <Wrapper>
            <HomePage />
        </Wrapper>
    );
};

export default App;
