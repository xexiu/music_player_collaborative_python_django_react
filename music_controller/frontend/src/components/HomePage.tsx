import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateRoomPage from './CreateRoomPage';
import Room from './Room';
import RoomJoinPage from './RoomJoinPage';

const HomePage = () => {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<p>This is home page</p>} />
                <Route path='/join' element={<RoomJoinPage />} />
                <Route path='/create' element={<CreateRoomPage />} />
                <Route path='/room/:roomCode' element={<Room />} />
            </Routes>
        </Router>
    );
};

export default HomePage;
