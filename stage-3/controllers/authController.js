const bcrypt = require("bcryptjs"); // Use bcryptjs for better compatibility
const oracledb = require("oracledb");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { username, password } = req.body;

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

    const userId = result.rows[0].USER_ID;
    const hashedPassword = result.rows[0].PASSWORD_HASH;

    if (!(await bcrypt.compare(password, hashedPassword))) {
      console.log(`Login failed: Incorrect password for user ${username}`);
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

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

    const result = await connection.execute(
      `INSERT INTO users (username, password_hash)
       VALUES (:username, :password_hash)
       RETURNING user_id INTO :user_id`,
      {
        username,
        password_hash: hashedPassword,
        user_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    const userId = result.outBinds.user_id[0];

    await connection.close();

    res.status(201).json({
      message: "User registered successfully",
      user_id: userId
    });

  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

