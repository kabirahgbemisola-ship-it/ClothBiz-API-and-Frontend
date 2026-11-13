
import jwt from "jsonwebtoken";

export function loadConfig(env = process.env) {
    const required = [
        "MONGODB_URI",
        "JWT_SECRET_KEY",
        "JWT_EXPIRY",
        "JWT_REFRESH_SECRET",
        "JWT_REFRESH_EXPIRY",
        "PORT",
    ];

    const missing = required.filter((key) => !env[key]?.trim());

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}`
        );
    }

    const mongoUri = env.MONGODB_URI.trim();
    const jwtSecret = env.JWT_SECRET_KEY.trim();
    const jwtExpiry = env.JWT_EXPIRY.trim();
    const jwtRefreshSecret = env.JWT_REFRESH_SECRET.trim();
    const jwtRefreshExpiry = env.JWT_REFRESH_EXPIRY.trim();

    if (jwtSecret.length < 32) {
        throw new Error(
            "JWT_SECRET_KEY must be at least 32 characters long"
        );
    }

    if (jwtRefreshSecret.length < 32) {
        throw new Error(
            "JWT_REFRESH_SECRET must be at least 32 characters long"
        );
    }

    if (!/^mongodb(\+srv)?:\/\//.test(mongoUri)) {
    throw new Error(
        "MONGODB_URI must use the mongodb:// or mongodb+srv:// scheme"
    );
}

    try {
        jwt.sign({}, jwtSecret, { expiresIn: jwtExpiry });
        jwt.sign({}, jwtRefreshSecret, { expiresIn: jwtRefreshExpiry });
    } catch {
        throw new Error(
            "JWT_EXPIRY and JWT_REFRESH_EXPIRY must be valid jsonwebtoken expiration values"
        );
    }

    const port = Number(env.PORT);

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error(
            "PORT must be an integer between 1 and 65535"
        );
    }

    return {
        mongoUri,
        jwtSecret,
        jwtExpiry,
        jwtRefreshSecret,
        jwtRefreshExpiry,
        port,
    };
}
