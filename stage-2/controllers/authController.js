const bcrypt = require("bcryptjs"); // Use bcryptjs for better compatibility
const oracledb = require("oracledb");
const jwt = require("jsonwebtoken");




exports.login = async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for username: ${username}`);

    try {
        const connection = await oracledb.getPool().getConnection();
        const result = await connection.execute(
            `SELECT user_id, password_hash FROM users WHERE username = :username`,
            { username }
        );

        if (result.rows.length === 0) {
            console.log("Login failed: Username not found");
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const userId = result.rows[0][0];
        const hashedPassword = result.rows[0][1];

        if (!(await bcrypt.compare(password, hashedPassword))) {
            console.log(`Login failed: Incorrect password for user ${username}`);
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

        console.log(`Login successful for user ID: ${userId}`);
        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};





exports.register = async (req, res) => {
    const { username, password } = req.body;
    try {
        const connection = await oracledb.getPool().getConnection();
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log(`Registering user: ${username}`);

        await connection.execute(
            `INSERT INTO users (username, password_hash) VALUES (:username, :password_hash)`, 
            { username, password_hash: hashedPassword }, 
            { autoCommit: true }
        );

        console.log(`User inserted: ${username}`);

        const userResult = await connection.execute(
            `SELECT user_id FROM users WHERE username = :username`, 
            { username }
        );

        const userId = userResult.rows[0]?.[0] || null;
        console.log(`User ID retrieved: ${userId}`);

        await connection.close();
        res.status(201).json({ 
            message: "User registered successfully", 
            userId 
        });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
