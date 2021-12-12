import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateRoomPage from './CreateRoomPage';
import RoomJoinPage from './RoomJoinPage';

const HomePage = () => {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<p>This is home page</p>} />
                <Route path='/join' element={<RoomJoinPage />} />
                <Route path='/create' element={<CreateRoomPage />} />
            </Routes>
        </Router>
    );
};

export default HomePage;
