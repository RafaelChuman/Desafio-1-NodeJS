const express = require('express');
const cors = require('cors');
const {v4: uuidv4} = require('uuid');


// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const {username} = request.headers;

    const isUserExists = users.find(aUser => aUser.username === username);

    if(isUserExists){
      request.user = isUserExists;
      return next();
    }

    return response.status(404).json({error: 'User not found'});

}

app.post('/users', (request, response) => {
  
  const {name, username} = request.body;

  const isUserExists = users.find(aUser => aUser.username === username);

  const user = {
    id: uuidv4(),
    name,
    username,
    todos:[]
  };

   if(isUserExists) {
     return response.status(400).json({error: 'username Already exists'});
   };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const {user} = request;

    return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;
  

  const toDo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(toDo);

  return response.status(201).json(toDo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;
  const {id} = request.params;

  const toDo = user.todos.find(aToDo => aToDo.id == id);

  if(!toDo) {response.status(404).json({error: 'ToDo not found'})};

  toDo.title = title;
  toDo.deadLine = new Date(deadline);

  return response.status(200).json(toDo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  
  const toDo = user.todos.find(aToDo => aToDo.id == id);


  if(!toDo) response.status(404).json({error: 'ToDo not found'})

  toDo.done = true;

  return response.json(toDo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const toDoIndex = user.todos.findIndex(aToDo => aToDo.id == id);

  if(toDoIndex == -1) response.status(404).json({error: 'ToDo not found'})

  user.todos.splice(toDoIndex, 1);

  return response.status(204).json();

});

module.exports = app;