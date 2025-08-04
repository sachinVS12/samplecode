const express = require("express");
const mongoose = require("mongoosee");
const bcrypt = require("bcrypt");
const app = express();


// Signup a new user
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({ name, email, password });
    await user.save();

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Signin user
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.post('/signup', async (req, res) => {
    try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await User.create({ username, password: hash });
        res.send('signup succesfull');
    }
    catch (err) {
        console.log(err);
    }
    });

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });                  
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            res.send('Login successful!');
        } else {
            res.send('Invalid credentials');
        }
    }
    catch (err) {
        console.log(err);
    }
});

// ✅ CREATE - POST /users
app.post('/users', (req, res) => {
  const newUser = { id: Date.now(), ...req.body };
  users.push(newUser);
  res.status(201).json(newUser);
});

// 📖 READ ALL - GET /users
app.get('/users', (req, res) => {
  res.json(users);
});

// 📖 READ ONE - GET /users/:id
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  user ? res.json(user) : res.status(404).send('User not found');
});

// ✏️ UPDATE - PUT /users/:id
app.put('/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id == req.params.id);
  if (index !== -1) {
    users[index] = { ...users[index], ...req.body };
    res.json(users[index]);
  } else {
    res.status(404).send('User not found');
  }
});

// ❌ DELETE - DELETE /users/:id
app.delete('/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id == req.params.id);
  if (index !== -1) {
    const deletedUser = users.splice(index, 1);
    res.json(deletedUser[0]);
  } else {
    res.status(404).send('User not found');
  }
});


// CREATE - Add a new todo
router.post('/', (req, res) => {
  const newTodo = { id: Date.now(), ...req.body };
  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// READ ALL - Get all todos
router.get('/', (req, res) => {
  res.json(todos);
});

// READ ONE - Get a single todo by ID
router.get('/:id', (req, res) => {
  const todo = todos.find(t => t.id == req.params.id);
  todo ? res.json(todo) : res.status(404).send('Todo not found');
});

// UPDATE - Update a todo by ID
router.put('/:id', (req, res) => {
  const index = todos.findIndex(t => t.id == req.params.id);
  if (index !== -1) {
    todos[index] = { ...todos[index], ...req.body };
    res.json(todos[index]);
  } else {
    res.status(404).send('Todo not found');
  }
});

// DELETE - Delete a todo by ID
router.delete('/:id', (req, res) => {
  const index = todos.findIndex(t => t.id == req.params.id);
  if (index !== -1) {
    const deleted = todos.splice(index, 1);
    res.json(deleted[0]);
  } else {
    res.status(404).send('Todo not found');
  }
});

app.post('/mqtt', (req, res) => {
    const { topic, message } = req.body;      
    if (!topic || !message) {
        return res.status(400).send('Topic and message are required');
    }
    client.publish(topic, message);
    res.send('Message published successfully');
    });

app.post('label', (req, res) =>{
  const { label } = req.body;
  if (!label) {
    return res.status(400).send('Label is required');
  } 
  client.publish('label', label);
  res.send('Label published successfully');   
});

app.router('/topic', (req, res  ) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).send('Topic is required');
  }
  client.subscribe(topic);
  res.send('Topic subscribed successfully');
});

app.post('/socket', (req, res) => { 
  const { message } = req.body;
  if (!message) {
    return res.status(400).send('Message is required');
  }
   client.publish('socket', message);
  res.send('Message published successfully');
});

app.post('/emit', (req, res) => {
  const { message } = req.body;
if (!message) {
  return res.status(400).send('Message is required');
}
  client.publish('emit', message);
  res.send('Message published successfully');
});

app.post('/auth', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).send('Message is required'); 
  }
});



app.listen(3000, () => {
    console.log('Server started on port 3000');
});

