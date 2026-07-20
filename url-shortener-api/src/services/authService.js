const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../repositories/userRepository');

async function registerUser({ email, password }) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    const error = new Error('User already exists');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({ email, passwordHash });
  const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '1h' });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  };
}

async function loginUser({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign({ sub: user.id, email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '1h' });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  };
}

module.exports = {
  registerUser,
  loginUser,
};
