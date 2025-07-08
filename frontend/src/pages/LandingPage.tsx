import Spline from '@splinetool/react-spline';
import { TruckIcon } from "lucide-react";
import { Link } from 'react-router-dom';

const LandingPage = () => {

return (
    <div>
        <header className='flex justify-between bg-blue-500 betten py-4 px-6 shadow-md text-white font-semibold'>
            <div className='bg-white p-0.5 rounded-md'>
                <TruckIcon className='text-blue-500'/>
            </div>
            <div>
                <a href="#" className="px-2 pb-1 border-b-2 border-transparent hover:border-white transition">Home</a>
                <a href="#" className="px-2 pb-1 border-b-2 border-transparent hover:border-white transition">System</a>
                <a href="#" className="px-2 pb-1 border-b-2 border-transparent hover:border-white transition">Team</a>
                <a href="#" className="px-2 pb-1 border-b-2 border-transparent hover:border-white transition">Contact</a>
            </div>
            <Link to="/login">
            <button type="button" className='text-blue-500 px-2 rounded-md bg-white hover:bg-gray-100 p-0.5'>
                Login
            </button>
            </Link>
        </header>
        <main className="bg-white flex justify-start">
            <div className='h-72 w-full'>
                <Spline scene="https://prod.spline.design/vFGti6X4DHn93hmH/scene.splinecode" />
            </div>
            
        </main>
        <footer>

        </footer>
    </div>
)
}

export default LandingPage
