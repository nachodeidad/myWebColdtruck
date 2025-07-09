import Spline from '@splinetool/react-spline';
import { BellRing, BookOpen, Github, Mail, ThermometerSnowflake, TruckIcon } from "lucide-react";
import { Link } from 'react-router-dom';

const LandingPage = () => {

return (
    <div className="min-h-screen bg-white relative z-0">
        <div
            className="absolute inset-0 z-0 "
            style={{
            backgroundImage: `radial-gradient(circle 600px at 50% 50%, rgba(59,130,246,0.3), transparent)`,
            }}
        />
        <header className='text-md flex justify-between bg-white px-6 text-blue-500 font-semibold sticky top-0 shadow-md z-50'>
            <div className='flex justify-center items-center'>
                <button className='bg-blue-500 rounded-md m-1.5 px-3 flex justify-center items-center h-9'>
                    <TruckIcon className='text-white h-10 w-10'/>
                    <p className="font-bold z-10 text-white ml-3">ColdTruck</p>
                </button>
            </div>
            <div className='hidden lg:flex justify-center items-center py-5 gap-6 z-10'>
                <a href="" className="px-2 py-1 pb-1 border-b-2 border-transparent hover:border-blue-500 duration-500">Home</a>
                <a href="#AboutUs" className="px-2 py-1 pb-1 border-b-2 border-transparent hover:border-blue-500 duration-500">About Us</a>
                <a href="#ContactUs" className="px-2 py-1 pb-1 border-b-2 border-transparent hover:border-blue-500 duration-500">Contact Us</a>
                <Link to="/login">
                    <button type="button" className='text-white rounded-md py-1 px-3 bg-blue-500 hover:bg-blue-400 p-0.5'>
                        Sign In
                    </button>
                </Link>
            </div>
            <div className='lg:hidden justify-center items-center py-5 gap-6 z-10'>
                <Link to="/login">
                    <button type="button" className='text-white rounded-md py-1 px-3 bg-blue-500 hover:bg-blue-400 p-0.5'>
                        Sign In
                    </button>
                </Link>
            </div>
            
        </header>
        <main>
            <section className="flex-col justify-center items-center p-24 lg:flex lg:flex-row lg:justify-between w-full bg-[#0f172a] relative">
                <div
                    className="absolute inset-0"
                    style={{
                    backgroundImage: `radial-gradient(circle 600px at 50% 50%, rgba(59,130,246,0.3), transparent)`,
                    }}
                />
                <div className="text-white mb-5 z-10 lg:mr-10">
                    <h2 className="text-4xl font-extrabold">Refrigerated transport monitoring <span className="text-blue-500">ColdTruck</span></h2>
                    <p className="text-xl mt-2 text-justify">Comprehensive real-time management and monitoring system for refrigerated transport fleets.</p>
                    <p className="text-xl mt-2 text-justify">Monitor the temperature, location, and status of your trailers from anywhere.</p>
                    <div className="lg:grid flex flex-col gap-7 mt-6 w-50">
                        <Link to="/login" className=''>
                            <a href="" className="bg-white text-black px-8 py-2 rounded-xl font-medium hover:bg-gray-200 duration-500">Access the system </a>
                        </Link>
                        <div className='w-40'>
                            <a href="#Features" className="bg-blue-600 text-white px-8 py-2 rounded-xl font-medium hover:bg-blue-500 duration-500">Features</a>
                        </div>
                        
                    </div>
                </div>
                <img
                    className="relative rounded-2xl shadow-2xl w-full lg:w-auto"
                    src="https://media.istockphoto.com/id/1445074332/es/foto/semirremolques-de-plataformas-grandes-y-coloridos-brillantes-con-semirremolques-parados-en-la.jpg?s=612x612&w=0&k=20&c=8H_zXHhDJ9CqXj_xGJ83n7hDmR5wXIQ54q6D2PDNwu4="
                    alt="Blue Peterbilt Truck"
                />
            </section>
            <section className="p-24 z-10" id='Features'>
                <div className="flex justify-center">
                    <h2 className="text-4xl z-10 font-extrabold" >System Features</h2>
                </div>
                <div className="flex justify-center mb-5">
                    <p className="text-xl text-gray-600 z-10 text-center">The system has specific characteristics that make our system functional, the main ones are</p>
                </div>
                <div className="flex-col justify-center items-center lg:grid lg:grid-cols-3 lg:gap-5 z-10 min-h-full">
                    <div className="p-10 shadow-xl rounded-3xl mt-5">
                        <div className="flex justify-center items-center">
                            <div className="bg-gray-200 p-2 rounded-xl">
                                <TruckIcon className="text-black-900"/>
                            </div>
                            <h3 className="ml-3 text-xl font-medium z-10">Route Management</h3>
                        </div>
                        <div className="z-10">
                            <p className="text-lg text-justify mt-2 z-10">It allows the creation of routes with their origin and destination points, as well as the permitted temperature and humidity ranges.</p>
                        </div>
                    </div>
                    <div className="p-10 shadow-xl rounded-3xl mt-5 z-10">
                        <div className="flex justify-center items-center">
                            <div className="bg-blue-200 p-2 rounded-xl">
                                <ThermometerSnowflake className="text-blue-900"/>
                            </div>
                            <h3 className="ml-3 text-xl font-medium z-10">Temperature Control</h3>
                        </div>
                        <div>
                            <p className="text-lg text-justify mt-2 z-10">During an active trip, the system must display the trailer's internal temperature in real time on the mobile and web application.</p>
                        </div>
                    </div>
                    <div className="p-10 shadow-xl rounded-3xl mt-5 z-10">
                        <div className="flex justify-center items-center">
                            <div className="bg-red-200 p-2 rounded-xl">
                                <BellRing className="text-red-900"/>
                            </div>
                            <h3 className="ml-3 text-xl font-medium">Alert System</h3>
                        </div>
                        <div>
                            <p className="text-lg text-justify mt-2">When the internal temperature or humidity of a trailer exceeds or falls below the permitted range, the system generates an automatic alert.</p>
                        </div>
                    </div>
                    <div className="p-10 shadow-xl rounded-3xl mt-5 z-10">
                        <div className="flex justify-center items-center">
                            <div className="bg-green-200 p-2 rounded-xl">
                                <TruckIcon className="text-green-900"/>
                            </div>
                            <h3 className="ml-3 text-xl font-medium">Truck Management</h3>
                        </div>
                        <div className="">
                            <p className="text-lg text-justify mt-2">All trucks are recorded using specific data, as well as their condition.</p>
                        </div>
                    </div>
                    <div className="p-10 shadow-xl rounded-3xl mt-5 z-10">
                        <div className="flex justify-center items-center">
                            <div className="bg-yellow-200 p-2 rounded-xl">
                                <BookOpen className="text-yellow-900"/>
                            </div>
                            <h3 className="ml-3 text-xl font-medium ">Travel History</h3>
                        </div>
                        <div className="">
                            <p className="text-lg text-justify mt-2">View trip history using filters (by driver, date, truck, and status) and a keyword search bar.</p>
                        </div>
                    </div>
                    <div className="p-10 shadow-xl rounded-3xl mt-5 z-10">
                        <div className="flex justify-center items-center">
                            <div className="bg-violet-200 p-2 rounded-xl">
                                <TruckIcon className="text-violet-900"/>
                            </div>
                            <h3 className="ml-3 text-xl font-medium z-10">Roles and Permissions</h3>
                        </div>
                        <div className="z-10">
                            <p className="text-lg text-justify mt-2 z-10">The system restricts access to functions based on the user's role as a driver or administrator.</p>
                        </div>
                    </div>
                </div>
            </section>
            <section className="flex-col justify-center items-center p-24 lg:flex lg:flex-row lg:justify-between w-full bg-[#0f172a] relative mt-10" id='AboutUs'>
                <div
                    className="absolute inset-0"
                    style={{
                    backgroundImage: `radial-gradient(circle 600px at 50% 50%, rgba(59,130,246,0.3), transparent)`,
                    }}
                />
                <div className="lg:w-screen aspect-square mb-10">
                    <Spline scene="https://prod.spline.design/7c3lgQ56H3Cc8Dqb/scene.splinecode" />
                </div>
                <div className="lg:ml-10 grid gap-10 z-10">
                    <div className='text-justify'>
                        <h3 className="text-white text-4xl font-extrabold">About Us</h3>
                        <p className="text-white text-xl">We are a company focused on global expansion. Although we currently focus exclusively on Mexico, we are committed to transforming refrigerated transportation through an intelligent, efficient, and reliable monitoring system.</p>
                    </div>
                    <div className='text-justify'>
                        <h4 className="text-4xl z-10 text-white font-extrabold">Vision</h4>
                        <p className="text-white text-xl">Develop and provide the ColdTruck system for monitoring refrigerated transport, combining cutting-edge technology, precision, and reliability, ensuring our customers' product quality from origin to destination.</p>
                    </div>
                    <div className='text-justify'>
                        <h4 className="text-4xl font- z-10 text-white font-extrabold">Mision</h4>
                        <p className="text-white text-xl">To be global leaders in intelligent monitoring solutions for refrigerated transport, recognized for our innovation, international coverage, and commitment to operational efficiency and supply chain sustainability.</p>
                    </div>
                </div>
            </section>
            <section className='p-24' id='ContactUs'>
                <div className='flex justify-center items-center'>
                    <h3 className="text-4xl font-extrabold">Contact Us</h3>
                </div>
                <div className="flex justify-center mb-5">
                    <p className="text-xl text-gray-600 z-10">Meet the team of developers who made ColdTruck possible</p>
                </div>
                <div className='grid lg:grid-cols-5 gap-5'>
                    <div className='shadow-xl rounded-lg p-8'>
                        <div className='flex justify-center items-center '>
                            <h4 className='text-blue-800 text-lg font-semibold bg-blue-200 p-4 rounded-full '>DL</h4>
                        </div>
                        <div className='flex justify-center items-center mt-2'>
                            <p className='text-lg font-semibold'>Diaz Reyes Luis Ignacio</p>
                        </div>
                        <div className='flex justify-center items-center'>
                            <p className='text-gray-500'>Full Stack Developer</p>
                        </div>
                        <div className='flex justify-center items-center  bg-blue-200 p-2 rounded-lg'>
                            <p className='text-center'>Especialista en React, Node.js y arquitecturas de microservicios. Líder técnico del proyecto.</p>
                        </div>
                        <div className='flex justify-center items-center mt-4'>
                            <Github />
                            <Mail />
                        </div>
                    </div>
                    <div className='shadow-xl rounded-lg p-8'>
                        <div className='flex justify-center items-center '>
                            <h4 className='text-green-800 text-lg font-semibold bg-green-200 p-4 rounded-full '>GJ</h4>
                        </div>
                        <div className='flex justify-center items-center mt-2'>
                            <p className='text-lg font-semibold'>Garcia Reyes Jose Adan</p>
                        </div>
                        <div className='flex justify-center items-center'>
                            <p className='text-gray-500'>IoT Specialist</p>
                        </div>
                        <div className='flex justify-center items-center  bg-green-200 p-2 rounded-lg'>
                            <p className='text-center'>Expert in IoT sensors, device communication, and telemetry protocols for refrigerated trailers.</p>
                        </div>
                        <div className='flex justify-center items-center mt-4'>
                            <Github />
                            <Mail />
                        </div>
                    </div>
                    <div className='shadow-xl rounded-lg p-8'>
                        <div className='flex justify-center items-center '>
                            <h4 className='text-violet-800 text-lg font-semibold bg-violet-200 p-4 rounded-full '>GE</h4>
                        </div>
                        <div className='flex justify-center items-center mt-2'>
                            <p className='text-lg font-semibold'>Gomez Cueva Elias Jair</p>
                        </div>
                        <div className='flex justify-center items-center'>
                            <p className='text-gray-500 text-center'>Scrum Master and Backend Developer</p>
                        </div>
                        <div className='flex justify-center items-center bg-violet-200 p-2 rounded-lg'>
                            <p className='text-center'>Technical project leader. Specialist in databases, REST APIs, and real-time systems. Backend infrastructure architect.</p>
                        </div>
                        <div className='flex justify-center items-center mt-4'>
                            <Github />
                            <Mail />
                        </div>
                    </div>
                    <div className='shadow-xl rounded-lg p-8'>
                        <div className='flex justify-center items-center '>
                            <h4 className='text-orange-800 text-lg font-semibold bg-orange-200 p-4 rounded-full '>MC</h4>
                        </div>
                        <div className='flex justify-center items-center mt-2'>
                            <p className='text-lg font-semibold text-center'> Maldonado Hernandez Cinthia Jazmin</p>
                        </div>
                        <div className='flex justify-center items-center'>
                            <p className='text-gray-500'>Frontend Developer</p>
                        </div>
                        <div className='flex justify-center items-center bg-orange-200 p-2 rounded-lg'>
                            <p className='text-center'>Expert in UX/UI and front-end development with React and TypeScript. Responsible for user experience.</p>
                        </div>
                        <div className='flex justify-center items-center mt-4'>
                            <Github />
                            <Mail />
                        </div>
                    </div>
                    <div className='shadow-xl rounded-lg p-8'>
                        <div className='flex justify-center items-center '>
                            <h4 className='text-red-800 text-lg font-semibold bg-red-200 p-4 rounded-full '>MM</h4>
                        </div>
                        <div className='flex justify-center items-center mt-2'>
                            <p className='text-lg font-semibold'>Morales Anacleto Mario Yair</p>
                        </div>
                        <div className='flex justify-center items-center'>
                            <p className='text-gray-500'>Mobile Developer</p>
                        </div>
                        <div className='flex justify-center items-center bg-red-200 p-2 rounded-lg'>
                            <p className='text-center'>Mobile app development specialist, using React Native.</p>
                        </div>
                        <div className='flex justify-center items-center mt-4'>
                            <Github />
                            <Mail />
                        </div>
                    </div>
                </div>
            </section>
        </main>
        <footer className="flex justify-center items-center px-24 py-10 w-full bg-[#0f172a] relative mt-10">
            <div
                className="absolute inset-0"
                style={{
                backgroundImage: `radial-gradient(circle 600px at 50% 50%, rgba(59,130,246,0.3), transparent)`,
                }}
            />
            <div className='flex justify-center items-center'>
                <p className='text-white font-semibold'>Copyright ColdTruck 2025 ©</p>
            </div>
        </footer>
    </div>
)
}

export default LandingPage
