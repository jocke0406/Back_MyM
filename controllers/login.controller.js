const client = require('../utils').dbClient;
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const db = client.db(process.env.MONGO_DB_DATABASE);
const collection = db.collection('users');
const nodemailer = require('nodemailer');

exports.login = async (req, res) => {

    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });

    const { body } = req;
    const { error, value } = schema.validate(body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const user = await collection.findOne({ email: value.email });
    if (!user) {
        return res.status(400).json({ message: 'Utilisateur Inconnu' });
    }

    if (user.deletedAt !== null && user.deletedAt !== undefined) {
        return res.status(400).json({ message: 'Ce compte a été supprimé' });
    }


    const match = await bcrypt.compare(value.password, user.password);
    if (!match) {
        return res.status(400).json({ message: 'Mot de passe Incorrect' });
    }

    let role;
    if (value.email === process.env.ADMIN_EMAIL) {
        role = 'masterOfUnivers';
    } else {
        role = user.role;
    }

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

exports.changePassword = async (req, res) => {
    const schema = Joi.object({
        userId: Joi.string().hex().length(24).required(),
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().min(8).required(),
    });

    const { body } = req;
    const { error, value } = schema.validate(body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const user = await collection.findOne({ _id: new ObjectId(value.userId) });

    if (!user) {
        return res.status(400).json({ message: 'Utilisateur Inconnu' });
    }

    const match = await bcrypt.compare(value.oldPassword, user.password);
    if (!match) {
        return res.status(400).json({ message: 'Ancien mot de passe Incorrect' });
    }

    const hash = await bcrypt.hash(value.newPassword, 10);

    await collection.updateOne(
        { _id: new ObjectId(value.userId) },
        {
            $set: {
                password: hash,
                updatedAt: new Date()
            }
        }
    );

    res.status(200).json({ message: 'Mot de passe changé avec succès' });
}

exports.forgotPassword = async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
    });

    const { body } = req;
    const { error, value } = schema.validate(body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const user = await collection.findOne({ email: value.email });

    if (!user) {
        return res.status(400).json({ message: 'Adresse e-mail non trouvée' });
    }

    if (user.deletedAt !== null && user.deletedAt !== undefined) {
        return res.status(400).json({ message: 'Ce compte a été supprimé' });
    }

    const resetToken = jwt.sign(
        {
            _id: user._id,
            email: user.email,
            pseudo: user.pseudo
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    await collection.updateOne(
        { _id: user._id },
        {
            $set: {
                passwordResetToken: resetToken,
                passwordResetExpires: Date.now() + 3600000
            }
        }
    );
    const resetPasswordUrl = process.env.RESET_PASSWORD_URL + `?resetToken=${resetToken}`;


    const mailOptions = {
        from: process.env.TRANSPORT_USER,
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe',
        text: `Cliquez sur le lien suivant pour réinitialiser votre mot de passe: ${resetPasswordUrl}`,
        html: `<p>Cliquez sur le <a href="${resetPasswordUrl}">lien suivant</a> pour réinitialiser votre mot de passe.</p>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            return res.status(500).json({ message: "Erreur lors de l'envoi de l'e-mail" });
        } else {
            console.log('Email envoyé: ' + info.response);
            return res.status(200).json({ message: 'E-mail de réinitialisation envoyé' });
        }
    });
};

exports.reinitializePassword = async (req, res) => {
    const schema = Joi.object({
        resetToken: Joi.string().required(),
        newPassword: Joi.string().min(8).required(),
    });

    const { body } = req;
    const { error, value } = schema.validate(body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    let decoded;
    try {
        decoded = jwt.verify(value.resetToken, process.env.JWT_SECRET);
        console.log(decoded)
    } catch (e) {
        return res.status(400).json({ message: 'Token de réinitialisation invalide' });
    }

    const user = await collection.findOne({ _id: new ObjectId(decoded._id) });

    if (!user) {

        return res.status(400).json({ message: 'Utilisateur Inconnu' });
    }

    if (user.passwordResetToken !== value.resetToken || Date.now() > user.passwordResetExpires) {
        return res.status(400).json({ message: 'Token de réinitialisation invalide ou expiré' });
    }

    const hash = await bcrypt.hash(value.newPassword, 10);

    await collection.updateOne(
        { _id: user._id },
        {
            $set: {
                password: hash,
                passwordResetToken: null,
                passwordResetExpires: null,
                updatedAt: new Date()
            }
        }
    );

    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
};


const transporter = nodemailer.createTransport({
    host: process.env.TRANSPORT_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.TRANSPORT_USER,
        pass: process.env.TRANSPORT_PWD,
    },
    tls: {
        rejectUnauthorized: false
    }
});
