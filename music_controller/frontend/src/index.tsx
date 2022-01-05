import { render } from 'react-dom';
import App from './components/App';
import './index.css';

if (process.env.NODE_ENV !== 'production') {
    console.log('Looks like we are in development mode!');
}

render(
    <App />,
    document.getElementById('app')
);
