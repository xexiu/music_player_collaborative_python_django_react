import App from "./components/App";
import { render } from 'react-dom';
import React from 'react';

render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('app')
);
