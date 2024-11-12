import React, { useEffect, useState } from 'react';
import edit from './assest/edit.svg';
import remove from './assest/delete.svg';
import complete from './assest/complete.svg';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Home = () => {
    const { register, handleSubmit, reset, setValue, formState: { errors }, setError, watch } = useForm();
    const { t } = useTranslation();
    const [tab, setTab] = useState(1);
    const [todos, setTodos] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [updateId, setUpdateId] = useState(null);

    // Watch the task input value
    const taskValue = watch('task');

    const fetchTodos = async () => {
        try {
            const response = await axios.get('http://localhost:3000/read-tasks');
            setTodos(response.data);
        } catch (error) {
            console.error("Error fetching todos:", error);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    const handleTabs = (tab) => setTab(tab);

    const onSubmit = (data) => {
        if (isEdit) {
            updateTask(data.task);
        } else {
            handleAddTask(data.task);
        }
        reset();
    };

    const handleAddTask = async (task) => {
        // Check for duplicates
        const exists = todos.some(todo => todo.task.toLowerCase() === task.toLowerCase());
        if (exists) {
            setError('task', { message: t('task_already_exists') });
            return; // Early return to prevent adding a duplicate
        }

        try {
            const response = await axios.post('http://localhost:3000/new-task', { task });
            // Optimistically update the state
            setTodos(prevTodos => [...prevTodos, response.data]);
            setError('task', { message: '' });
            fetchTodos(); // Fetch updated tasks from the server
        } catch (err) {
            if (err.response) {
                setError('task', { message: err.response.data });
            } else {
                setError('task', { message: "An error occurred while adding the task." });
            }
        }
    };

    const updateTask = async (task) => {
        try {
            const response = await axios.post('http://localhost:3000/update-task', { updateId, task });
            // Optimistically update the state
            setTodos(prevTodos => prevTodos.map(todo => todo.id === updateId ? { ...todo, task } : todo));
            setIsEdit(false);
            setUpdateId(null);
            fetchTodos(); // Fetch updated tasks from the server
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const handleEdit = (id, task) => {
        setIsEdit(true);
        setUpdateId(id);
        setValue('task', task);
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.post('http://localhost:3000/delete-task', { id });
            // Optimistically update the state
            setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
            fetchTodos(); // Fetch updated tasks from the server
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const handleComplete = async (id) => {
        try {
            const response = await axios.post('http://localhost:3000/complete-task', { id });
            // Optimistically update the state
            setTodos(prevTodos => prevTodos.map(todo => todo.id === id ? { ...todo, status: 'completed' } : todo));
            fetchTodos(); // Fetch updated tasks from the server
        } catch (error) {
            console.error("Error completing task:", error);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-4xl p-6">
                <h1 className="text-center text-4xl font-bold text-white mb-8">ToDo List</h1>
                
                <div className="flex justify-end mb-4">
                    <LanguageSwitcher />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow-lg">
                    <div className="flex flex-col bg-blue-50 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                        <h2 className="font-bold text-2xl mb-4 text-blue-600">{t('add_new_task')}</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    placeholder={t('enter_your_task')}
                                    className="w-full p-4 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                    {...register('task', { required: t('task_cannot_be_empty') })}
                                />
                                <button 
                                    type="submit" 
                                    className={`bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-800 transition duration-300 shadow-md ${!taskValue ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={!taskValue}
                                >
                                    {isEdit ? t('update') : t('add')}
                                </button>
                            </div>
                            {errors.task && (
                                <p className="text-red-500 text-sm mt-1">{errors.task.message}</p>
                            )}
                        </form>
                    </div>

                    <div className="flex flex-col bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                        <h2 className="font-bold text-2xl mb-4 text-green-600">{t('my_tasks')}</h2>
                        <div className="flex justify-between mb-4">
                            <div className="flex space-x-4">
                                <p onClick={() => handleTabs(1)} className={`${tab === 1 ? 'text-blue-600 font-bold' : 'text-gray-600'} cursor-pointer hover:text-blue-500 transition duration-200`}>{t('all')}</p>
                                <p onClick={() => handleTabs(2)} className={`${tab === 2 ? 'text-blue-600 font-bold' : 'text-gray-600'} cursor-pointer hover:text-blue-500 transition duration-200`}>{t('active')}</p>
                                <p onClick={() => handleTabs(3)} className={`${tab === 3 ? 'text-blue-600 font-bold' : 'text-gray-600'} cursor-pointer hover:text-blue-500 transition duration-200`}>{t('completed')}</p>
                            </div>
                        </div>

                        <div className="h-96 overflow-y-auto">
                            {todos?.filter(todo =>
                                tab === 1 || (tab === 2 && todo.status === 'active') || (tab === 3 && todo.status === 'completed')
                            ).map(todo => (
                                <div key={todo.id} className={`flex justify-between items-start p-4 mb-4 rounded-lg shadow-md ${todo.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'} transition duration-200`}>
                                    <div>
                                        <p className="text-lg font-semibold">{todo.task}</p>
                                        <p className="text-xs text-gray-500">{new Date(todo.createdAt).toLocaleDateString()}</p>
                                        <p className="text-sm">
                                            <span className="font-bold text-black">{t('status')}:</span>
                                            <span className={`${todo.status === 'active' ? 'font-bold text-red-600' : todo.status === 'completed' ? 'font-bold text-green-600' : 'text-black'}`}>
                                                {t(todo.status)}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        {todo.status !== 'completed' && (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(todo.id, todo.task)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    <img src={edit} alt="edit" className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleComplete(todo.id)}
                                                    className="text-green-500 hover:text-green-700"
                                                >
                                                    <img src={complete} alt="complete" className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleDelete(todo.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <img src={remove} alt="delete" className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
