const express = require("express");

const app = express();

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await User.create({ username, password: hash });
    res.send('signup succesfull');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        res.send('Login successful!');
    } else {
        res.send('Invalid credentials');
    }
});

app.post('/signin', async (req, res) => {
    const { username, password } = req.body;
    const user = await user.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        res.send('Login successful!');
    } else {
        res.send('Invalid credential');
    }
});

app.listen (3000,()=>{
    console.log("listning port")
}
)