import React, { useState, useEffect } from 'react';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Member');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // App Core States
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  // Form states for creating items
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Check browser local memory on refresh for existing user session
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      fetchProjects();
    }
  }, []);

  // Fetch all projects from database engine
  const fetchProjects = async () => {
    try {
      const res = await fetch('https://motivator-backrest-coastland.ngrok-free.dev/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  // Fetch all tasks for a specific clicked project
  const fetchTasks = async (projectId) => {
    try {
      const res = await fetch(`https://motivator-backrest-coastland.ngrok-free.dev/api/tasks/project/${projectId}`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password, role };

    try {
      const response = await fetch(`https://motivator-backrest-coastland.ngrok-free.dev${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      if (isLogin && data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Immediately load system data boards
        const resProj = await fetch('https://motivator-backrest-coastland.ngrok-free.dev/api/projects');
        const projData = await resProj.json();
        setProjects(projData);
      } else {
        setName('');
        setEmail('');
        setPassword('');
        setIsLogin(true);
        setMessage('Registration successful! Please login.');
      }

    } catch (err) {
      setError(err.message);
    }
  };

  // Admin-Only Project Creation API trigger
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://motivator-backrest-coastland.ngrok-free.dev/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDesc,
          userId: user.id,
          userRole: user.role
        })
      });
      const data = await res.json();
      if (!res.ok) alert(data.message);
      else {
        setNewProjectName('');
        setNewProjectDesc('');
        fetchProjects(); // Refresh board array list
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin-Only Task Creation API trigger
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://motivator-backrest-coastland.ngrok-free.dev/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          projectId: selectedProject._id,
          userRole: user.role
        })
      });
      const data = await res.json();
      if (!res.ok) alert(data.message);
      else {
        setNewTaskTitle('');
        fetchTasks(selectedProject._id); // Refresh active tasks screen
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Task Status cycle endpoint trigger (Pending -> In Progress -> Completed)
  const handleUpdateStatus = async (taskId, currentStatus) => {
    let nextStatus = 'In Progress';
    if (currentStatus === 'In Progress') nextStatus = 'Completed';
    if (currentStatus === 'Completed') nextStatus = 'Pending';

    try {
      await fetch(`https://motivator-backrest-coastland.ngrok-free.dev/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      fetchTasks(selectedProject._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setSelectedProject(null);
    setTasks([]);
  };

  // DASHBOARD VIEW LAYER
  if (user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
        {/* Left Navigation Sidebar panel */}
        <div style={{ width: '280px', backgroundColor: '#0f172a', color: '#ffffff', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0' }}>Sync<span style={{ color: '#3b82f6' }}>Task</span></h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Logged in as: <b>{user.name}</b> ({user.role})</p>
          </div>
          
          <button onClick={handleLogout} style={{ padding: '8px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', width: '100%' }}>
            Sign Out Session
          </button>

          <hr style={{ borderColor: '#334155' }} />

          {/* Admin Control Module for adding projects */}
          {user.role === 'Admin' && (
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ margin: '0 0 4px 0', color: '#3b82f6', fontSize: '14px' }}>+ Launch New Project</h4>
              <input type="text" placeholder="Project Name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: 'none', fontSize: '13px', color: '#1e293b', backgroundColor: '#ffffff' }} />
              <input type="text" placeholder="Short Description" value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: 'none', fontSize: '13px', color: '#1e293b', backgroundColor: '#ffffff' }} />
              <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Create Project</button>
            </form>
          )}
          <div>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px', marginBottom: '12px' }}>Active Projects</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {projects.map((proj) => (
                <div key={proj._id} onClick={() => { setSelectedProject(proj); fetchTasks(proj._id); }} style={{ padding: '12px', borderRadius: '8px', backgroundColor: selectedProject?._id === proj._id ? '#1e293b' : 'transparent', border: selectedProject?._id === proj._id ? '1px solid #3b82f6' : '1px solid #334155', cursor: 'pointer', transition: '0.2s' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{proj.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{proj.description || 'No description'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right workspace management area */}
        <div style={{ flex: '1', padding: '40px', boxSizing: 'border-box' }}>
          {selectedProject ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
                <div>
                  <h1 style={{ margin: '0', color: '#1e293b', fontSize: '28px', fontWeight: '700' }}>{selectedProject.name}</h1>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>{selectedProject.description}</p>
                </div>

                {/* Admin Task Generation Button */}
                {user.role === 'Admin' && (
                  <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" placeholder="Add Sprint Task Title..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} required style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', width: '220px' }} />
                    <button type="submit" style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>+ Add Task</button>
                  </form>
                )}
              </div>

              {/* Tasks List rendering */}
              <h3 style={{ color: '#475569', marginBottom: '16px' }}>Sprint Backlog Workboard</h3>
              {tasks.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>No tasks loaded in this project sprint baseline yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tasks.map((task) => (
                    <div key={task._id} style={{ backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '15px', fontWeight: '500', color: '#334155' }}>{task.title}</span>
                      <button onClick={() => handleUpdateStatus(task._id, task.status)} style={{
                        padding: '6px 14px', borderRadius: '20px', border: 'none', fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                        backgroundColor: task.status === 'Completed' ? '#dcfce7' : task.status === 'In Progress' ? '#fef9c3' : '#f1f5f9',
                        color: task.status === 'Completed' ? '#15803d' : task.status === 'In Progress' ? '#a16207' : '#475569'
                      }}>
                        {task.status} 🔄
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
              <h2 style={{ margin: '0' }}>No Project Target Selected</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>Select an active architecture block from the left sidebar to orchestrate tasks.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // LOGIN VIEW LAYER (Fallback if user is not authenticated)
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ background: '#2563eb', color: '#ffffff', fontSize: '24px', fontWeight: 'bold', width: '50px', height: '50px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', lineHeight: '50px' }}>T</div>
        <h1 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '800', margin: '0' }}>Sync<span style={{ color: '#3b82f6' }}>Task</span></h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>Enterprise Role-Based Task Management Engine</p>
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', width: '100%', maxWidth: '420px', boxSizing: 'border-box' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', marginBottom: '8px', textAlign: 'center' }}>{isLogin ? 'Welcome Back' : 'Get Started'}</h2>
        
        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#475569' }}>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>
          )}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#475569' }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#475569' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
          </div>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#475569' }}>System Authorization Tier</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                <option value="Member">Team Member (Read/Write Tasks)</option>
                <option value="Admin">System Administrator (Full Board Control)</option>
              </select>
            </div>
          )}
          <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}>
            {isLogin ? 'Sign In to Dashboard' : 'Complete Registration'}
          </button>
        </form>

        {message && <div style={{ color: '#15803d', backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '6px', fontSize: '13px', textAlign: 'center', marginTop: '16px' }}>{message}</div>}
        {error && <div style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '6px', fontSize: '13px', textAlign: 'center', marginTop: '16px' }}>{error}</div>}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
          {isLogin ? "New to the platform? " : "Already have an account? "}
          <span onClick={() => { setIsLogin(!isLogin); setMessage(''); setError(''); }} style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>
            {isLogin ? 'Create an account' : 'Sign in here'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default App;