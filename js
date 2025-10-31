const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Remplace par ton URI MongoDB Atlas
const MONGO_URI = 'mongodb+srv://<username>:<password>@cluster.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.log(err));

// Modèle utilisateur
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: { type: String, enum: ['coach', 'eleve'], default: 'eleve' }
});
const User = mongoose.model('User', UserSchema);

// Modèle entraînement
const TrainingSchema = new mongoose.Schema({
  title: String,
  description: String,
  exercises: [String],
  coachId: String
});
const Training = mongoose.model('Training', TrainingSchema);

// ROUTES

// Création d'un compte
app.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hash, role });
  await user.save();
  res.json({ message: 'Utilisateur créé !' });
});

// Connexion
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Utilisateur non trouvé' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Mot de passe incorrect' });
  
  const token = jwt.sign({ id: user._id, role: user.role }, 'SECRET_KEY');
  res.json({ token, role: user.role });
});

// Ajouter un entraînement (coach uniquement)
app.post('/training', async (req, res) => {
  const { token, title, description, exercises } = req.body;
  try {
    const decoded = jwt.verify(token, 'SECRET_KEY');
    if (decoded.role !== 'coach') return res.status(403).json({ error: 'Non autorisé' });

    const training = new Training({ title, description, exercises, coachId: decoded.id });
    await training.save();
    res.json({ message: 'Entraînement ajouté !' });
  } catch (err) {
    res.status(400).json({ error: 'Token invalide' });
  }
});

// Lister les entraînements
app.get('/trainings', async (req, res) => {
  const trainings = await Training.find();
  res.json(trainings);
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
