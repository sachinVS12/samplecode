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

app.post('/task', async (req, res) => {     
try{
    const { task } = req.body;
    const user = await User.findById(req.session.userId);
    user.tasks.push(task);
    await user.save();
    res.send('Task added successfully!');
}
catch (err) {
    console.log(err);
}
});


app.get('/id:tasks', async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        res.json(user.tasks);
    } catch (err) {
        console.log(err);
    }
});
app.post('/erros', async (req, res) => {
  try{
    const { username, password } = req.body;
    const user = await user.findOne({ username });
  }catch(err){
    console.log(err);
  }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

