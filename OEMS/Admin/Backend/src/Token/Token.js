import jwt from 'jsonwebtoken';
import dotenv from "dotenv"


dotenv.config()
export function generateTokenResponse(user) {
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
        },
        process.env.SECRET_KEY,
        { expiresIn: '30d' }
    );

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
        },
    };
}
