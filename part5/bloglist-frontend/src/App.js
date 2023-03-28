import { useState, useEffect } from "react";
import Blog from "./components/Blog";
import blogService from "./services/blogs";
import "./darkMode.css";
import loginService from "./services/login";
import Notification from "./components/notification";
import ErrorMessage from "./components/ErrorMessage";
import LoginForm from "./components/Login";
const App = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [notification, setNotification] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);
  const [loginVisible, setLoginVisible] = useState(false)

  const [newBlogTitle, setNewBlogTitle] = useState("");
  const [newBlogAuthor, setNewBlogAuthor] = useState("");
  const [newBlogUrl, setNewBlogUrl] = useState("");

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs));
  }, []);
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedBlogsUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const user = await loginService.login({
        username,
        password,
      });
      window.localStorage.setItem("loggedBlogsUser", JSON.stringify(user));
      blogService.setToken(user.token);
      setUser(user);
      setUsername("");
      setPassword("");
    } catch (exception) {
      setErrorMessage("Wrong username or password");
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
  };

  const addNewBlog = (event) => {
    event.preventDefault();
    if (!newBlogTitle) {
      alert("title field is empty");
      return;
    }
    if (!newBlogAuthor) {
      alert("Author field is empty");
      return;
    }
    if (!newBlogUrl) {
      alert("url field is empty");
      return;
    }

    const blogObject = {
      title: newBlogTitle,
      author: newBlogAuthor,
      url: newBlogUrl,
    };
    blogService
      .create(blogObject)
      .then((response) => {
        setBlogs(
          blogs.concat({
            title: response.data.title,
            author: response.data.author,
            url: response.data.url,
            id: response.data.id,
          })
        );
        setNotification(`${response.data.title} added successfully! `);
        setTimeout(() => {
          setNotification("");
        }, 3000);
      })
      .catch((error) => {
        setErrorMessage(error.response.data.error);
        setTimeout(() => {
          setErrorMessage("");
        }, 3000);
      });
    setNewBlogAuthor("");
    setNewBlogTitle("");
    setNewBlogUrl("");
  };
  const blogForm = () => (
    <form onSubmit={addNewBlog}>
      <div>
        title{" "}
        <input
          type="text"
          value={newBlogTitle}
          name="title"
          onChange={({ target }) => setNewBlogTitle(target.value)}
        />
      </div>
      <div>
        author{" "}
        <input
          type="text"
          value={newBlogAuthor}
          name="author"
          onChange={({ target }) => setNewBlogAuthor(target.value)}
        />
      </div>
      <div>
        url{" "}
        <input
          type="text"
          value={newBlogUrl}
          name="url"
          onChange={({ target }) => setNewBlogUrl(target.value)}
        />
      </div>
      <button type="submit"> submit </button>
    </form>
  );
  const handleLogout = () => {
    if (user) {
      window.localStorage.removeItem("loggedBlogsUser");
      window.location.href = "/";
    }
  };

  return (
    <div className={`App ${theme}`}>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <Notification message={notification} />
      <ErrorMessage message={errorMessage} />
      {user === null && (
        <LoginForm
          handleLogin={handleLogin}
          setUsername={setUsername}
          setPassword={setPassword}
          username={username}
          password={password}
        />
      )}{" "}
      <br></br>
      {user !== null && (
        <div>
          <div>{`${user.username} is successfully logged in`}</div>
          <button onClick={() => handleLogout()}>logout </button>
        </div>
      )}{" "}
      <br></br>
      {user !== null && (
        <div>
          <h2>Create new blog</h2>
          {blogForm()}
        </div>
      )}
      <h2>blogs</h2>
      {blogs.map((blog) => (
        <Blog key={blog.id} blog={blog} />
      ))}
    </div>
  );
};

export default App;
