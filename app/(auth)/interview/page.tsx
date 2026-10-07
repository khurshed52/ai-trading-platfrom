"use client";
import React, { use } from "react";
import { useMemo, useState, useEffect } from "react";
import { debounce, numberTest } from "@/lib/debounce";
import type { User, Todo } from "@/types/auth";
import { title } from "process";
import { set } from "lodash";
export default function InterviewPage() {
  const [value, setValue] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    description: "",
  });

  const [todos, setTodos] = useState<Todo[]>([
    {
      id: 1,
      title: "Create a new project",
      name: "John Doe",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
  ]);
  const handleSearch = useMemo(
    () =>
      debounce((text) => {
        console.log(text);
      }, 5000),
    [],
  );

  const getInitials = (name: string) => {
    const initial = name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toLocaleUpperCase();
    return initial;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/users",
        );
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const user: User[] = await response.json();
        setUsers(user);
      } catch (err) {
        console.log(err);
      } finally {
      }
    };
    fetchData();
  }, []);

   const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = ((e:React.FormEvent<HTMLFormElement>)=> {
    e.preventDefault()
    console.log(formData)
    if(formData.title.trim() === "" || formData.name.trim() === "" || formData.description.trim() === ""){
        alert("Please fill all the fields")
        return
    }
    const newTodo: Todo = {
        id: todos.length + 1,
        title: formData.title,
        name: formData.name,        
        description: formData.description
    }
    setTodos([...todos, newTodo])
    setFormData({
        title: "",
        name: "",
        description: ""
    })
  })

  return (
    <div>
        {
            <div className="space-y-4 grid grid-cols-1 gap-6">
                {
                    todos.map((todo)=> 
                      <ul key={todo.id}>
                        <li> {todo.title}</li>
                        <li> {todo.name}</li>
                        <li> {todo.description}</li>
                      </ul>
                    )
                }
            </div>
        }
      {/* <div className="space-y-4 grid grid-cols-3 gap-6">
        {users.map((user) => (
          <div className="bg-amber-300 p-3 rounded-xs" key={user.id}>
            <div className="flex align-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white font-bold mr-2">
                {getInitials(user.name)}
              </div>
              <div className="flex flex-col">
                <h2 className="text-xl font-bold"> {user.name}</h2>
                <p className="text-sm font-medium">{user.username}</p>
              </div>
            </div>
            <div className="mt-7">
              <div className="flex items-center gap-2">
                <span> Icon</span>
                <span> {user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span> Icon</span>
                <span> {user.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span> Icon</span>
                <span> {user.website}</span>
              </div>
            </div>
          </div>
        ))}
      </div> */}
      {/* to do form area */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="text"  name="title" value={formData.title} onChange={handleChange} placeholder="Enter your Title" className="w-full border-2 border-blue-500 rounded-lg p-2" />
         <input type="text"  name="name"  value={formData.name} onChange={handleChange} placeholder="Enter your Name" className="w-full border-2 border-blue-500 rounded-lg p-2" />
          <input type="text"  name="description"  value={formData.description} onChange={handleChange} placeholder="Enter your Description" className="w-full border-2 border-blue-500 rounded-lg p-2" />
           <button
    type="submit"
    className="bg-blue-600 text-white px-4 py-2 rounded"
  >
    Add Todo
  </button>
      </form>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          handleSearch(e.target.value);
        }}
        placeholder="Enter your name"
        className="w-full border-2 border-blue-500 rounded-lg p-2"
      />
    </div>
  );
}
