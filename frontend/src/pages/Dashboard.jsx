import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/api";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTask, setSelectedTask] = useState(null); // For the task being edited
  const [showPopup, setShowPopup] = useState(false); // Pop-up visibility
  const navigate = useNavigate();

  const getTasks = async () => {
    try {
      const { data } = await fetchTasks();
      setTasks(data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate("/");
      } else {
        console.error(err);
      }
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const newTask = { title, description };
      const { data } = await createTask(newTask);
      setTasks([...tasks, data]);
      setTitle("");
      setDescription("");
      toast.success("Task added successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add task");
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowPopup(true);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      const updatedTask = {
        ...selectedTask,
        title: selectedTask.title,
        description: selectedTask.description,
      };
      const { data } = await updateTask(selectedTask._id, updatedTask);
      setTasks(
        tasks.map((task) => (task._id === selectedTask._id ? data : task))
      );
      setShowPopup(false);
      setSelectedTask(null);
      toast.success("Task updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter((task) => task._id !== id));
      toast.success("Task deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete task");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      getTasks();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Manager</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
      <form onSubmit={handleAddTask} className="mb-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Task
        </button>
      </form>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Task</h2>
            <form onSubmit={handleSaveChanges}>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Task Title"
                  value={selectedTask.title}
                  onChange={(e) =>
                    setSelectedTask({ ...selectedTask, title: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <textarea
                  placeholder="Task Description"
                  value={selectedTask.description}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      description: e.target.value,
                    })
                  }
                  className="w-full border px-3 py-2 rounded"
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="bg-gray-300 text-black px-4 py-2 rounded mr-2"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div>
        {tasks.map((task) => (
          <div
            key={task._id}
            className="p-4 bg-white rounded shadow mb-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold">{task.title}</h3>
              <p>{task.description}</p>
            </div>
            <div>
              <button
                onClick={() => handleEditTask(task)}
                className="px-4 py-2 bg-yellow-500 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteTask(task._id)}
                className="ml-2 px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
