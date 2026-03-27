// changePassword.js
// Ejecutar: node changePassword.js
// Dependencias: npm install mongoose bcrypt

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const MONGO_URI = "mongodb://localhost:27017/test"; // base de datos 'test'
const USER_ID = "65a7c485cb42fd77bdf1b919";
const NEW_PASSWORD = "Lomejor12*"; // contraseña solicitada
const SALT_ROUNDS = 10;

async function main() {
    if (!NEW_PASSWORD || NEW_PASSWORD.length < 8) {
        console.error("Error: la contraseña debe tener al menos 8 caracteres.");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI);

        // Modelo mínimo apuntando a la colección 'users'
        const User = mongoose.model(
            "User",
            new mongoose.Schema({ password: String }),
            "users",
        );

        const hash = await bcrypt.hash(NEW_PASSWORD, SALT_ROUNDS);

        // Actualizamos usando la cadena _id (Mongoose la convierte internamente)
        const res = await User.updateOne(
            { _id: USER_ID },
            { $set: { password: hash } },
        );

        const matched = res.matchedCount ?? res.n ?? res.matched ?? 0;
        const modified =
            res.modifiedCount ?? res.nModified ?? res.modified ?? 0;

        if (matched === 0) {
            console.error("No se encontró el usuario con ese _id.");
        } else if (modified === 0) {
            console.log(
                "Usuario encontrado pero la contraseña no fue modificada (posible mismo hash).",
            );
        } else {
            console.log("Contraseña actualizada correctamente.");
        }
    } catch (err) {
        console.error("Error al actualizar:", err);
    } finally {
        await mongoose.disconnect();
    }
}

main();
