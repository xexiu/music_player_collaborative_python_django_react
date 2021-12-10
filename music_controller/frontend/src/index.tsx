import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import './index.css';

if (process.env.NODE_ENV !== 'production') {
    console.log('Looks like we are in development mode!');
}

render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('app')
);
