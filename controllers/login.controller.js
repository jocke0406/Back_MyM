const client = require('../utils').dbClient;
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const db = client.db(process.env.MONGO_DB_DATABASE);
const collection = db.collection('users');

exports.login = async (req, res) => {
    // Validation du schéma de la demande
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });

    const { body } = req;
    const { error, value } = schema.validate(body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Vérification de l'utilisateur dans la base de données
    const user = await collection.findOne({ email: value.email });
    if (!user) {
        return res.status(400).json({ message: 'Utilisateur Inconnu' });
    }

    // Comparaison du mot de passe
    const match = await bcrypt.compare(value.password, user.password);
    if (!match) {
        return res.status(400).json({ message: 'Mot de passe Incorrect' });
    }

    // Détermination du rôle de l'utilisateur
    let role;
    if (value.email === process.env.ADMIN_EMAIL) {
        role = 'masterOfUnivers';
    } else {
        role = user.role;
    }

    // Génération du JWT
    const token = jwt.sign(
        {
            _id: user._id,
            email: user.email,
            role: role,
            pseudo: user.pseudo,
        },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
    );

    res.status(200).json({
        message: 'Bingo ! Utilisateur Entré !',
        token: token,
    });
};
